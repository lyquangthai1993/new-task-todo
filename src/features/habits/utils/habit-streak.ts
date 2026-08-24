import type { Habit } from "../types/habit";

export function getTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isHabitCompletedToday(habit: Habit): boolean {
  const today = getTodayStr();
  return (habit.completedDates ?? []).includes(today);
}

export function toggleHabitToday(habit: Habit): Habit {
  const today = getTodayStr();
  const completed = habit.completedDates ?? [];
  let updated: string[];

  if (completed.includes(today)) {
    updated = completed.filter((d) => d !== today);
  } else {
    updated = [...completed, today];
  }

  return { ...habit, completedDates: updated };
}

export function calculateStreak(habit: Habit): number {
  const completedSet = new Set(habit.completedDates ?? []);
  if (completedSet.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let curr = new Date(today);

  const todayStr = getTodayStr();
  if (!completedSet.has(todayStr)) {
    // Nếu hôm nay chưa check-in, thử kiểm tra từ ngày hôm qua
    curr.setDate(curr.getDate() - 1);
  }

  while (true) {
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, "0");
    const day = String(curr.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    if (completedSet.has(dateStr)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export interface DayStatus {
  label: string;
  dateStr: string;
  isCompleted: boolean;
  isToday: boolean;
}

export function getLast7DaysStatus(habit: Habit): DayStatus[] {
  const completedSet = new Set(habit.completedDates ?? []);
  const todayStr = getTodayStr();
  const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const result: DayStatus[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    result.push({
      label: dayLabels[d.getDay()],
      dateStr,
      isCompleted: completedSet.has(dateStr),
      isToday: dateStr === todayStr,
    });
  }

  return result;
}
