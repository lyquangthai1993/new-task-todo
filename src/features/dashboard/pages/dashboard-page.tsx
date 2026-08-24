import { BookmarksWidget } from "@/features/bookmarks/components";
import { Settings } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Button } from "../../../components/button";
import { cn } from "../../../utils/cn";
import { HabitsWidget } from "../../habits/components";
import { RemindersWidget } from "../../reminders/components";
import { useSettings } from "../../settings/hooks/use-settings";
import { TodoWidget } from "../../todo/components";
import AlertsWidget from "../components/alerts-widget";
import GreetingHeader from "../components/greeting-header";

const SettingsModal = lazy(() =>
  import("../../settings/components/settings-modal").then((module) => ({
    default: module.default,
  })),
);

export default function DashboardPage() {
  const { settings, updateSettings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col p-3">
      <div
        className={cn(
          "flex flex-1 flex-col rounded-3xl p-3 ring-1 ring-border-card backdrop-blur-xl sm:p-4",
        )}
      >
        <header className="mb-3 flex items-center justify-between rounded-full bg-surface p-2 px-4 ring-1 ring-border-card">
          <GreetingHeader name={settings.boardName} />
          <Button
            variant="primary"
            className="rounded-full"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Cài đặt
          </Button>
        </header>

        <div className="flex flex-1 flex-col gap-3">
          <div className="grid flex-1 gap-3 lg:grid-cols-6">
            <div className="flex h-full flex-col lg:col-span-4">
              <TodoWidget />
            </div>
            <div className="lg:col-span-2">
              <AlertsWidget />
            </div>
          </div>

          <div className="grid items-stretch gap-3 lg:grid-cols-4">
            <div className="flex lg:col-span-2">
              <HabitsWidget />
            </div>
            <div className="flex lg:col-span-1">
              <RemindersWidget />
            </div>
            <div className="flex lg:col-span-1">
              <BookmarksWidget />
            </div>
          </div>
        </div>
      </div>

      <Suspense>
        <SettingsModal
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          settings={settings}
          onChange={updateSettings}
        />
      </Suspense>
    </div>
  );
}
