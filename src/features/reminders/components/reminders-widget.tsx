import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/button";
import { WidgetCard } from "../../../components/widget-card";
import { useReminders } from "../hooks/use-reminders";
import type { Reminder, ReminderPerson } from "../types/reminder";
import PersonFilter from "./person-filter";
import ReminderFormModal from "./reminder-form-modal";
import ReminderItem from "./reminder-item";

export default function RemindersWidget() {
  const {
    reminders,
    isLoading,
    addReminder,
    editReminder,
    toggleToday,
    deleteReminder,
  } = useReminders();
  const [activePerson, setActivePerson] = useState<ReminderPerson>("me");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const visibleReminders = reminders.filter(
    (reminder) => reminder.person === activePerson,
  );

  function openCreateModal(): void {
    setEditingReminder(null);
    setIsModalOpen(true);
  }

  function openEditModal(reminder: Reminder): void {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  }

  function handleSubmit(values: Parameters<typeof addReminder>[0]): void {
    if (editingReminder) {
      editReminder(editingReminder.id, values);
    } else {
      addReminder(values);
    }
  }

  const addAction = (
    <Button onClick={openCreateModal} className="rounded-full px-3 py-1.5">
      <Plus className="h-4 w-4" />
      Thêm nhắc
    </Button>
  );

  return (
    <WidgetCard
      title="Nhắc lặp lại"
      icon={
        <img
          src="/icons/bell.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
      }
      action={addAction}
    >
      <div className="mb-3">
        <PersonFilter active={activePerson} onChange={setActivePerson} />
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted">Đang tải…</p>
      ) : visibleReminders.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted opacity-70">
          Chưa có nhắc nào ở mục này
        </p>
      ) : (
        <ul className="flex flex-col">
          {visibleReminders.map((reminder) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onToggle={toggleToday}
              onEdit={openEditModal}
              onDelete={deleteReminder}
            />
          ))}
        </ul>
      )}

      <ReminderFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        reminder={editingReminder}
      />
    </WidgetCard>
  );
}
