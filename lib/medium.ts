import Parser from 'rss-parser';

const MEDIUM_FEED_URL = 'https://medium.com/feed/@kevinhomorales';

export interface MediumArticle {
  title: string;
  link: string;
  publishDate: string;
  excerpt: string;
  image?: string;
}

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

function mapFeedItem(item: Parser.Item): MediumArticle {
  const content = (item as { content?: string }).content || item.contentSnippet || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  const image =
    imgMatch?.[1] || (item as { 'media:thumbnail'?: { $?: { url?: string } } })['media:thumbnail']?.$?.url;

  return {
    title: item.title || '',
    link: item.link || '',
    publishDate: item.pubDate || '',
    excerpt: item.contentSnippet || content.replace(/<[^>]*>/g, '').slice(0, 200) + '...',
    image,
  };
}

/**
 * Lista completa del feed (orden Medium: más reciente primero).
 * Nota: el RSS público de Medium suele incluir como máximo ~10 entradas; no expone todo el archivo histórico.
 */
export async function getAllMediumArticles(): Promise<MediumArticle[]> {
  const feed = await parser.parseURL(MEDIUM_FEED_URL);
  return (feed.items || []).map(mapFeedItem);
}

/** Primeros `maxResultados` artículos (p. ej. home / API con `limit`). */
export async function getMediumArticles(maxResults = 10): Promise<MediumArticle[]> {
  const all = await getAllMediumArticles();
  return all.slice(0, maxResults);
}
