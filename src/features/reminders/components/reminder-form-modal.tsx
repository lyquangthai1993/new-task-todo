import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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
import { cn } from "@/utils/cn";
import { formatIsoDate, parseIsoDate } from "@/utils/date";
import {
  PERSON_OPTIONS,
  UNIT_OPTIONS,
} from "../constants/reminder-options";
import type {
  Reminder,
  ReminderPerson,
  ReminderUnit,
} from "../types/reminder";

interface ReminderFormValues {
  title: string;
  person: ReminderPerson;
  interval: number;
  unit: ReminderUnit;
  startDate: string;
}

interface ReminderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ReminderFormValues) => void;
  reminder?: Reminder | null;
}

const SEGMENT_BASE =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-input px-2 py-2 text-xs font-medium transition-colors";

export default function ReminderFormModal({
  open,
  onOpenChange,
  onSubmit,
  reminder,
}: ReminderFormModalProps) {
  const isEdit = Boolean(reminder);
  const [title, setTitle] = useState("");
  const [person, setPerson] = useState<ReminderPerson>("me");
  const [intervalText, setIntervalText] = useState("1");
  const [unit, setUnit] = useState<ReminderUnit>("day");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (reminder) {
      setTitle(reminder.title);
      setPerson(reminder.person);
      setIntervalText(String(reminder.interval));
      setUnit(reminder.unit);
      setStartDate(parseIsoDate(reminder.nextDueDate));
      return;
    }

    setTitle("");
    setPerson("me");
    setIntervalText("1");
    setUnit("day");
    setStartDate(new Date());
  }, [open, reminder]);

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!title.trim()) return;

    const interval = Math.max(1, Number(intervalText) || 1);

    onSubmit({
      title,
      person,
      interval,
      unit,
      startDate: formatIsoDate(startDate),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa nhắc" : "Thêm nhắc lặp lại"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reminder-title">Tên</Label>
            <Input
              id="reminder-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Vợ uống thuốc"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Người</Label>
            <div className="grid grid-cols-2 gap-2">
              {PERSON_OPTIONS.map((option) => {
                const isActive = person === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setPerson(option.key)}
                    className={cn(
                      SEGMENT_BASE,
                      isActive
                        ? "text-foreground ring-2 ring-ring"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn("h-2 w-2 rounded-full", option.dotClass)}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Lặp lại mỗi</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={intervalText}
                onChange={(event) => setIntervalText(event.target.value)}
                className="w-20"
              />
              <div className="grid flex-1 grid-cols-3 gap-2">
                {UNIT_OPTIONS.map((option) => {
                  const isActive = unit === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setUnit(option.key)}
                      className={cn(
                        SEGMENT_BASE,
                        isActive
                          ? "text-foreground ring-2 ring-ring"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{isEdit ? "Lần tới" : "Bắt đầu từ"}</Label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon />
                  {format(startDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) setStartDate(date);
                    setIsDatePickerOpen(false);
                  }}
                  locale={vi}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {isEdit ? "Lưu" : "Thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
