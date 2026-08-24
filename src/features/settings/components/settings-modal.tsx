import { Moon, MoonStar, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Settings, ThemeMode } from "../types/settings";
import AccentPicker from "./accent-picker";
import BackgroundPicker from "./background-picker";
import DataSyncSection from "./data-sync-section";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

interface ThemeOption {
  key: ThemeMode;
  label: string;
  icon: typeof Sun;
}

const THEME_OPTIONS: ThemeOption[] = [
  { key: "light", label: "Sáng", icon: Sun },
  { key: "dark", label: "Tối", icon: Moon },
  { key: "auto", label: "Tự động", icon: MoonStar },
];

export default function SettingsModal({
  open,
  onOpenChange,
  settings,
  onChange,
}: SettingsModalProps) {
  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    onChange({ boardName: event.target.value });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="scrollbar-clean max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cài đặt</DialogTitle>
          <DialogDescription>
            Tuỳ chỉnh tên board, giao diện, lưu trữ & đồng bộ dữ liệu.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="board-name">Tên board</Label>
            <Input
              id="board-name"
              value={settings.boardName}
              onChange={handleNameChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Giao diện</Label>
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map((option) => {
                const isActive = settings.theme === option.key;
                const Icon = option.icon;

                return (
                  <Button
                    key={option.key}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => onChange({ theme: option.key })}
                  >
                    <Icon />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Màu chủ đạo</Label>
            <AccentPicker
              value={settings.accentColor}
              onChange={(accentColor) => onChange({ accentColor })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ảnh nền</Label>
            <BackgroundPicker
              value={settings.background}
              onChange={(background) => onChange({ background })}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-surface/50">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="lunar-toggle" className="text-sm font-medium cursor-pointer">
                Hiển thị Lịch Âm ở Header
              </Label>
              <span className="text-xs text-muted-foreground">
                Tự động chuyển đổi và hiển thị ngày Âm lịch Việt Nam
              </span>
            </div>
            <input
              id="lunar-toggle"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand accent-brand cursor-pointer"
              checked={settings.showLunarCalendar ?? true}
              onChange={(e) => onChange({ showLunarCalendar: e.target.checked })}
            />
          </div>

          <DataSyncSection />

        </div>
      </DialogContent>
    </Dialog>
  );
}
