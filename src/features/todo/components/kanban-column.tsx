import { useState } from "react";
import { cn } from "../../../utils/cn";
import type { KanbanColumn as KanbanColumnConfig } from "../constants/kanban-columns";
import type { Task, TaskStatus } from "../types/task";
import TaskCard from "./task-card";

type MoveDirection = "prev" | "next";

interface KanbanColumnProps {
  column: KanbanColumnConfig;
  tasks: Task[];
  onMove: (id: string, direction: MoveDirection) => void;
  onMoveToStatus: (id: string, status: TaskStatus) => void;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function KanbanColumn({
  column,
  tasks,
  onMove,
  onMoveToStatus,
  onView,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragOver(false);

    const taskId = event.dataTransfer.getData("text/plain");
    if (!taskId) return;

    onMoveToStatus(taskId, column.key);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex min-w-64 flex-1 flex-col rounded-xl bg-background p-2.5 ring-1 ring-transparent transition-colors",
        isDragOver && "bg-surface ring-brand/40",
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", column.dotClassName)} />
          <span className="text-sm font-semibold text-foreground">
            {column.label}
          </span>
        </div>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface px-1.5 text-xs font-semibold text-muted ring-1 ring-border-card">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="px-1 py-4 text-center text-xs text-muted opacity-60">
          Trống
        </p>
      ) : (
        <ul className="scrollbar-clean flex max-h-88 min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMove={onMove}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
