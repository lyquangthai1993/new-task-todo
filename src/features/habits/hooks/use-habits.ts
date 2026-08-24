import { useLocalState } from "../../../hooks/use-local-state";
import { createStorage } from "../../../utils/create-storage";
import { HABITS_STORAGE_KEY } from "../constants/storage-keys";
import type { Habit } from "../types/habit";

interface UseHabitsResult {
  habits: Habit[];
  isLoading: boolean;
  addHabit: (name: string) => void;
  renameHabit: (id: string, name: string) => void;
  deleteHabit: (id: string) => void;
}

const habitStorage = createStorage<Habit[]>(HABITS_STORAGE_KEY, []);

export function useHabits(): UseHabitsResult {
  const [habits, persist, isLoading] = useLocalState<Habit[]>(habitStorage, []);

  function addHabit(name: string): void {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
    };

    persist([...habits, newHabit]);
  }

  function renameHabit(id: string, name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;

    persist(
      habits.map((habit) =>
        habit.id === id ? { ...habit, name: trimmed } : habit,
      ),
    );
  }

  function deleteHabit(id: string): void {
    persist(habits.filter((habit) => habit.id !== id));
  }

  return {
    habits,
    isLoading,
    addHabit,
    renameHabit,
    deleteHabit,
  };
}
