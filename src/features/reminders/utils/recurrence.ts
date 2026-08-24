import {
  addDays,
  addMonths,
  daysFromToday,
  formatIsoDate,
  getTodayIso,
  parseIsoDate,
} from "../../../utils/date";
import type { Reminder, ReminderUnit } from "../types/reminder";

export type DueTone = "overdue" | "today" | "upcoming";

export function addInterval(
  iso: string,
  interval: number,
  unit: ReminderUnit,
): string {
  const date = parseIsoDate(iso);

  if (unit === "day") return formatIsoDate(addDays(date, interval));
  if (unit === "week") return formatIsoDate(addDays(date, interval * 7));

  return formatIsoDate(addMonths(date, interval));
}

// Hoàn thành 1 lần → đẩy sang lần kế. Nếu lần kế vẫn ≤ hôm nay (bị trễ nhiều)
// thì tính từ hôm nay để không kẹt ở quá khứ.
export function completeReminder(reminder: Reminder): Reminder {
  let next = addInterval(reminder.nextDueDate, reminder.interval, reminder.unit);

  if (daysFromToday(next) <= 0) {
    next = addInterval(getTodayIso(), reminder.interval, reminder.unit);
  }

  return {
    ...reminder,
    nextDueDate: next,
    lastCompletedDate: getTodayIso(),
    previousDueDate: reminder.nextDueDate,
  };
}

// Bỏ tick → trả về đúng ngày trước đó. Nhắc cũ (lưu trước khi có
// previousDueDate) thì lùi lại 1 chu kỳ — gần đúng nhưng không có gì tốt hơn.
export function undoReminder(reminder: Reminder): Reminder {
  const restored =
    reminder.previousDueDate ??
    addInterval(reminder.nextDueDate, -reminder.interval, reminder.unit);

  return {
    ...reminder,
    nextDueDate: restored,
    lastCompletedDate: null,
    previousDueDate: null,
  };
}

export function getDueTone(nextDueDate: string): DueTone {
  const diff = daysFromToday(nextDueDate);

  if (diff < 0) return "overdue";
  if (diff === 0) return "today";

  return "upcoming";
}

export function getDueLabel(nextDueDate: string): string {
  const diff = daysFromToday(nextDueDate);

  if (diff < 0) return `Quá hạn ${-diff} ngày`;
  if (diff === 0) return "Hôm nay";
  if (diff === 1) return "Ngày mai";

  const date = parseIsoDate(nextDueDate);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

export function getCadenceLabel(interval: number, unit: ReminderUnit): string {
  const unitLabel = unit === "day" ? "ngày" : unit === "week" ? "tuần" : "tháng";

  return interval === 1 ? `Mỗi ${unitLabel}` : `Mỗi ${interval} ${unitLabel}`;
}
