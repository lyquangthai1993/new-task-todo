import { KANBAN_COLUMNS } from "../constants/kanban-columns";
import type { Task, TaskStatus } from "../types/task";
import KanbanColumn from "./kanban-column";

type MoveDirection = "prev" | "next";

interface KanbanBoardProps {
  tasksByStatus: Record<TaskStatus, Task[]>;
  hiddenColumns: Set<TaskStatus>;
  onMove: (id: string, direction: MoveDirection) => void;
  onMoveToStatus: (id: string, status: TaskStatus) => void;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function KanbanBoard({
  tasksByStatus,
  hiddenColumns,
  onMove,
  onMoveToStatus,
  onView,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  const visibleColumns = KANBAN_COLUMNS.filter((column) => !hiddenColumns.has(column.key));

  return (
    <div className="scrollbar-clean flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
      {visibleColumns.map((column) => (
        <KanbanColumn
          key={column.key}
          column={column}
          tasks={tasksByStatus[column.key]}
          onMove={onMove}
          onMoveToStatus={onMoveToStatus}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
