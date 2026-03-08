const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export const DEVLOKOS_PLAYLIST_ID = 'PLPXi7Vgl6Ak-Bm8Y2Xxhp1dwrzWT3AbjZ';

export interface YouTubeEpisode {
  videoId: string;
  title: string;
  thumbnail: string;
  publishDate: string;
  description?: string;
}

export interface PodcastEpisode {
  videoId: string;
  title: string;
  episodeTitle: string;
  guest: string;
  thumbnail: string;
  publishDate: string;
  duration: string;
  description: string;
  season: 1 | 2;
  spotifyUrl?: string;
}

function parseDuration(iso8601: string): string {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds} s`);
  return parts.join(' ') || '0 min';
}

function parseEpisodeFromTitle(fullTitle: string): {
  episodeTitle: string;
  guest: string;
  season: 1 | 2;
} {
  const parts = fullTitle.split('||').map((p) => p.trim());
  const episodeTitle = parts[1] || fullTitle;
  const guest = parts[2] || '';
  const season = fullTitle.includes('S2') ? 2 : fullTitle.includes('S1') ? 1 : 2;
  return { episodeTitle, guest, season };
}

interface PlaylistItem {
  contentDetails: { videoId: string };
}

interface VideoItem {
  id: string;
  snippet: {
    title: string;
    thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
    publishedAt: string;
    description: string;
  };
  contentDetails: { duration: string };
}

export async function getYouTubePlaylistVideos(
  playlistId: string,
  apiKey: string
): Promise<PodcastEpisode[]> {
  const videoIds: string[] = [];
  let nextPageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: 'contentDetails',
      playlistId,
      maxResults: '50',
      key: apiKey,
    });
    if (nextPageToken) params.set('pageToken', nextPageToken);

    const res = await fetch(`${YOUTUBE_API_BASE}/playlistItems?${params}`);
    const data = await res.json();

    if (data.error) throw new Error(data.error.message || 'YouTube API error');

    const items: PlaylistItem[] = data.items || [];
    videoIds.push(...items.map((i) => i.contentDetails.videoId));
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  if (videoIds.length === 0) return [];

  const episodes: PodcastEpisode[] = [];
  const SPOTIFY_SHOW_URL = 'https://podcasters.spotify.com/pod/show/devlokos';

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      id: batch.join(','),
      key: apiKey,
    });

    const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
    const data = await res.json();

    if (data.error) throw new Error(data.error.message || 'YouTube API error');

    const items: VideoItem[] = data.items || [];
    for (const item of items) {
      const snippet = item.snippet || {};
      const { episodeTitle, guest, season } = parseEpisodeFromTitle(snippet.title || '');
      episodes.push({
        videoId: item.id,
        title: snippet.title || '',
        episodeTitle,
        guest,
        thumbnail:
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          '',
        publishDate: snippet.publishedAt || '',
        duration: parseDuration(item.contentDetails?.duration || ''),
        description: snippet.description || '',
        season,
        spotifyUrl: SPOTIFY_SHOW_URL,
      });
    }
  }

  episodes.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  return episodes;
}

let cache: { episodes: PodcastEpisode[]; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000;

export async function getPodcastEpisodesFromPlaylist(
  apiKey: string
): Promise<PodcastEpisode[]> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.episodes;
  }
  const episodes = await getYouTubePlaylistVideos(DEVLOKOS_PLAYLIST_ID, apiKey);
  cache = { episodes, timestamp: Date.now() };
  return episodes;
}

export function clearPodcastCache(): void {
  cache = null;
}
