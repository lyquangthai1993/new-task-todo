import { useMemo } from "react";
import { useLocalState } from "../../../hooks/use-local-state";
import { createStorage } from "../../../utils/create-storage";
import { daysFromToday, getTodayIso } from "../../../utils/date";
import { REMINDERS_STORAGE_KEY } from "../constants/storage-keys";
import type { Reminder, ReminderPerson, ReminderUnit } from "../types/reminder";
import { migrateReminders } from "../utils/migrate-reminders";
import { completeReminder, undoReminder } from "../utils/recurrence";

interface ReminderInput {
  title: string;
  person: ReminderPerson;
  interval: number;
  unit: ReminderUnit;
  startDate: string;
}

interface UseRemindersResult {
  reminders: Reminder[];
  isLoading: boolean;
  addReminder: (input: ReminderInput) => void;
  editReminder: (id: string, input: ReminderInput) => void;
  toggleToday: (id: string) => void;
  deleteReminder: (id: string) => void;
}

const reminderStorage = createStorage<Reminder[]>(REMINDERS_STORAGE_KEY, []);

// Sắp xếp theo ngày tới hạn tăng dần (quá hạn / hôm nay lên trước).
function sortByDue(reminders: Reminder[]): Reminder[] {
  return [...reminders].sort(
    (first, second) =>
      daysFromToday(first.nextDueDate) - daysFromToday(second.nextDueDate),
  );
}

export function useReminders(): UseRemindersResult {
  const [reminders, persist, isLoading] = useLocalState<Reminder[]>(
    reminderStorage,
    [],
    migrateReminders,
  );

  function addReminder({
    title,
    person,
    interval,
    unit,
    startDate,
  }: ReminderInput): void {
    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      title: title.trim(),
      person,
      interval: Math.max(1, interval),
      unit,
      nextDueDate: startDate,
      lastCompletedDate: null,
      previousDueDate: null,
      createdAt: new Date().toISOString(),
    };

    persist([newReminder, ...reminders]);
  }

  function editReminder(
    id: string,
    { title, person, interval, unit, startDate }: ReminderInput,
  ): void {
    persist(
      reminders.map((reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              title: title.trim(),
              person,
              interval: Math.max(1, interval),
              unit,
              nextDueDate: startDate,
            }
          : reminder,
      ),
    );
  }

  function toggleToday(id: string): void {
    const today = getTodayIso();

    persist(
      reminders.map((reminder) => {
        if (reminder.id !== id) return reminder;

        return reminder.lastCompletedDate === today
          ? undoReminder(reminder)
          : completeReminder(reminder);
      }),
    );
  }

  function deleteReminder(id: string): void {
    persist(reminders.filter((reminder) => reminder.id !== id));
  }

  const sortedReminders = useMemo(() => sortByDue(reminders), [reminders]);

  return {
    reminders: sortedReminders,
    isLoading,
    addReminder,
    editReminder,
    toggleToday,
    deleteReminder,
  };
}
