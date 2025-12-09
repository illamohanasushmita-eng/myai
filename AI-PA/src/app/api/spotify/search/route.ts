import { NextRequest, NextResponse } from 'next/server';
import { searchSpotifyTracks, searchPlaylist } from '@/lib/spotify/search';

/**
 * GET /api/spotify/search
 * Search for tracks or playlists on Spotify
 *
 * Query Parameters:
 * - q (required): Search query (song name, artist, genre, etc.)
 * - type (optional): 'track' or 'playlist' (default: 'track')
 * - limit (optional): Number of results (default: 5, max: 50)
 * - userId (optional): User ID for personalized search
 *
 * Response:
 * {
 *   "success": true,
 *   "query": "string",
 *   "type": "track" | "playlist",
 *   "tracks": [
 *     {
 *       "id": "string",
 *       "name": "string",
 *       "artists": [{ "name": "string" }],
 *       "album": { "name": "string" }
 *     }
 *   ],
 *   "count": number
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'track';
    const limitParam = searchParams.get('limit') || '5';
    const userId = searchParams.get('userId');

    console.log('🔍 [SPOTIFY SEARCH API] Incoming request:', {
      query,
      type,
      limit: limitParam,
      userId: userId ? '***' : 'none',
    });

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      console.warn('⚠️ [SPOTIFY SEARCH API] Missing or empty query parameter');
      return NextResponse.json(
        {
          success: false,
          error: 'Query parameter is required',
          tracks: [],
          count: 0,
        },
        { status: 400 }
      );
    }

    // Parse and validate limit
    let limit = parseInt(limitParam);
    if (isNaN(limit) || limit < 1) {
      limit = 5;
    }
    if (limit > 50) {
      limit = 50;
    }

    console.log(`🔍 [SPOTIFY SEARCH API] Searching for: "${query}" (type: ${type}, limit: ${limit})`);

    let results;

    try {
      if (type === 'playlist') {
        console.log('📋 [SPOTIFY SEARCH API] Searching playlists...');
        results = await searchPlaylist(query, userId || undefined, limit);
      } else {
        console.log('🎵 [SPOTIFY SEARCH API] Searching tracks...');
        results = await searchSpotifyTracks(query, userId || undefined, limit);
      }
    } catch (searchError) {
      console.error('❌ [SPOTIFY SEARCH API] Search failed:', searchError);
      // Return empty results instead of error for graceful degradation
      results = [];
    }

    const elapsedTime = performance.now() - startTime;
    console.log(`✅ [SPOTIFY SEARCH API] Search completed in ${elapsedTime.toFixed(0)}ms, found ${results.length} results`);

    // Format response with track details
    const tracks = results.map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: track.artists?.map((a: any) => a.name) || [],
      album: track.album?.name || 'Unknown Album',
    }));

    return NextResponse.json({
      success: true,
      query,
      type,
      tracks,
      count: tracks.length,
    });

  } catch (error) {
    const elapsedTime = performance.now() - startTime;
    console.error(`❌ [SPOTIFY SEARCH API] Error after ${elapsedTime.toFixed(0)}ms:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search Spotify',
        details: errorMessage,
        tracks: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}

