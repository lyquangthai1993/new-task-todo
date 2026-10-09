export type TechNewsSource = "theverge" | "hackernews";

export interface TechNewsItem {
  id: string;
  title: string;
  url: string;
  points?: number;
  commentsCount?: number;
  sourceDomain: string;
  publishedAt: string;
  author?: string;
  category?: string;
  hnUrl?: string;
}

export interface TechNewsCacheState {
  date: string;
  updatedAt: number;
  items: TechNewsItem[];
  pageOffset: number;
  source: TechNewsSource;
}
