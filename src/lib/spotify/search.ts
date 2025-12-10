import { getSpotifyAccessToken } from "./auth";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  external_urls: { spotify: string };
  preview_url: string | null;
}

export interface SpotifySearchResult {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

export async function searchSpotifyTracks(
  query: string,
  userId?: string,
  limit: number = 20,
): Promise<SpotifyTrack[]> {
  try {
    const accessToken = await getSpotifyAccessToken(userId || "system");

    const params = new URLSearchParams({
      q: query,
      type: "track",
      limit: limit.toString(),
    });

    const response = await fetch(`${SPOTIFY_API_BASE}/search?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.statusText}`);
    }

    const data: SpotifySearchResult = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error("Error searching Spotify tracks:", error);
    throw error;
  }
}

export async function getTrackById(
  trackId: string,
  userId?: string,
): Promise<SpotifyTrack> {
  try {
    const accessToken = await getSpotifyAccessToken(userId || "system");

    const response = await fetch(`${SPOTIFY_API_BASE}/tracks/${trackId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get track: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting track by ID:", error);
    throw error;
  }
}

export async function getRecommendations(
  seedTracks: string[],
  userId?: string,
  limit: number = 20,
): Promise<SpotifyTrack[]> {
  try {
    const accessToken = await getSpotifyAccessToken(userId || "system");

    const params = new URLSearchParams({
      seed_tracks: seedTracks.slice(0, 5).join(","),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${SPOTIFY_API_BASE}/recommendations?${params}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get recommendations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    throw error;
  }
}

export async function searchPlaylist(
  query: string,
  userId?: string,
  limit: number = 10,
): Promise<any[]> {
  try {
    const accessToken = await getSpotifyAccessToken(userId || "system");

    const params = new URLSearchParams({
      q: query,
      type: "playlist",
      limit: limit.toString(),
    });

    const response = await fetch(`${SPOTIFY_API_BASE}/search?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify playlist search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.playlists.items;
  } catch (error) {
    console.error("Error searching Spotify playlists:", error);
    throw error;
  }
}
