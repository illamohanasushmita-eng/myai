'use client';

import { useState, useCallback } from 'react';

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  previewUrl: string | null;
  externalUrl: string;
}

export interface SearchResult {
  query: string;
  type: string;
  results: SpotifyTrack[];
  count: number;
}

export function useSpotifyPlayer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const searchTracks = useCallback(
    async (query: string, userId?: string, limit: number = 20): Promise<SpotifyTrack[]> => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          q: query,
          type: 'track',
          limit: limit.toString(),
        });

        if (userId) {
          params.append('userId', userId);
        }

        const response = await fetch(`/api/spotify/search?${params}`);

        if (!response.ok) {
          throw new Error('Failed to search tracks');
        }

        const data: SearchResult = await response.json();
        const formattedResults = data.results.map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || 'Unknown',
          album: track.album.name,
          image: track.album.images[0]?.url || '',
          previewUrl: track.preview_url,
          externalUrl: track.external_urls.spotify,
        }));

        setSearchResults(formattedResults);
        return formattedResults;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const playTrack = useCallback(
    async (trackId: string, userId: string, deviceId?: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/spotify/play', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trackId,
            userId,
            deviceId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to play track');
        }

        const data = await response.json();
        setIsPlaying(data.success);
        return data.success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const playPlaylist = useCallback(
    async (playlistId: string, userId: string, deviceId?: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/spotify/play', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playlistId,
            userId,
            deviceId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to play playlist');
        }

        const data = await response.json();
        setIsPlaying(data.success);
        return data.success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setSearchResults([]);
    setError(null);
    setIsPlaying(false);
  }, []);

  return {
    searchResults,
    loading,
    error,
    isPlaying,
    searchTracks,
    playTrack,
    playPlaylist,
    reset,
  };
}

