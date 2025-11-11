'use client';

import { useState, useCallback } from 'react';

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

export function useUserPreferences() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const fetchPreferences = useCallback(async (userId: string): Promise<UserPreferences | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/user/preferences?userId=${userId}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(
    async (
      userId: string,
      updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
    ): Promise<UserPreferences | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            ...updates,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update preferences');
        }

        const data = await response.json();
        setPreferences(data);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addFavouriteHero = useCallback(
    async (userId: string, hero: string): Promise<UserPreferences | null> => {
      if (!preferences) return null;

      const updatedHeroes = Array.from(new Set([...preferences.favourite_heroes, hero]));
      return updatePreferences(userId, {
        favourite_heroes: updatedHeroes,
      });
    },
    [preferences, updatePreferences]
  );

  const removeFavouriteHero = useCallback(
    async (userId: string, hero: string): Promise<UserPreferences | null> => {
      if (!preferences) return null;

      const updatedHeroes = preferences.favourite_heroes.filter((h) => h !== hero);
      return updatePreferences(userId, {
        favourite_heroes: updatedHeroes,
      });
    },
    [preferences, updatePreferences]
  );

  const addFavouriteArtist = useCallback(
    async (userId: string, artist: string): Promise<UserPreferences | null> => {
      if (!preferences) return null;

      const updatedArtists = Array.from(new Set([...preferences.favourite_artists, artist]));
      return updatePreferences(userId, {
        favourite_artists: updatedArtists,
      });
    },
    [preferences, updatePreferences]
  );

  const removeFavouriteArtist = useCallback(
    async (userId: string, artist: string): Promise<UserPreferences | null> => {
      if (!preferences) return null;

      const updatedArtists = preferences.favourite_artists.filter((a) => a !== artist);
      return updatePreferences(userId, {
        favourite_artists: updatedArtists,
      });
    },
    [preferences, updatePreferences]
  );

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
    addFavouriteHero,
    removeFavouriteHero,
    addFavouriteArtist,
    removeFavouriteArtist,
  };
}

