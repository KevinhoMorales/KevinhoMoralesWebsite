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

export async function getMediumArticles(maxResults = 10): Promise<MediumArticle[]> {
  const feed = await parser.parseURL(MEDIUM_FEED_URL);

  return (feed.items || []).slice(0, maxResults).map((item) => {
    const content = (item as { content?: string }).content || item.contentSnippet || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    const image = imgMatch?.[1] || (item as { 'media:thumbnail'?: { $?: { url?: string } } })['media:thumbnail']?.$?.url;

    return {
      title: item.title || '',
      link: item.link || '',
      publishDate: item.pubDate || '',
      excerpt: item.contentSnippet || content.replace(/<[^>]*>/g, '').slice(0, 200) + '...',
      image,
    };
  });
}
