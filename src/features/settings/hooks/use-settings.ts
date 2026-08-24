import { useEffect } from "react";
import { useLocalState } from "../../../hooks/use-local-state";
import { createStorage } from "../../../utils/create-storage";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  getAccentOption,
  getBackgroundUrl,
  resolveTheme,
} from "../constants/settings-options";
import type { Settings } from "../types/settings";

interface UseSettingsResult {
  settings: Settings;
  isLoading: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
}

const settingsStorage = createStorage<Settings>(
  SETTINGS_STORAGE_KEY,
  DEFAULT_SETTINGS,
);

function mergeDefaults(loaded: Settings): Settings {
  return { ...DEFAULT_SETTINGS, ...loaded };
}

export function useSettings(): UseSettingsResult {
  const [settings, persist, isLoading] = useLocalState<Settings>(
    settingsStorage,
    DEFAULT_SETTINGS,
    mergeDefaults,
  );

  useEffect(() => {
    function applyTheme(): void {
      const resolved = resolveTheme(settings.theme, new Date().getHours());
      document.documentElement.classList.toggle("dark", resolved === "dark");
    }

    applyTheme();

    // Chỉ mode auto mới cần theo dõi giờ để tự đổi sáng/tối.
    if (settings.theme !== "auto") return;

    const intervalId = window.setInterval(applyTheme, 60_000);

    return () => window.clearInterval(intervalId);
  }, [settings.theme]);

  useEffect(() => {
    const accent = getAccentOption(settings.accentColor);
    const root = document.documentElement;
    root.style.setProperty("--brand", accent.base);
    root.style.setProperty("--brand-hover", accent.hover);
  }, [settings.accentColor]);

  useEffect(() => {
    const url = getBackgroundUrl(settings.background);
    document.body.style.backgroundImage = url ? `url("${url}")` : "";
  }, [settings.background]);

  function updateSettings(patch: Partial<Settings>): void {
    persist({ ...settings, ...patch });
  }

  return { settings, isLoading, updateSettings };
}
