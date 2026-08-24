import { CalendarDays, Moon } from "lucide-react";
import { formatLunarDate } from "../../../utils/lunar-date";
import { useNow } from "../hooks/use-now";
import { formatClock, formatSolarDate, getGreeting } from "../utils/greeting";

interface GreetingHeaderProps {
  name: string;
  showLunarCalendar?: boolean;
}

export default function GreetingHeader({
  name,
  showLunarCalendar = true,
}: GreetingHeaderProps) {
  const now = useNow();
  const greeting = getGreeting(now.getHours());
  const solarDateStr = formatSolarDate(now);
  const lunarDateStr = formatLunarDate(now, true);

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      {/* Title & Clock */}
      <div className="inline-flex items-center gap-2">
        <span className="text-xl leading-none" aria-hidden="true">
          {greeting.emoji}
        </span>
        <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {greeting.text}, <span className="text-brand">{name}</span>
          <span className="mx-2 font-normal text-muted/40">—</span>
          <span className="tabular-nums font-semibold text-foreground/90">
            {formatClock(now)}
          </span>
        </h1>
      </div>

      {/* Date & Lunar Date Badge */}
      <div className="inline-flex items-center gap-2">
        <span className="hidden text-muted/30 sm:inline" aria-hidden="true">
          •
        </span>
        <div className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1 text-xs font-medium text-foreground/80 ring-1 ring-border/80 shadow-2xs backdrop-blur-md sm:text-sm">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-brand" />
            <span>{solarDateStr}</span>
          </div>

          {showLunarCalendar && (
            <>
              <span className="text-muted/30" aria-hidden="true">
                |
              </span>
              <div className="flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-muted-foreground">{lunarDateStr}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
