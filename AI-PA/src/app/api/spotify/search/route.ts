import { NextRequest, NextResponse } from 'next/server';
import { searchSpotifyTracks, searchPlaylist } from '@/lib/spotify/search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'track';
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    let results;

    if (type === 'playlist') {
      results = await searchPlaylist(query, userId || undefined, limit);
    } else {
      results = await searchSpotifyTracks(query, userId || undefined, limit);
    }

    return NextResponse.json({
      query,
      type,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return NextResponse.json(
      { error: 'Failed to search Spotify' },
      { status: 500 }
    );
  }
}

