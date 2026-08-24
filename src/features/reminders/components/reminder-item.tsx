import { Check, Pencil, Trash2 } from "lucide-react";
import { IconButton } from "../../../components/icon-button";
import { cn } from "../../../utils/cn";
import { daysFromToday, getTodayIso } from "../../../utils/date";
import { getPersonOption } from "../constants/reminder-options";
import type { Reminder } from "../types/reminder";
import { getCadenceLabel, getDueLabel, getDueTone } from "../utils/recurrence";

interface ReminderItemProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
}

const DUE_TONE_CLASS = {
  overdue: "text-red-600 dark:text-red-400",
  today: "text-amber-600 dark:text-amber-400",
  upcoming: "text-muted",
} as const;

export default function ReminderItem({
  reminder,
  onToggle,
  onEdit,
  onDelete,
}: ReminderItemProps) {
  const person = getPersonOption(reminder.person);
  const tone = getDueTone(reminder.nextDueDate);

  const isDoneToday = reminder.lastCompletedDate === getTodayIso();
  const isDue = daysFromToday(reminder.nextDueDate) <= 0;
  // Đã tick thì luôn cho bấm lại để bỏ tick (kể cả khi lần tới đã dời đi xa).
  const canToggle = isDoneToday || isDue;

  return (
    <li className="group flex items-center gap-3 rounded-lg px-1 py-2 hover:bg-background">
      <IconButton
        icon={Check}
        label={isDoneToday ? "Bỏ đánh dấu đã làm" : "Đánh dấu đã làm"}
        disabled={!canToggle}
        onClick={() => onToggle(reminder.id)}
        className={cn(
          "h-6 w-6 rounded-full border",
          isDoneToday &&
            "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white",
          !isDoneToday &&
            canToggle &&
            "border-brand text-brand hover:bg-brand hover:text-white",
          !canToggle &&
            "border-muted text-transparent disabled:hover:bg-transparent",
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold",
              person.chipClass,
            )}
          >
            {person.label}
          </span>
          <p
            title={reminder.title}
            className={cn(
              "min-w-0 flex-1 truncate text-sm font-medium text-foreground",
              isDoneToday && "text-muted line-through",
            )}
          >
            {reminder.title}
          </p>
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {getCadenceLabel(reminder.interval, reminder.unit)} ·{" "}
          {isDoneToday ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              Đã xong hôm nay
            </span>
          ) : (
            <span className={cn("font-medium", DUE_TONE_CLASS[tone])}>
              {getDueLabel(reminder.nextDueDate)}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-0.5">
        <IconButton
          icon={Pencil}
          label="Sửa nhắc"
          onClick={() => onEdit(reminder)}
          className="pointer-events-none opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
        />
        <IconButton
          icon={Trash2}
          label="Xoá nhắc"
          onClick={() => onDelete(reminder.id)}
          className="pointer-events-none opacity-0 transition-opacity hover:text-rose-500 group-hover:pointer-events-auto group-hover:opacity-100"
        />
      </div>
    </li>
  );
}
