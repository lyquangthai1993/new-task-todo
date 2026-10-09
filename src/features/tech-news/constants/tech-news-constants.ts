export const TECH_NEWS_STORAGE_KEY = "tech_news_cache";

// Thời gian hết hạn cache (4 tiếng)
export const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

// API Hacker News Algolia
export const HN_FRONT_PAGE_API =
  "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=20";

// The Verge Atom / RSS Feeds
export const THE_VERGE_RSS_URL = "https://www.theverge.com/rss/index.xml";
export const RSS2JSON_API_URL = "https://api.rss2json.com/v1/api.json";

export const DEFAULT_DISPLAY_COUNT = 3;
