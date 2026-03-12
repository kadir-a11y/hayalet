/**
 * Parse RSS 2.0 XML into structured items.
 */
export function parseRssXml(xml: string): Array<{ title: string; link: string; description: string }> {
  const items: Array<{ title: string; link: string; description: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const description = stripHtml(extractTag(itemXml, "description"));
    items.push({ title, link, description });
  }

  return items;
}

/**
 * Parse Atom XML into structured items.
 */
export function parseAtomXml(xml: string): Array<{ title: string; link: string; description: string }> {
  const items: Array<{ title: string; link: string; description: string }> = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1];
    const title = extractTag(entryXml, "title");
    const link = entryXml.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/)?.[1] || "";
    const description = stripHtml(extractTag(entryXml, "summary") || extractTag(entryXml, "content"));
    items.push({ title, link, description });
  }

  return items;
}

/**
 * Auto-detect feed format and parse.
 */
export function parseFeedXml(xml: string): Array<{ title: string; link: string; description: string }> {
  if (xml.includes("<feed") && xml.includes("<entry>")) {
    return parseAtomXml(xml);
  }
  return parseRssXml(xml);
}

/**
 * Extract tag content, handling CDATA.
 */
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  if (!match) return "";
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

/**
 * Strip HTML tags from a string.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Normalize Turkish characters for case-insensitive matching.
 */
export function normalizeTurkish(text: string): string {
  return text
    .toLowerCase()
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .replace(/Ş/g, "ş")
    .replace(/Ç/g, "ç")
    .replace(/Ö/g, "ö")
    .replace(/Ü/g, "ü")
    .replace(/Ğ/g, "ğ");
}

/**
 * Check if text contains any of the keywords (case-insensitive, Turkish-aware).
 */
export function matchesKeywords(text: string, keywords: string[]): boolean {
  const normalizedText = normalizeTurkish(text);
  return keywords.some((kw) => normalizedText.includes(normalizeTurkish(kw)));
}
