export type BookmarkCategory =
  | "daily"
  | "study"
  | "reading"
  | "listening"
  | "entertainment";

export interface Bookmark {
  id: string;
  name: string;
  url: string;
  category: BookmarkCategory;
}
