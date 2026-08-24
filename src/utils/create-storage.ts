export interface Storage<T> {
  load: () => Promise<T>;
  save: (value: T) => Promise<void>;
  subscribe: (listener: (value: T) => void) => () => void;
}

const SERVER_SYNC_URL = "http://localhost:3001/api/sync";

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && !!chrome.storage?.local;
}

async function fetchServerValue<T>(key: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(`${SERVER_SYNC_URL}?key=${encodeURIComponent(key)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data.value as T;
    }
  } catch {
    // Sync server is offline or unreachable - ignore quietly
  }
  return null;
}

async function postServerValue<T>(key: string, value: T): Promise<void> {
  try {
    await fetch(SERVER_SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  } catch {
    // Sync server is offline - ignore quietly
  }
}

export function createStorage<T>(key: string, fallback: T): Storage<T> {
  const listeners = new Set<(value: T) => void>();
  let lastSerializedValue: string | null = null;

  async function loadLocal(): Promise<T> {
    if (hasChromeStorage()) {
      const stored = await chrome.storage.local.get(key);
      return (stored[key] as T | undefined) ?? fallback;
    }

    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  }

  async function saveLocal(value: T): Promise<void> {
    if (hasChromeStorage()) {
      await chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  async function load(): Promise<T> {
    const localVal = await loadLocal();

    const serverVal = await fetchServerValue<T>(key);
    if (serverVal !== null) {
      const serverStr = JSON.stringify(serverVal);
      if (serverStr !== JSON.stringify(localVal)) {
        await saveLocal(serverVal);
        lastSerializedValue = serverStr;
        return serverVal;
      }
    } else if (JSON.stringify(localVal) !== JSON.stringify(fallback)) {
      // Auto Migrate: SQLite DB doesn't have data for key yet, but local browser does -> migrate to SQLite!
      postServerValue(key, localVal);
    }

    lastSerializedValue = JSON.stringify(localVal);
    return localVal;
  }

  async function save(value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    lastSerializedValue = serialized;

    listeners.forEach((listener) => listener(value));
    await saveLocal(value);

    // Sync in background to SQLite server (if online)
    postServerValue(key, value);
  }

  function subscribe(listener: (value: T) => void): () => void {
    listeners.add(listener);

    // Periodically poll local server for cross-browser sync updates (Chrome <-> Brave)
    const interval = setInterval(async () => {
      const serverVal = await fetchServerValue<T>(key);
      if (serverVal !== null) {
        const serverStr = JSON.stringify(serverVal);
        if (serverStr !== lastSerializedValue) {
          lastSerializedValue = serverStr;
          await saveLocal(serverVal);
          listeners.forEach((l) => l(serverVal));
        }
      }
    }, 5000);

    return () => {
      listeners.delete(listener);
      clearInterval(interval);
    };
  }

  return { load, save, subscribe };
}
