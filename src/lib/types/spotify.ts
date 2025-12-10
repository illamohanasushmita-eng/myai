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
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  external_urls: { spotify: string };
  uri: string;
  tracks: {
    total: number;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  external_urls: { spotify: string };
  uri: string;
}

export interface UserIntent {
  mood: "relaxing" | "energetic" | "sad" | "happy" | "focus" | null;
  hero: string | null;
  timeContext: "night" | "morning" | "travel" | null;
  language: "english" | "telugu" | "hindi" | "tamil" | null;
  playlistQuery: string;
  confidence: number;
}

export interface AutomationRule {
  id: string;
  user_id: string;
  trigger_type: "night" | "travel" | "mood";
  playlist_query: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  favourite_heroes: string[];
  favourite_artists: string[];
  mood_preferences: Record<string, boolean>;
  time_preferences: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface RecentListening {
  id: string;
  user_id: string;
  query: string;
  mood: string | null;
  hero: string | null;
  time_context: string | null;
  track_id: string | null;
  track_name: string | null;
  artist_name: string | null;
  timestamp: string;
}

export interface SpotifyToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}
