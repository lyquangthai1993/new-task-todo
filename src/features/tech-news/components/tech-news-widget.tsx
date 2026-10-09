import { Newspaper, RotateCw, Shuffle } from "lucide-react";
import WidgetCard from "../../../components/widget-card/widget-card";
import { cn } from "../../../utils/cn";
import { useTechNews } from "../hooks/use-tech-news";
import TechNewsItem from "./tech-news-item";

export default function TechNewsWidget() {
  const {
    source,
    items,
    allCount,
    isLoading,
    isRefreshing,
    isCached,
    error,
    refresh,
    cycleNext,
    setSource,
  } = useTechNews();

  const action = (
    <div className="flex items-center gap-1.5">
      {/* Bộ chọn nguồn tin: The Verge / Hacker News */}
      <div className="flex items-center rounded-xl bg-background p-0.5 ring-1 ring-border-card text-xs">
        <button
          type="button"
          onClick={() => void setSource("theverge")}
          className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer",
            source === "theverge"
              ? "bg-brand text-white font-semibold shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface/50",
          )}
          title="Đọc tin tức công nghệ từ The Verge"
        >
          The Verge
        </button>
        <button
          type="button"
          onClick={() => void setSource("hackernews")}
          className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer",
            source === "hackernews"
              ? "bg-brand text-white font-semibold shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface/50",
          )}
          title="Đọc tin tức nổi bật từ Hacker News"
        >
          HN
        </button>
      </div>

      {/* Đổi 3 tin khác trong ngày */}
      {allCount > 3 && (
        <button
          type="button"
          onClick={cycleNext}
          title="Xem 3 tin khác trong ngày"
          className="flex items-center gap-1 rounded-lg p-1.5 text-xs font-medium text-muted hover:bg-background hover:text-foreground transition-colors cursor-pointer"
        >
          <Shuffle className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Nút Làm mới (bỏ qua cache) */}
      <button
        type="button"
        onClick={() => void refresh()}
        disabled={isRefreshing}
        title={
          isCached
            ? "Dữ liệu đang dùng cache hôm nay. Bấm để làm mới từ máy chủ."
            : "Làm mới tin tức"
        }
        className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-brand transition-colors cursor-pointer disabled:opacity-50"
      >
        <RotateCw
          className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-brand" : ""}`}
        />
      </button>
    </div>
  );

  return (
    <WidgetCard
      title="Tin công nghệ hôm nay"
      icon={<Newspaper className="h-5 w-5 text-brand" />}
      action={action}
      className="flex-1"
      bodyClassName="scrollbar-clean flex flex-col justify-between overflow-y-auto"
    >
      {isLoading ? (
        <div className="flex flex-col gap-2.5 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border-card/60 bg-surface/30 p-3 animate-pulse"
            >
              <div className="h-6 w-6 rounded-lg bg-border-card" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-border-card" />
                <div className="h-2.5 w-1/3 rounded bg-border-card/70" />
              </div>
            </div>
          ))}
        </div>
      ) : error && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="mb-2 text-xs text-muted">{error}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-brand hover:bg-background transition-colors ring-1 ring-border-card cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted">
          Chưa có tin nổi bật nào hôm nay.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <TechNewsItem
              key={item.id}
              item={item}
              rank={index + 1}
            />
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
