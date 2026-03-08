import { NextResponse } from 'next/server';
import { getMediumArticles } from '@/lib/medium';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 25);
    const articles = await getMediumArticles(limit);
    return NextResponse.json(articles, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Articles API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Medium articles' },
      { status: 500 }
    );
  }
}
