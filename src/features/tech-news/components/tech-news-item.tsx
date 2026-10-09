import { ExternalLink, Flame, MessageSquare, Tag, User } from "lucide-react";
import { formatTimeAgo } from "../services/tech-news-service";
import type { TechNewsItem as ITechNewsItem } from "../types/tech-news";

interface TechNewsItemProps {
  item: ITechNewsItem;
  rank: number;
}

export default function TechNewsItem({ item, rank }: TechNewsItemProps) {
  const timeAgo = formatTimeAgo(item.publishedAt);

  return (
    <article className="group relative flex items-start gap-3 rounded-xl border border-border-card bg-surface/40 p-2.5 transition-all duration-150 hover:bg-surface hover:shadow-xs">
      {/* Huy hiệu thứ hạng */}
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-xs font-bold text-brand group-hover:bg-brand group-hover:text-white transition-colors">
        {rank}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Tiêu đề & Link đến bài viết gốc */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="line-clamp-2 text-xs sm:text-sm font-medium text-foreground transition-colors hover:text-brand"
          title={item.title}
        >
          {item.title}
        </a>

        {/* Thông tin phụ: Nguồn, Danh mục, Tác giả, Điểm số, Bình luận, Thời gian */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted">
          {/* Nguồn domain */}
          <span className="inline-flex items-center gap-0.5 font-medium text-foreground/75 truncate max-w-[130px]">
            {item.sourceDomain}
            <ExternalLink className="h-2.5 w-2.5 opacity-60 inline-block" />
          </span>

          {/* Chuyên mục (The Verge) */}
          {item.category && (
            <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 bg-foreground/5 text-foreground/70 font-medium">
              <Tag className="h-2.5 w-2.5 opacity-60" />
              {item.category}
            </span>
          )}

          {/* Tác giả (The Verge) */}
          {item.author && (
            <span className="inline-flex items-center gap-0.5 text-muted opacity-80 truncate max-w-[100px]">
              <User className="h-2.5 w-2.5 opacity-60" />
              {item.author}
            </span>
          )}

          {/* Điểm bình chọn (Hacker News) */}
          {typeof item.points === "number" && item.points > 0 && (
            <span
              className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400"
              title={`${item.points} lượt upvote trên Hacker News`}
            >
              <Flame className="h-3 w-3 fill-amber-500/20" />
              {item.points}
            </span>
          )}

          {/* Bình luận HN (nếu có) */}
          {item.hnUrl && typeof item.commentsCount === "number" && item.commentsCount > 0 && (
            <a
              href={item.hnUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              title="Xem thảo luận trên Hacker News"
            >
              <MessageSquare className="h-3 w-3 opacity-70" />
              <span>{item.commentsCount}</span>
            </a>
          )}

          {/* Thời gian đăng */}
          {timeAgo && <span className="opacity-75">{timeAgo}</span>}
        </div>
      </div>
    </article>
  );
}
