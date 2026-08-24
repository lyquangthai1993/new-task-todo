import { Chip } from "../../../components/chip";
import { PERSON_OPTIONS } from "../constants/reminder-options";
import type { ReminderPerson } from "../types/reminder";

interface PersonFilterProps {
  active: ReminderPerson;
  onChange: (person: ReminderPerson) => void;
}

export default function PersonFilter({ active, onChange }: PersonFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PERSON_OPTIONS.map((option) => (
        <Chip
          key={option.key}
          label={option.label}
          isActive={active === option.key}
          onClick={() => onChange(option.key)}
        />
      ))}
    </div>
  );
}
