import { Flame, Sparkles } from "lucide-react";
import { WidgetCard } from "../../../components/widget-card";
import { useHabits } from "../hooks/use-habits";
import { isHabitCompletedToday } from "../utils/habit-streak";
import AddHabitForm from "./add-habit-form";
import HabitItem from "./habit-item";

export default function HabitsWidget() {
  const { habits, isLoading, addHabit, toggleToday, renameHabit, deleteHabit } = useHabits();

  const totalHabits = habits.length;
  const completedTodayCount = habits.filter(isHabitCompletedToday).length;
  const percent = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

  return (
    <WidgetCard
      title="Rèn luyện thói quen"
      icon={
        <img
          src="/icons/habit.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
      }
      bodyClassName="flex flex-col gap-3"
    >
      {/* Overview Progress Header */}
      {totalHabits > 0 && (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1 text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Tiến độ hôm nay: {completedTodayCount}/{totalHabits}
            </span>
            <span className="text-brand font-bold">{percent}%</span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>

          {percent === 100 && (
            <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
              <Flame className="h-3.5 w-3.5 fill-emerald-500" />
              Tất cả thói quen hôm nay đã hoàn thành! Tiếp tục phát huy!
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted">Đang tải thói quen…</p>
      ) : totalHabits === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Flame className="h-8 w-8 text-muted/40 mb-2" />
          <p className="text-sm font-medium text-foreground">Chưa có thói quen nào</p>
          <p className="text-xs text-muted max-w-[220px] mt-1">
            Thêm các thói quen hàng ngày (ví dụ: Tập thể dục, Đọc sách, Uống 2L nước) để rèn luyện kỷ luật!
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-1 overflow-y-auto max-h-[420px] scrollbar-thin pr-1">
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggle={toggleToday}
              onRename={renameHabit}
              onDelete={deleteHabit}
            />
          ))}
        </ul>
      )}

      <div className="mt-auto pt-1">
        <AddHabitForm onAdd={addHabit} />
      </div>
    </WidgetCard>
  );
}
