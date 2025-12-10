/**
 * Spotify Automation Module
 * Handles voice-triggered Spotify search and playback
 */

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  uri: string;
  imageUrl?: string;
}

export interface SpotifySearchResult {
  success: boolean;
  tracks: SpotifyTrack[];
  error?: string;
}

export interface SpotifyPlayResult {
  success: boolean;
  message: string;
  error?: string;
}

// ============================================================================
// SPOTIFY SEARCH
// ============================================================================

export async function searchSpotify(
  query: string,
  userId?: string,
  limit: number = 5,
): Promise<SpotifySearchResult> {
  try {
    const params = new URLSearchParams({
      q: query,
      type: "track",
      limit: limit.toString(),
    });

    if (userId) {
      params.append("userId", userId);
    }

    const response = await fetch(`/api/spotify/search?${params}`);

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        tracks: [],
        error: data.error || "Search failed",
      };
    }

    return {
      success: true,
      tracks: data.tracks || [],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Spotify search error:", error);

    return {
      success: false,
      tracks: [],
      error: errorMessage,
    };
  }
}

// ============================================================================
// SPOTIFY PLAYBACK
// ============================================================================

export async function playSpotifyTrack(
  trackId: string,
  userId: string,
  deviceId?: string,
): Promise<SpotifyPlayResult> {
  try {
    const response = await fetch("/api/spotify/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trackId,
        userId,
        deviceId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Playback failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: data.success,
      message: data.message || "Playing track",
      error: data.error,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Spotify playback error:", error);

    return {
      success: false,
      message: "Failed to play track",
      error: errorMessage,
    };
  }
}

// ============================================================================
// SPOTIFY AUTOMATION WORKFLOW
// ============================================================================

export async function automateSpotifyPlayback(
  musicQuery: string,
  userId: string,
  deviceId?: string,
): Promise<SpotifyPlayResult> {
  try {
    // Step 1: Search for tracks
    const searchResult = await searchSpotify(musicQuery, userId, 1);

    if (!searchResult.success || searchResult.tracks.length === 0) {
      return {
        success: false,
        message: `No tracks found for "${musicQuery}"`,
        error: searchResult.error,
      };
    }

    // Step 2: Get first track
    const firstTrack = searchResult.tracks[0];

    // Step 3: Play the track
    const playResult = await playSpotifyTrack(firstTrack.id, userId, deviceId);

    return playResult;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Spotify automation error:", error);

    return {
      success: false,
      message: "Failed to play music",
      error: errorMessage,
    };
  }
}

// ============================================================================
// SPOTIFY PLAYLIST AUTOMATION
// ============================================================================

export async function automateSpotifyPlaylist(
  playlistQuery: string,
  userId: string,
  deviceId?: string,
): Promise<SpotifyPlayResult> {
  try {
    const response = await fetch("/api/spotify/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playlistQuery,
        userId,
        deviceId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Playlist playback failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: data.success,
      message: data.message || "Playing playlist",
      error: data.error,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Spotify playlist automation error:", error);

    return {
      success: false,
      message: "Failed to play playlist",
      error: errorMessage,
    };
  }
}
