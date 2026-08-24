export function getFaviconUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.protocol === "file:") return null;

    const hostname = parsed.hostname;

    if (!hostname) return null;

    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
}

export function getHostLabel(url: string): string {
  try {
    const parsed = new URL(url);

    if (parsed.protocol === "file:") {
      return parsed.pathname;
    }

    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
