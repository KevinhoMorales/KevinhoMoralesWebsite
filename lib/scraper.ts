/**
 * Scraper utilities for extracting data from Notion/Super.so sites.
 * Used by the scrape-notion-site script.
 */

export interface ScrapeResult {
  text: string;
  links: string[];
  images: string[];
}

export async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; PortfolioScraper/1.0)',
    },
  });
  return res.text();
}

export function extractTextFromHtml(html: string): string {
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return decodeHtmlEntities(text);
}

export function extractImages(html: string, baseUrl?: string): string[] {
  const urls: string[] = [];
  const imgRegex = /<img[^>]+src="([^">]+)"/gi;
  const srcsetRegex = /<img[^>]+srcset="([^">]+)"/gi;

  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    let url = m[1].trim();
    if (url.startsWith('//')) url = 'https:' + url;
    else if (baseUrl && url.startsWith('/')) url = new URL(url, baseUrl).href;
    if (url.startsWith('http') && !urls.includes(url)) urls.push(url);
  }

  while ((m = srcsetRegex.exec(html)) !== null) {
    const parts = m[1].split(',').map((p) => p.trim().split(/\s+/)[0]);
    for (const url of parts) {
      let full = url;
      if (full.startsWith('//')) full = 'https:' + full;
      else if (baseUrl && full.startsWith('/')) full = new URL(full, baseUrl).href;
      if (full.startsWith('http') && !urls.includes(full)) urls.push(full);
    }
  }

  return urls;
}

export function extractLinks(html: string): string[] {
  const linkRegex = /<a[^>]+href="([^">]+)"/gi;
  const urls: string[] = [];
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const url = m[1].trim();
    if (url.startsWith('http') && !urls.includes(url)) urls.push(url);
  }
  return urls;
}

export async function downloadImage(
  url: string,
  outputPath: string
): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioScraper/1.0)' },
    });
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    const fs = await import('fs');
    const path = await import('path');
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    return true;
  } catch {
    return false;
  }
}

export function getImageExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop()?.toLowerCase();
    if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return ext;
  } catch {}
  return 'jpg';
}

export interface ScrapedConference {
  id: string;
  title: string;
  topic?: string;
  type: 'virtual_conference' | 'conference' | 'virtual_talk' | 'talk';
  location?: string;
  videoUrl?: string;
  eventUrl?: string;
  tags?: string[];
}

export async function extractConferencesFromSpeakerPage(html: string, baseUrl: string): Promise<ScrapedConference[]> {
  const conferences: ScrapedConference[] = [];
  const linkRegex = /<a[^>]+href="([^"]*\/speaker\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
  let match;
  let id = 1;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const title = match[2].trim();
    if (!title || title.length < 5) continue;
    const conf: ScrapedConference = {
      id: String(id++),
      title,
      type:
        href.includes('virtual') || title.toLowerCase().includes('virtual') ? 'virtual_talk' : 'conference',
      eventUrl: href.startsWith('http') ? href : new URL(href, baseUrl).href,
    };
    conferences.push(conf);
  }
  return conferences;
}

export function slugifyForFilename(str: string): string {
  return str
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 80);
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
