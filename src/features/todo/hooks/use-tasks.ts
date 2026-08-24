import { useCallback, useMemo } from "react";
import { useLocalState } from "../../../hooks/use-local-state";
import { TASK_STATUS_ORDER } from "../constants/kanban-columns";
import type { Task, TaskScope, TaskStatus } from "../types/task";
import { migrateTasks } from "../utils/migrate-tasks";
import { taskStorage } from "../utils/task-storage";

type MoveDirection = "prev" | "next";

interface AddTaskInput {
  title: string;
  description: string;
  imageDataUrl: string | null;
  imageName: string | null;
  dueDate: string | null;
  dueTime: string | null;
  status?: TaskStatus;
  important?: boolean;
  scope?: TaskScope;
}

interface EditTaskInput {
  title: string;
  description: string;
  imageDataUrl: string | null;
  imageName: string | null;
  dueDate: string | null;
  dueTime: string | null;
  status: TaskStatus;
  important: boolean;
  scope: TaskScope;
}

type TasksByStatus = Record<TaskStatus, Task[]>;

interface UseTasksResult {
  tasks: Task[];
  tasksByStatus: TasksByStatus;
  isLoading: boolean;
  addTask: (input: AddTaskInput) => void;
  editTask: (id: string, input: EditTaskInput) => void;
  moveTask: (id: string, direction: MoveDirection) => void;
  moveTaskToStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
}

function groupByStatus(tasks: Task[]): TasksByStatus {
  const grouped: TasksByStatus = {
    backlog: [],
    todo: [],
    doing: [],
    done: [],
  };

  for (const task of tasks) {
    grouped[task.status].push(task);
  }

  return grouped;
}

function getAdjacentStatus(
  status: TaskStatus,
  direction: MoveDirection,
): TaskStatus | null {
  const currentIndex = TASK_STATUS_ORDER.indexOf(status);
  const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

  if (nextIndex < 0 || nextIndex >= TASK_STATUS_ORDER.length) return null;

  return TASK_STATUS_ORDER[nextIndex];
}

export function useTasks(): UseTasksResult {
  const [tasks, persist, isLoading] = useLocalState<Task[]>(
    taskStorage,
    [],
    migrateTasks,
  );

  const tasksByStatus = useMemo(() => groupByStatus(tasks), [tasks]);

  const addTask = useCallback(function addTask({
    title,
    description,
    imageDataUrl,
    imageName,
    dueDate,
    dueTime,
    status = "backlog",
    important = false,
    scope = null,
  }: AddTaskInput): void {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      imageDataUrl,
      imageName,
      dueDate,
      dueTime: dueDate ? dueTime : null,
      status,
      important,
      scope,
      createdAt: new Date().toISOString(),
      completedAt: status === "done" ? new Date().toISOString() : null,
    };

    persist([newTask, ...tasks]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, persist]);

  const editTask = useCallback(function editTask(
    id: string,
    {
      title,
      description,
      imageDataUrl,
      imageName,
      dueDate,
      dueTime,
      status,
      important,
      scope,
    }: EditTaskInput,
  ): void {
    persist(
      tasks.map((task) => {
        if (task.id !== id) return task;

        return {
          ...task,
          title: title.trim(),
          description: description.trim(),
          imageDataUrl,
          imageName,
          dueDate,
          dueTime: dueDate ? dueTime : null,
          status,
          important,
          scope,
          completedAt:
            status === "done"
              ? (task.completedAt ?? new Date().toISOString())
              : null,
        };
      }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, persist]);

  const moveTask = useCallback(function moveTask(id: string, direction: MoveDirection): void {
    const nextTasks = tasks.map((task) => {
      if (task.id !== id) return task;

      const nextStatus = getAdjacentStatus(task.status, direction);
      if (!nextStatus) return task;

      return {
        ...task,
        status: nextStatus,
        completedAt: nextStatus === "done" ? new Date().toISOString() : null,
      };
    });

    persist(nextTasks);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, persist]);

  const moveTaskToStatus = useCallback(function moveTaskToStatus(
    id: string,
    status: TaskStatus,
  ): void {
    persist(
      tasks.map((task) => {
        if (task.id !== id || task.status === status) return task;

        return {
          ...task,
          status,
          completedAt: status === "done" ? new Date().toISOString() : null,
        };
      }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, persist]);

  const deleteTask = useCallback(function deleteTask(id: string): void {
    persist(tasks.filter((task) => task.id !== id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, persist]);

  return {
    tasks,
    tasksByStatus,
    isLoading,
    addTask,
    editTask,
    moveTask,
    moveTaskToStatus,
    deleteTask,
  };
}
