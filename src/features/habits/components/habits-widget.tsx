import { WidgetCard } from "../../../components/widget-card";
import { useHabits } from "../hooks/use-habits";
import AddHabitForm from "./add-habit-form";
import HabitItem from "./habit-item";

export default function HabitsWidget() {
  const { habits, isLoading, addHabit, renameHabit, deleteHabit } = useHabits();

  return (
    <WidgetCard
      title="Thói quen"
      icon={
        <img
          src="/icons/habit.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
      }
      bodyClassName="flex flex-col"
    >
      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted">Đang tải…</p>
      ) : habits.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted opacity-70">
          Chưa có thói quen nào
        </p>
      ) : (
        <ul className="mb-3 flex flex-1 flex-col">
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onRename={renameHabit}
              onDelete={deleteHabit}
            />
          ))}
        </ul>
      )}

      <div className="mt-auto">
        <AddHabitForm onAdd={addHabit} />
      </div>
    </WidgetCard>
  );
}
