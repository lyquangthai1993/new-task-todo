export const ALL_STORAGE_KEYS = [
  "tasks",
  "settings",
  "reminders",
  "habits",
  "bookmarks",
  "vocabulary",
  "vocabulary_daily",
];

const SERVER_URL = "http://localhost:3001";

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && !!chrome.storage?.local;
}

export interface SyncHealth {
  connected: boolean;
  dbPath?: string;
}

export async function checkSyncServerHealth(): Promise<SyncHealth> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(`${SERVER_URL}/api/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { connected: true, dbPath: data.db };
    }
  } catch {
    // server offline
  }
  return { connected: false };
}

export async function migrateLocalDataToSQLite(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const health = await checkSyncServerHealth();
    if (!health.connected) {
      return { success: false, message: "SQLite Server chưa bật. Hãy chạy 'npm run server'.", count: 0 };
    }

    const payload: Record<string, unknown> = {};

    if (hasChromeStorage()) {
      const stored = await chrome.storage.local.get(ALL_STORAGE_KEYS);
      ALL_STORAGE_KEYS.forEach((key) => {
        if (stored[key] !== undefined) {
          payload[key] = stored[key];
        }
      });
    } else {
      ALL_STORAGE_KEYS.forEach((key) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            payload[key] = JSON.parse(raw);
          } catch {
            payload[key] = raw;
          }
        }
      });
    }

    const keysToMigrate = Object.keys(payload);
    if (keysToMigrate.length === 0) {
      return { success: true, message: "Không tìm thấy dữ liệu cũ trong bộ nhớ trình duyệt.", count: 0 };
    }

    let count = 0;
    for (const [key, value] of Object.entries(payload)) {
      await fetch(`${SERVER_URL}/api/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      count++;
    }

    return {
      success: true,
      message: `Đã chuyển đổi thành công ${count} danh mục dữ liệu từ Chrome sang file SQLite!`,
      count,
    };
  } catch (err) {
    return {
      success: false,
      message: `Lỗi chuyển đổi dữ liệu: ${err instanceof Error ? err.message : "Unknown error"}`,
      count: 0,
    };
  }
}

export async function exportAllData(): Promise<void> {
  const exportPayload: Record<string, unknown> = {};

  if (hasChromeStorage()) {
    const allStored = await chrome.storage.local.get(ALL_STORAGE_KEYS);
    ALL_STORAGE_KEYS.forEach((key) => {
      if (allStored[key] !== undefined) {
        exportPayload[key] = allStored[key];
      }
    });
  } else {
    ALL_STORAGE_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          exportPayload[key] = JSON.parse(raw);
        } catch {
          exportPayload[key] = raw;
        }
      }
    });
  }

  const backupData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    data: exportPayload,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().slice(0, 10);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `new-tab-todo-backup-${timestamp}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function importDataFromFile(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        const dataToImport = parsed.data || parsed;

        if (typeof dataToImport !== "object" || dataToImport === null) {
          resolve({ success: false, message: "File backup không đúng định dạng." });
          return;
        }

        for (const [key, value] of Object.entries(dataToImport)) {
          if (hasChromeStorage()) {
            await chrome.storage.local.set({ [key]: value });
          } else {
            localStorage.setItem(key, JSON.stringify(value));
          }

          // Push to sync server if available
          try {
            await fetch(`${SERVER_URL}/api/sync`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key, value }),
            });
          } catch {
            // ignore server offline
          }
        }

        resolve({ success: true, message: "Đã nhập dữ liệu thành công! Đang tải lại..." });
      } catch {
        resolve({ success: false, message: "Lỗi đọc file JSON. Vui lòng kiểm tra lại file." });
      }
    };
    reader.onerror = () => resolve({ success: false, message: "Lỗi đọc file." });
    reader.readAsText(file);
  });
}

export async function clearAllData(): Promise<{ success: boolean; message: string }> {
  try {
    if (hasChromeStorage()) {
      await chrome.storage.local.clear();
    }
    localStorage.clear();

    try {
      await fetch(`${SERVER_URL}/api/clear`, {
        method: "POST",
      });
    } catch {
      // server offline
    }

    return { success: true, message: "Đã xóa toàn bộ dữ liệu thành công!" };
  } catch (err) {
    return {
      success: false,
      message: `Lỗi khi xóa dữ liệu: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

