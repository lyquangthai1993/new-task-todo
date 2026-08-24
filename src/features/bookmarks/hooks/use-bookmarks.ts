import { useLocalState } from "../../../hooks/use-local-state";
import { createStorage } from "../../../utils/create-storage";
import { DEFAULT_BOOKMARKS } from "../constants/default-bookmarks";
import { BOOKMARKS_STORAGE_KEY } from "../constants/storage-keys";
import type { Bookmark, BookmarkCategory } from "../types/bookmark";

interface AddBookmarkInput {
  name: string;
  url: string;
  category: BookmarkCategory;
}

interface UseBookmarksResult {
  bookmarks: Bookmark[];
  isLoading: boolean;
  addBookmark: (input: AddBookmarkInput) => void;
  editBookmark: (id: string, input: AddBookmarkInput) => void;
  deleteBookmark: (id: string) => void;
}

const bookmarkStorage = createStorage<Bookmark[]>(BOOKMARKS_STORAGE_KEY, []);

function seedIfEmpty(loaded: Bookmark[]): Bookmark[] {
  return loaded.length > 0 ? loaded : DEFAULT_BOOKMARKS;
}

export function useBookmarks(): UseBookmarksResult {
  const [bookmarks, persist, isLoading] = useLocalState<Bookmark[]>(
    bookmarkStorage,
    [],
    seedIfEmpty,
  );

  function addBookmark({ name, url, category }: AddBookmarkInput): void {
    const newBookmark: Bookmark = {
      id: crypto.randomUUID(),
      name: name.trim(),
      url: url.trim(),
      category,
    };

    persist([...bookmarks, newBookmark]);
  }

  function editBookmark(id: string, { name, url, category }: AddBookmarkInput): void {
    persist(
      bookmarks.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, name: name.trim(), url: url.trim(), category }
          : bookmark,
      ),
    );
  }

  function deleteBookmark(id: string): void {
    persist(bookmarks.filter((bookmark) => bookmark.id !== id));
  }

  return { bookmarks, isLoading, addBookmark, editBookmark, deleteBookmark };
}
