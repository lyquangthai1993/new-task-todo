import { Chip } from "../../../components/chip";
import { CATEGORY_OPTIONS } from "../constants/categories";
import type { BookmarkCategory } from "../types/bookmark";

interface CategoryFilterProps {
  active: BookmarkCategory;
  onChange: (category: BookmarkCategory) => void;
}

export default function CategoryFilter({
  active,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORY_OPTIONS.map((option) => (
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
