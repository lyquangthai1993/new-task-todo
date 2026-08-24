import type { BookmarkCategory } from "../types/bookmark";

export interface CategoryOption {
  key: BookmarkCategory;
  label: string;
}

// "Tất cả" dùng để bỏ lọc — tách riêng để value lọc có thể là null.
// key giữ nguyên để không mất dữ liệu bookmark cũ; chỉ đổi label hiển thị.
export const CATEGORY_OPTIONS: CategoryOption[] = [
  { key: "daily", label: "Daily" },
  { key: "study", label: "Study" },
  { key: "reading", label: "Reading" },
  { key: "listening", label: "Listening" },
  { key: "entertainment", label: "Useful" },
];

export function getCategoryLabel(category: BookmarkCategory): string {
  return (
    CATEGORY_OPTIONS.find((option) => option.key === category)?.label ??
    category
  );
}
