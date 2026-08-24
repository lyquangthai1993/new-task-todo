import { useCallback, useState } from "react";
import { Button as UiButton } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WidgetCard } from "../../../components/widget-card";
import { useTasks } from "../hooks/use-tasks";
import type { Task, TaskStatus, TaskView } from "../types/task";
import CalendarView from "./calendar-view";
import KanbanBoard from "./kanban-board";
import TaskDetailModal from "./task-detail-modal";
import TaskFormModal from "./task-form-modal";
import TodoToolbar from "./todo-toolbar";

const HIDDEN_COLUMNS_KEY = "hiddenKanbanColumns";

function loadHiddenColumns(): Set<TaskStatus> {
  try {
    const stored = localStorage.getItem(HIDDEN_COLUMNS_KEY);
    if (stored) return new Set(JSON.parse(stored) as TaskStatus[]);
  } catch {}

  return new Set();
}

export default function TodoWidget() {
  const {
    tasks,
    tasksByStatus,
    isLoading,
    addTask,
    editTask,
    moveTask,
    moveTaskToStatus,
    deleteTask,
  } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [view, setView] = useState<TaskView>("board");
  const [hiddenColumns, setHiddenColumns] = useState<Set<TaskStatus>>(loadHiddenColumns);

  const openCreateModal = useCallback((initialDate: string | null): void => {
    setEditingTask(null);
    setModalDate(initialDate);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((task: Task): void => {
    setEditingTask(task);
    setModalDate(null);
    setIsModalOpen(true);
  }, []);

  const toggleColumn = useCallback((status: TaskStatus): void => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      try {
        localStorage.setItem(HIDDEN_COLUMNS_KEY, JSON.stringify([...next]));
      } catch {}

      return next;
    });
  }, []);

  const handleSubmit = useCallback((values: Parameters<typeof addTask>[0]): void => {
    if (editingTask) {
      editTask(editingTask.id, { ...values, status: values.status ?? "backlog", important: values.important ?? false, scope: values.scope ?? null });
    } else {
      addTask(values);
    }
  }, [editingTask, editTask, addTask]);

  const openDeleteConfirm = useCallback((id: string): void => {
    const task = tasks.find((item) => item.id === id);
    if (task) setDeletingTask(task);
  }, [tasks]);

  const confirmDeleteTask = useCallback((): void => {
    if (!deletingTask) return;

    deleteTask(deletingTask.id);
    setDeletingTask(null);
  }, [deletingTask, deleteTask]);

  return (
    <>
    <WidgetCard
      title="Todo"
      icon={
        <img
          src="/icons/todo.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
      }
      className="h-full flex-1"
      bodyClassName="flex min-h-0 flex-col"
      action={
        <TodoToolbar
          view={view}
          hiddenColumns={hiddenColumns}
          onViewChange={setView}
          onToggleColumn={toggleColumn}
          onAddClick={() => openCreateModal(null)}
        />
      }
    >
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted">Đang tải…</p>
      ) : view === "board" ? (
        <KanbanBoard
          tasksByStatus={tasksByStatus}
          hiddenColumns={hiddenColumns}
            onMove={moveTask}
            onMoveToStatus={moveTaskToStatus}
            onView={setViewingTask}
            onEdit={openEditModal}
            onDelete={openDeleteConfirm}
          />
      ) : (
        <CalendarView tasks={tasks} onSelectDate={openCreateModal} />
      )}

      <TaskFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialDate={modalDate}
        task={editingTask}
      />
    </WidgetCard>

    <TaskDetailModal
      open={Boolean(viewingTask)}
      onOpenChange={(open) => {
        if (!open) setViewingTask(null);
      }}
      task={viewingTask}
    />

    <Dialog
      open={Boolean(deletingTask)}
      onOpenChange={(open) => {
        if (!open) setDeletingTask(null);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xóa task?</DialogTitle>
          <DialogDescription>
            Task "{deletingTask?.title}" sẽ bị xóa khỏi danh sách.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <UiButton
            type="button"
            variant="ghost"
            onClick={() => setDeletingTask(null)}
          >
            Hủy
          </UiButton>
          <UiButton
            type="button"
            variant="destructive"
            onClick={confirmDeleteTask}
          >
            Xóa task
          </UiButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
