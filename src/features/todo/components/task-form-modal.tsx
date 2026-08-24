import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Flame, ImagePlus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";
import { formatIsoDate, parseIsoDate } from "@/utils/date";
import { KANBAN_COLUMNS } from "../constants/kanban-columns";
import type { Task, TaskScope, TaskStatus } from "../types/task";

interface TaskFormValues {
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

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TaskFormValues) => void;
  initialDate?: string | null;
  task?: Task | null;
}

const EMPTY_FIELDS = { title: "", description: "" };
const DEFAULT_STATUS: TaskStatus = "todo";
const MAX_IMAGE_SIZE_BYTES = 1.5 * 1024 * 1024;

export default function TaskFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialDate,
  task,
}: TaskFormModalProps) {
  const isEdit = Boolean(task);
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [status, setStatus] = useState<TaskStatus>(DEFAULT_STATUS);
  const [isImportant, setIsImportant] = useState(false);
  const [scope, setScope] = useState<TaskScope>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [dueTime, setDueTime] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Khi mở modal: edit thì điền từ task, tạo mới thì để trống (điền sẵn ngày
  // nếu bấm ô ngày trong lịch).
  useEffect(() => {
    if (!open) return;

    if (task) {
      setFields({ title: task.title, description: task.description });
      setStatus(task.status);
      setIsImportant(task.important);
      setScope(task.scope);
      setImageDataUrl(task.imageDataUrl);
      setImageName(task.imageName);
      setImageError("");
      setDueDate(task.dueDate ? parseIsoDate(task.dueDate) : undefined);
      setDueTime(task.dueTime ?? "");
      return;
    }

    setFields(EMPTY_FIELDS);
    setStatus(DEFAULT_STATUS);
    setIsImportant(false);
    setScope(null);
    setImageDataUrl(null);
    setImageName(null);
    setImageError("");
    setDueDate(initialDate ? parseIsoDate(initialDate) : undefined);
    setDueTime("");
  }, [open, task, initialDate]);

  function resetForm(): void {
    setFields(EMPTY_FIELDS);
    setStatus(DEFAULT_STATUS);
    setIsImportant(false);
    setScope(null);
    setImageDataUrl(null);
    setImageName(null);
    setImageError("");
    setDueDate(undefined);
    setDueTime("");
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  }

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setFields((prev) => ({ ...prev, title: event.target.value }));
  }

  function handleDescriptionChange(
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ): void {
    setFields((prev) => ({ ...prev, description: event.target.value }));
  }

  function handleDateSelect(date: Date | undefined): void {
    setDueDate(date);
    setIsDatePickerOpen(false);
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Chỉ chọn file ảnh.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError("Ảnh tối đa 1.5MB để lưu local ổn định.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setImageError("Không đọc được ảnh này.");
        return;
      }

      setImageDataUrl(reader.result);
      setImageName(file.name);
      setImageError("");
    };

    reader.onerror = () => {
      setImageError("Không đọc được ảnh này.");
    };

    reader.readAsDataURL(file);
  }

  function handleRemoveImage(): void {
    setImageDataUrl(null);
    setImageName(null);
    setImageError("");
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!fields.title.trim()) return;

    onSubmit({
      title: fields.title,
      description: fields.description,
      imageDataUrl,
      imageName,
      dueDate: dueDate ? formatIsoDate(dueDate) : null,
      dueTime: dueDate && dueTime ? dueTime : null,
      status,
      important: isImportant,
      scope,
    });
    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa task" : "Thêm task mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-title">Tên task</Label>
            <Input
              id="task-title"
              value={fields.title}
              onChange={handleTitleChange}
              placeholder="Ví dụ: Đóng tiền điện nước"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-image">Ảnh đính kèm</Label>
            {imageDataUrl ? (
              <div className="overflow-hidden rounded-lg border border-border bg-background">
                <img
                  src={imageDataUrl}
                  alt={imageName ?? "Ảnh task"}
                  className="h-40 w-full object-cover"
                />
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <p className="min-w-0 truncate text-xs text-muted">
                    {imageName ?? "Ảnh đã chọn"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="shrink-0 text-rose-500 hover:text-rose-600"
                  >
                    <Trash2 />
                    Xóa ảnh
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                asChild
                className="justify-start"
              >
                <label htmlFor="task-image" className="cursor-pointer">
                  <ImagePlus />
                  Chọn ảnh
                </label>
              </Button>
            )}
            <input
              id="task-image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
            />
            {imageError && <p className="text-xs text-rose-500">{imageError}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-description">Mô tả</Label>
            <Textarea
              id="task-description"
              value={fields.description}
              onChange={handleDescriptionChange}
              placeholder="Chi tiết (tuỳ chọn)"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Cột</Label>
            <div className="grid grid-cols-4 gap-2">
              {KANBAN_COLUMNS.map((column) => {
                const isActive = status === column.key;

                return (
                  <button
                    key={column.key}
                    type="button"
                    onClick={() => setStatus(column.key)}
                    className={cn(
                      "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-input px-2 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "text-foreground ring-2 ring-ring"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn("h-2 w-2 rounded-full", column.dotClassName)}
                    />
                    {column.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Đánh dấu quan trọng</Label>
            <button
              type="button"
              onClick={() => setIsImportant((prev) => !prev)}
              className={cn(
                "inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                isImportant
                  ? "border-orange-300 bg-orange-50 text-orange-600 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-400"
                  : "border-input text-muted-foreground hover:text-foreground",
              )}
            >
              <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
              Quan trọng
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Phạm vi thời gian</Label>
            <div className="flex gap-2">
              {(
                [
                  { value: null, label: "Không" },
                  { value: "week", label: "Tuần này" },
                  { value: "month", label: "Tháng này" },
                ] as { value: TaskScope; label: string }[]
              ).map(({ value, label }) => {
                const isActive = scope === value;

                return (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setScope(value)}
                    className={cn(
                      "inline-flex cursor-pointer items-center justify-center rounded-md border border-input px-3 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "text-foreground ring-2 ring-ring"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {scope === null && (
            <div className="flex flex-col gap-2">
              <Label>Ngày &amp; giờ hết hạn</Label>
              <div className="flex gap-2">
                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon />
                      {dueDate
                        ? format(dueDate, "EEEE, dd/MM/yyyy", { locale: vi })
                        : "Chọn ngày (tuỳ chọn)"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={handleDateSelect}
                      locale={vi}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>

                {dueDate && (
                  <button
                    type="button"
                    onClick={() => { setDueDate(undefined); setDueTime(""); }}
                    aria-label="Xoá ngày"
                    className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input px-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <Input
                  type="time"
                  aria-label="Giờ hết hạn"
                  value={dueTime}
                  onChange={(event) => setDueTime(event.target.value)}
                  disabled={!dueDate}
                  className="w-32"
                />
              </div>
              {dueDate && (
                <p className="text-xs text-muted-foreground">
                  Có giờ thì Nhắc việc sẽ hiển thị giờ cụ thể.
                </p>
              )}
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={!fields.title.trim()}>
              {isEdit ? "Lưu" : "Thêm task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
