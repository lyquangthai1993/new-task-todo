import type { ReminderPerson, ReminderUnit } from "../types/reminder";

export interface PersonOption {
  key: ReminderPerson;
  label: string;
  chipClass: string;
  dotClass: string;
}

export const PERSON_OPTIONS: PersonOption[] = [
  {
    key: "me",
    label: "Tôi",
    chipClass: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    dotClass: "bg-blue-500",
  },
  {
    key: "wife",
    label: "Vợ",
    chipClass: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
    dotClass: "bg-pink-500",
  },
];

export interface UnitOption {
  key: ReminderUnit;
  label: string;
}

export const UNIT_OPTIONS: UnitOption[] = [
  { key: "day", label: "Ngày" },
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
];

export function getPersonOption(person: ReminderPerson): PersonOption {
  return PERSON_OPTIONS.find((option) => option.key === person) ?? PERSON_OPTIONS[0];
}
