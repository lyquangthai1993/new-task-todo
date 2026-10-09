import {
  HN_FRONT_PAGE_API,
  RSS2JSON_API_URL,
  THE_VERGE_RSS_URL,
} from "../constants/tech-news-constants";
import type { TechNewsItem, TechNewsSource } from "../types/tech-news";

interface AlgoliaHit {
  objectID: string;
  title?: string;
  url?: string;
  points?: number;
  num_comments?: number;
  created_at: string;
}

interface AlgoliaResponse {
  hits: AlgoliaHit[];
}

interface Rss2JsonItem {
  guid?: string;
  link?: string;
  title?: string;
  pubDate?: string;
  author?: string;
  categories?: string[];
}

interface Rss2JsonResponse {
  status: string;
  items?: Rss2JsonItem[];
}

export function extractDomain(url?: string): string {
  if (!url) return "news.ycombinator.com";
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "news.ycombinator.com";
  }
}

export function formatTimeAgo(isoString: string): string {
  try {
    const published = new Date(isoString).getTime();
    if (isNaN(published)) return "";
    const now = Date.now();
    const diffMs = Math.max(0, now - published);

    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Hôm qua";
    return `${diffDays} ngày trước`;
  } catch {
    return "";
  }
}

/**
 * Tải tin nổi bật từ Hacker News qua Algolia API
 */
export async function fetchHackerNews(): Promise<TechNewsItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(HN_FRONT_PAGE_API, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = (await res.json()) as AlgoliaResponse;

    if (!data.hits || !Array.isArray(data.hits)) return [];

    return data.hits
      .filter((hit) => Boolean(hit.title))
      .map((hit) => {
        const hnUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;
        return {
          id: hit.objectID,
          title: hit.title ?? "Không có tiêu đề",
          url: hit.url || hnUrl,
          hnUrl,
          points: hit.points ?? 0,
          commentsCount: hit.num_comments ?? 0,
          sourceDomain: extractDomain(hit.url),
          publishedAt: hit.created_at,
        };
      });
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Parse XML Atom Feed của The Verge thành danh sách TechNewsItem
 */
function parseTheVergeAtomXml(xmlText: string): TechNewsItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const entries = Array.from(doc.querySelectorAll("entry"));

  return entries.map((entry, index) => {
    const title = entry.querySelector("title")?.textContent?.trim() || "Tin từ The Verge";
    const linkEl =
      entry.querySelector("link[rel='alternate']") || entry.querySelector("link");
    const url =
      linkEl?.getAttribute("href") || "https://www.theverge.com";
    const id =
      entry.querySelector("id")?.textContent?.trim() || `verge-${index}`;
    const publishedAt =
      entry.querySelector("published, updated")?.textContent?.trim() || "";
    const author = entry.querySelector("author > name")?.textContent?.trim();
    const category =
      entry.querySelector("category")?.getAttribute("term") || undefined;

    return {
      id,
      title,
      url,
      sourceDomain: "theverge.com",
      publishedAt,
      author,
      category,
    };
  });
}

/**
 * Tải tin mới từ The Verge (hỗ trợ trực tiếp Atom XML trong Extension hoặc qua RSS-to-JSON dự phòng)
 */
export async function fetchTheVergeNews(): Promise<TechNewsItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  // Cách 1: Thử fetch trực tiếp RSS (hoạt động tốt trong Chrome Extension có host_permissions)
  try {
    const res = await fetch(THE_VERGE_RSS_URL, {
      signal: controller.signal,
      headers: { Accept: "application/atom+xml, application/xml, text/xml" },
    });
    if (res.ok) {
      clearTimeout(timeoutId);
      const xmlText = await res.text();
      const items = parseTheVergeAtomXml(xmlText);
      if (items.length > 0) return items;
    }
  } catch {
    // Nếu bị CORS ở môi trường dev, chuyển sang dự phòng
  }

  // Cách 2: Dự phòng qua rss2json (hỗ trợ CORS cho môi trường dev web)
  try {
    const jsonUrl = `${RSS2JSON_API_URL}?rss_url=${encodeURIComponent(THE_VERGE_RSS_URL)}`;
    const res = await fetch(jsonUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = (await res.json()) as Rss2JsonResponse;

    if (data.status === "ok" && Array.isArray(data.items)) {
      return data.items.map((item, index) => ({
        id: item.guid || item.link || `verge-${index}`,
        title: item.title || "Tin tức từ The Verge",
        url: item.link || "https://www.theverge.com",
        sourceDomain: "theverge.com",
        publishedAt: item.pubDate || "",
        author: item.author,
        category:
          Array.isArray(item.categories) && item.categories.length > 0
            ? item.categories[0]
            : undefined,
      }));
    }
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }

  return [];
}

/**
 * Điều phối tải tin theo nguồn (Hacker News hoặc The Verge)
 */
export async function fetchNewsBySource(
  source: TechNewsSource,
): Promise<TechNewsItem[]> {
  if (source === "theverge") {
    return fetchTheVergeNews();
  }
  return fetchHackerNews();
}
