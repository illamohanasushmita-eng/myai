import { SpotifyTrack } from "@/lib/types/spotify";

export function formatTrackDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function getTrackImageUrl(
  track: SpotifyTrack,
  size: "small" | "medium" | "large" = "medium",
): string {
  const images = track.album.images;
  if (!images || images.length === 0) {
    return "";
  }

  if (size === "small") {
    return images[images.length - 1]?.url || "";
  } else if (size === "large") {
    return images[0]?.url || "";
  } else {
    return images[Math.floor(images.length / 2)]?.url || "";
  }
}

export function getArtistNames(track: SpotifyTrack): string {
  return track.artists.map((artist) => artist.name).join(", ");
}

export function buildSpotifyUri(
  type: "track" | "playlist" | "artist",
  id: string,
): string {
  return `spotify:${type}:${id}`;
}

export function extractSpotifyId(uri: string): string {
  const parts = uri.split(":");
  return parts[parts.length - 1];
}

export function getSpotifyWebUrl(
  type: "track" | "playlist" | "artist",
  id: string,
): string {
  return `https://open.spotify.com/${type}/${id}`;
}

export function generatePlaylistQueryFromPreferences(
  heroes: string[],
  artists: string[],
  mood?: string,
  language?: string,
): string {
  const parts: string[] = [];

  if (heroes.length > 0) {
    parts.push(heroes[0]);
  }

  if (artists.length > 0) {
    parts.push(artists[0]);
  }

  if (mood) {
    parts.push(mood);
  }

  if (language) {
    parts.push(language);
  }

  return parts.length > 0 ? parts.join(" ") : "trending songs";
}

export function isTrackPreviewAvailable(track: SpotifyTrack): boolean {
  return track.preview_url !== null && track.preview_url !== "";
}

export function sortTracksByPopularity(tracks: SpotifyTrack[]): SpotifyTrack[] {
  return [...tracks].sort((a, b) => {
    const aPopularity = (a as any).popularity || 0;
    const bPopularity = (b as any).popularity || 0;
    return bPopularity - aPopularity;
  });
}

export function filterTracksByDuration(
  tracks: SpotifyTrack[],
  minMs: number = 0,
  maxMs: number = Infinity,
): SpotifyTrack[] {
  return tracks.filter(
    (track) => track.duration_ms >= minMs && track.duration_ms <= maxMs,
  );
}

export function deduplicateTracks(tracks: SpotifyTrack[]): SpotifyTrack[] {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (seen.has(track.id)) {
      return false;
    }
    seen.add(track.id);
    return true;
  });
}

export function groupTracksByArtist(
  tracks: SpotifyTrack[],
): Map<string, SpotifyTrack[]> {
  const grouped = new Map<string, SpotifyTrack[]>();

  tracks.forEach((track) => {
    const artistName = track.artists[0]?.name || "Unknown";
    if (!grouped.has(artistName)) {
      grouped.set(artistName, []);
    }
    grouped.get(artistName)!.push(track);
  });

  return grouped;
}

export function getRandomTracks(
  tracks: SpotifyTrack[],
  count: number,
): SpotifyTrack[] {
  const shuffled = [...tracks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
