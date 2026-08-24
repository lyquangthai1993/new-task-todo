import { CalendarClock, CheckCircle2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KANBAN_COLUMNS } from "../constants/kanban-columns";
import type { Task } from "../types/task";
import { formatDueBadge } from "../utils/task-date";

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

function formatDateTime(value: string | null): string {
  if (!value) return "Không có";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(task: Task): string {
  return (
    KANBAN_COLUMNS.find((column) => column.key === task.status)?.label ??
    task.status
  );
}

export default function TaskDetailModal({
  open,
  onOpenChange,
  task,
}: TaskDetailModalProps) {
  if (!task) return null;

  const dueLabel = task.dueDate
    ? `${formatDueBadge(task.dueDate)}${task.dueTime ? ` · ${task.dueTime}` : ""}`
    : "Không có";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết task</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium uppercase text-muted">Tên task</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">
              {task.title}
            </h3>
          </div>

          {task.imageDataUrl && (
            <img
              src={task.imageDataUrl}
              alt={task.imageName ?? task.title}
              className="aspect-video w-full rounded-lg object-cover"
            />
          )}

          <div>
            <p className="text-xs font-medium uppercase text-muted">Mô tả</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {task.description || "Không có"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs font-medium uppercase text-muted">Cột</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {getStatusLabel(task)}
              </p>
            </div>

            <div className="rounded-lg bg-background p-3">
              <p className="text-xs font-medium uppercase text-muted">
                Ngày & giờ hết hạn
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                <CalendarClock className="h-4 w-4 text-muted" />
                {dueLabel}
              </p>
            </div>

            <div className="rounded-lg bg-background p-3">
              <p className="text-xs font-medium uppercase text-muted">
                Quan trọng
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                {task.important && (
                  <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
                )}
                {task.important ? "Có" : "Không"}
              </p>
            </div>

            <div className="rounded-lg bg-background p-3">
              <p className="text-xs font-medium uppercase text-muted">
                Phạm vi thời gian
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {task.scope === "week"
                  ? "Tuần này"
                  : task.scope === "month"
                    ? "Tháng này"
                    : "Không"}
              </p>
            </div>

            <div className="rounded-lg bg-background p-3">
              <p className="text-xs font-medium uppercase text-muted">Ngày tạo</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatDateTime(task.createdAt)}
              </p>
            </div>

            <div className="rounded-lg bg-background p-3">
              <p className="text-xs font-medium uppercase text-muted">
                Hoàn thành
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                {task.completedAt && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                {formatDateTime(task.completedAt)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
