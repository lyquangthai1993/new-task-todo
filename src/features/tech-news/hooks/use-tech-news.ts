import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalState } from "../../../hooks/use-local-state";
import { createStorage } from "../../../utils/create-storage";
import { getTodayIso } from "../../../utils/date";
import {
  CACHE_TTL_MS,
  DEFAULT_DISPLAY_COUNT,
  TECH_NEWS_STORAGE_KEY,
} from "../constants/tech-news-constants";
import { fetchNewsBySource } from "../services/tech-news-service";
import type { TechNewsCacheState, TechNewsSource } from "../types/tech-news";

const initialCacheState: TechNewsCacheState = {
  date: "",
  updatedAt: 0,
  items: [],
  pageOffset: 0,
  source: "theverge",
};

const techNewsStorage = createStorage<TechNewsCacheState>(
  TECH_NEWS_STORAGE_KEY,
  initialCacheState,
  { skipServerSync: true },
);

export function useTechNews() {
  const [cache, persistCache, isStorageLoading] =
    useLocalState<TechNewsCacheState>(techNewsStorage, initialCacheState);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const todayIso = getTodayIso();
  const currentSource: TechNewsSource = cache.source || "theverge";

  // Kiểm tra cache còn hợp lệ không (cùng ngày & chưa quá TTL)
  const isCacheValid = useMemo(() => {
    if (!cache.items || cache.items.length === 0) return false;
    const isSameDate = cache.date === todayIso;
    const isWithinTtl = Date.now() - cache.updatedAt < CACHE_TTL_MS;
    return isSameDate && isWithinTtl;
  }, [cache.date, cache.items, cache.updatedAt, todayIso]);

  // Hàm tải tin mới từ API và lưu vào cache
  const fetchAndCacheNews = useCallback(
    async (sourceToFetch: TechNewsSource = currentSource) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsRefreshing(true);
      setError(null);

      try {
        const freshItems = await fetchNewsBySource(sourceToFetch);
        if (freshItems.length > 0) {
          persistCache({
            date: todayIso,
            updatedAt: Date.now(),
            items: freshItems,
            pageOffset: 0,
            source: sourceToFetch,
          });
        }
      } catch (err) {
        console.warn("[TechNews] Lỗi khi tải tin tức:", err);
        if (cache.items.length === 0) {
          setError(
            err instanceof Error && err.name === "AbortError"
              ? "Quá thời gian tải tin, vui lòng thử lại."
              : "Không thể kết nối đến máy chủ tin tức.",
          );
        }
      } finally {
        setIsRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [cache.items.length, currentSource, persistCache, todayIso],
  );

  // Tự động kiểm tra và tải mới nếu cache hết hạn hoặc chưa có dữ liệu
  useEffect(() => {
    if (isStorageLoading) return;

    if (!isCacheValid) {
      void fetchAndCacheNews(currentSource);
    }
  }, [currentSource, fetchAndCacheNews, isCacheValid, isStorageLoading]);

  // Lấy ra 3 tin nổi bật theo pageOffset
  const displayedItems = useMemo(() => {
    if (!cache.items || cache.items.length === 0) return [];
    const offset = cache.pageOffset || 0;
    const count = DEFAULT_DISPLAY_COUNT;

    let slice = cache.items.slice(offset, offset + count);
    if (slice.length < count && cache.items.length >= count) {
      slice = [...slice, ...cache.items.slice(0, count - slice.length)];
    }
    return slice;
  }, [cache.items, cache.pageOffset]);

  // Đổi sang 3 tin tiếp theo trong danh sách
  const cycleNext = useCallback(() => {
    if (cache.items.length <= DEFAULT_DISPLAY_COUNT) return;
    const nextOffset =
      (cache.pageOffset + DEFAULT_DISPLAY_COUNT) % cache.items.length;
    persistCache({
      ...cache,
      pageOffset: nextOffset,
    });
  }, [cache, persistCache]);

  // Thay đổi nguồn tin (The Verge <-> Hacker News)
  const setSource = useCallback(
    async (newSource: TechNewsSource) => {
      if (newSource === currentSource && isCacheValid) return;
      await fetchAndCacheNews(newSource);
    },
    [currentSource, fetchAndCacheNews, isCacheValid],
  );

  // Làm mới thủ công (bỏ qua cache)
  const refresh = useCallback(async () => {
    await fetchAndCacheNews(currentSource);
  }, [currentSource, fetchAndCacheNews]);

  return {
    source: currentSource,
    items: displayedItems,
    allCount: cache.items.length,
    isLoading: isStorageLoading || (isRefreshing && cache.items.length === 0),
    isRefreshing,
    isCached: isCacheValid,
    updatedAt: cache.updatedAt,
    error,
    refresh,
    cycleNext,
    setSource,
  };
}
