import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/button";
import { WidgetCard } from "../../../components/widget-card";
import { useBookmarks } from "../hooks/use-bookmarks";
import type { Bookmark, BookmarkCategory } from "../types/bookmark";
import BookmarkFormModal from "./bookmark-form-modal";
import BookmarkItem from "./bookmark-item";
import CategoryFilter from "./category-filter";

export default function BookmarksWidget() {
  const { bookmarks, isLoading, addBookmark, editBookmark, deleteBookmark } = useBookmarks();
  const [activeCategory, setActiveCategory] = useState<BookmarkCategory>("daily");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const visibleBookmarks = bookmarks.filter(
    (bookmark) => bookmark.category === activeCategory,
  );

  function openCreateModal(): void {
    setEditingBookmark(null);
    setIsModalOpen(true);
  }

  function openEditModal(bookmark: Bookmark): void {
    setEditingBookmark(bookmark);
    setIsModalOpen(true);
  }

  function handleSubmit(values: Parameters<typeof addBookmark>[0]): void {
    if (editingBookmark) {
      editBookmark(editingBookmark.id, values);
    } else {
      addBookmark(values);
    }
  }

  const addAction = (
    <Button
      onClick={openCreateModal}
      className="rounded-full px-3 py-1.5"
    >
      <Plus className="h-4 w-4" />
      Thêm bookmark
    </Button>
  );

  return (
    <WidgetCard title="Bookmark" icon={<img src="/icons/bookmark.png" alt="" width={20} height={20} className="h-5 w-5 object-contain" />} action={addAction}>
      <BookmarkFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        bookmark={editingBookmark}
      />

      <div className="mb-3">
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted">Đang tải…</p>
      ) : visibleBookmarks.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted opacity-70">
          Chưa có bookmark nào ở mục này
        </p>
      ) : (
        <ul className="flex flex-col">
          {visibleBookmarks.map((bookmark) => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={openEditModal}
              onDelete={deleteBookmark}
            />
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
