import type { Reminder } from "../types/reminder";

// Nhắc lưu trước khi có previousDueDate sẽ thiếu field này.
export function migrateReminders(reminders: Reminder[]): Reminder[] {
  return reminders.map((reminder) => ({
    ...reminder,
    previousDueDate: reminder.previousDueDate ?? null,
  }));
}
