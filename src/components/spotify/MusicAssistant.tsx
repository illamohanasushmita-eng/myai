"use client";

import { useState, useEffect } from "react";
import { useAIIntent } from "@/hooks/useAIIntent";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { useMusicAutomation } from "@/hooks/useMusicAutomation";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Button } from "@/components/ui/button";

interface MusicAssistantProps {
  userId: string;
}

export function MusicAssistant({ userId }: MusicAssistantProps) {
  const [userInput, setUserInput] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  const { intent, loading: intentLoading, detectIntent } = useAIIntent();
  const {
    searchResults,
    loading: playerLoading,
    searchTracks,
    playTrack,
  } = useSpotifyPlayer();
  const { lastTrigger, triggerAutomation } = useMusicAutomation();
  const { preferences, fetchPreferences } = useUserPreferences();

  useEffect(() => {
    fetchPreferences(userId);
  }, [userId, fetchPreferences]);

  const handleDetectIntent = async () => {
    if (!userInput.trim()) return;

    const detectedIntent = await detectIntent(userInput, userId);
    if (detectedIntent) {
      await searchTracks(detectedIntent.playlistQuery, userId);
    }
  };

  const handlePlayTrack = async (trackId: string) => {
    const success = await playTrack(trackId, userId);
    if (success) {
      setSelectedTrack(trackId);
    }
  };

  const handleTriggerAutomation = async () => {
    await triggerAutomation(userId);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Input Section */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm frosted-glass border border-white/30 dark:border-white/10">
        <h2 className="text-xl font-bold mb-4">Music Assistant</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleDetectIntent()}
            placeholder="Try: 'Play my favourite hero songs' or 'Play relaxing songs at night'"
            className="flex-1 px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={handleDetectIntent}
            disabled={intentLoading || !userInput.trim()}
            className="px-6"
          >
            {intentLoading ? "Detecting..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Intent Display */}
      {intent && (
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm frosted-glass border border-white/30 dark:border-white/10">
          <h3 className="font-bold mb-3">Detected Intent</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {intent.mood && (
              <div>
                <span className="text-subtle-light dark:text-subtle-dark">
                  Mood:
                </span>
                <p className="font-semibold capitalize">{intent.mood}</p>
              </div>
            )}
            {intent.hero && (
              <div>
                <span className="text-subtle-light dark:text-subtle-dark">
                  Hero:
                </span>
                <p className="font-semibold capitalize">{intent.hero}</p>
              </div>
            )}
            {intent.timeContext && (
              <div>
                <span className="text-subtle-light dark:text-subtle-dark">
                  Time:
                </span>
                <p className="font-semibold capitalize">{intent.timeContext}</p>
              </div>
            )}
            {intent.language && (
              <div>
                <span className="text-subtle-light dark:text-subtle-dark">
                  Language:
                </span>
                <p className="font-semibold capitalize">{intent.language}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-subtle-light dark:text-subtle-dark mt-3">
            Query: {intent.playlistQuery}
          </p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm frosted-glass border border-white/30 dark:border-white/10">
          <h3 className="font-bold mb-4">
            Found {searchResults.length} Tracks
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {searchResults.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {track.image && (
                  <img
                    src={track.image}
                    alt={track.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{track.name}</p>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark truncate">
                    {track.artist}
                  </p>
                </div>
                <Button
                  onClick={() => handlePlayTrack(track.id)}
                  disabled={playerLoading}
                  size="sm"
                  variant={selectedTrack === track.id ? "default" : "outline"}
                >
                  {selectedTrack === track.id ? "▶" : "Play"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automation Trigger */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm frosted-glass border border-white/30 dark:border-white/10">
        <h3 className="font-bold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => triggerAutomation(userId, "night")}
            variant="outline"
            size="sm"
          >
            🌙 Night
          </Button>
          <Button
            onClick={() => triggerAutomation(userId, "travel")}
            variant="outline"
            size="sm"
          >
            🚗 Travel
          </Button>
          <Button onClick={handleTriggerAutomation} variant="outline" size="sm">
            ⚡ Auto
          </Button>
        </div>
      </div>

      {/* Last Trigger Results */}
      {lastTrigger?.triggered && (
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm frosted-glass border border-white/30 dark:border-white/10">
          <h3 className="font-bold mb-3">
            Automation Triggered: {lastTrigger.triggerType}
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {lastTrigger.recommendations.slice(0, 5).map((track: any) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-black/5 dark:hover:bg-white/5"
              >
                {track.image && (
                  <img
                    src={track.image}
                    alt={track.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{track.name}</p>
                  <p className="text-xs text-subtle-light dark:text-subtle-dark truncate">
                    {track.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
