import { Check, Flame, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { IconButton } from "../../../components/icon-button";
import { cn } from "../../../utils/cn";
import type { Habit } from "../types/habit";
import {
  calculateStreak,
  getLast7DaysStatus,
  isHabitCompletedToday,
} from "../utils/habit-streak";

interface HabitItemProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default function HabitItem({
  habit,
  onToggle,
  onRename,
  onDelete,
}: HabitItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(habit.name);

  const completedToday = isHabitCompletedToday(habit);
  const streak = calculateStreak(habit);
  const last7Days = getLast7DaysStatus(habit);

  function startEdit(): void {
    setDraft(habit.name);
    setIsEditing(true);
  }

  function commit(): void {
    onRename(habit.id, draft);
    setIsEditing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") commit();
    if (event.key === "Escape") setIsEditing(false);
  }

  return (
    <li className="group relative flex flex-col gap-2 rounded-xl border border-border/50 bg-card/40 p-3 transition-all duration-200 hover:border-brand/30 hover:bg-card hover:shadow-md">
      <div className="flex items-center gap-3">
        {/* Toggle Complete Button */}
        <button
          type="button"
          onClick={() => onToggle(habit.id)}
          title={completedToday ? "Bỏ hoàn thành hôm nay" : "Đánh dấu hoàn thành hôm nay"}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 active:scale-90",
            completedToday
              ? "border-emerald-500/60 bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "border-border/80 bg-background/50 text-transparent hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-500/40",
          )}
        >
          <Check className={cn("h-4 w-4 stroke-[3]", completedToday ? "scale-100" : "scale-75")} />
        </button>

        {/* Habit Name / Edit Input */}
        {isEditing ? (
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <button
              type="button"
              onDoubleClick={startEdit}
              title={habit.name}
              className={cn(
                "min-w-0 flex-1 truncate text-left text-sm font-semibold transition-colors",
                completedToday ? "text-foreground line-through opacity-85" : "text-foreground",
              )}
            >
              {habit.name}
            </button>

            {/* Streak Counter Pill */}
            {streak > 0 && (
              <span className="flex shrink-0 items-center gap-1 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500/15 to-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-orange-500 shadow-xs">
                <Flame className="h-3 w-3 fill-orange-500 animate-pulse" />
                {streak} ngày
              </span>
            )}
          </div>
        )}

        {/* Actions (Pencil / Trash) */}
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <IconButton
            icon={Pencil}
            label="Sửa thói quen"
            onClick={startEdit}
          />
          <IconButton
            icon={Trash2}
            label="Xoá thói quen"
            onClick={() => onDelete(habit.id)}
            className="hover:text-rose-500"
          />
        </div>
      </div>

      {/* 7-Day Mini Consistency Tracker */}
      <div className="flex items-center justify-between pt-1 border-t border-border/30">
        <span className="text-[10px] font-medium text-muted uppercase tracking-wider">7 ngày gần nhất</span>
        <div className="flex items-center gap-1">
          {last7Days.map((day) => (
            <div
              key={day.dateStr}
              title={`${day.label} (${day.dateStr}): ${day.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"}`}
              className={cn(
                "flex h-4 min-w-[20px] items-center justify-center rounded px-1 text-[9px] font-bold transition-all",
                day.isCompleted
                  ? "bg-emerald-500 text-white shadow-xs"
                  : day.isToday
                    ? "border border-amber-500/60 bg-amber-500/10 text-amber-500"
                    : "bg-muted/20 text-muted-foreground/60",
              )}
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>
    </li>
  );
}
