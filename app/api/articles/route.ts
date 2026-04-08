import { NextResponse } from 'next/server';
import { getMediumArticles } from '@/lib/medium';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const cacheHeaders = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '10', 10)), 50);
    const articles = await getMediumArticles(limit);
    return NextResponse.json(articles, {
      headers: cacheHeaders,
    });
  } catch (error) {
    console.error('Articles API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Medium articles' },
      { status: 500 }
    );
  }
}
