import { NextResponse } from 'next/server';
import { getPodcastEpisodesFromPlaylist } from '@/lib/youtube';
import { getYouTubeApiKeyFromRemoteConfig } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  let apiKey: string | undefined;

  // 1. Try env first (simplest for local dev)
  apiKey = (process.env.YOUTUBE_API_KEY || '').trim();

  // 2. Fallback to Firebase Remote Config (requiere FIREBASE_ADMIN_SDK_KEY)
  if (!apiKey) {
    try {
      apiKey = await getYouTubeApiKeyFromRemoteConfig();
    } catch (error) {
      console.error('YouTube API key error:', error);
    }
  }

  // 3. Fallback: Firebase apiKey (si el proyecto tiene YouTube Data API v3 habilitado)
  if (!apiKey) {
    apiKey = (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '').trim();
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'YouTube API key not configured. Add YOUTUBE_API_KEY to .env.local (get one at https://console.cloud.google.com/apis/credentials)',
      },
      { status: 503 }
    );
  }

  try {
    const episodes = await getPodcastEpisodesFromPlaylist(apiKey);
    return NextResponse.json(episodes, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Episodes API error:', message, error);
    return NextResponse.json(
      {
        error: 'Failed to fetch podcast episodes',
        details: message,
      },
      { status: 500 }
    );
  }
}
