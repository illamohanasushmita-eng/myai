"use client";

import { useState, useEffect } from "react";
import { useAIIntent } from "@/hooks/useAIIntent";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { useMusicAutomation } from "@/hooks/useMusicAutomation";
import { useUserPreferences } from "@/hooks/useUserPreferences";

/**
 * Complete example showing all Spotify integration features
 *
 * Features demonstrated:
 * 1. Intent detection from natural language
 * 2. Spotify track search
 * 3. Track playback
 * 4. Automation rules
 * 5. User preferences management
 */

interface MusicAssistantExampleProps {
  userId: string;
}

export function MusicAssistantExample({ userId }: MusicAssistantExampleProps) {
  const [userInput, setUserInput] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Hooks
  const { intent, loading: intentLoading, detectIntent } = useAIIntent();
  const {
    searchResults,
    loading: playerLoading,
    searchTracks,
    playTrack,
  } = useSpotifyPlayer();
  const {
    rules,
    loading: automationLoading,
    fetchRules,
    createRule,
    deleteRule,
    triggerAutomation,
    lastTrigger,
  } = useMusicAutomation();
  const {
    preferences,
    loading: prefLoading,
    fetchPreferences,
    addFavouriteHero,
    removeFavouriteHero,
  } = useUserPreferences();

  // Initialize
  useEffect(() => {
    fetchPreferences(userId);
    fetchRules(userId);
  }, [userId, fetchPreferences, fetchRules]);

  // Handle intent detection and search
  const handleSearch = async () => {
    if (!userInput.trim()) return;

    const detectedIntent = await detectIntent(userInput, userId);
    if (detectedIntent) {
      await searchTracks(detectedIntent.playlistQuery, userId, 15);
    }
  };

  // Handle track playback
  const handlePlayTrack = async (trackId: string) => {
    const success = await playTrack(trackId, userId);
    if (success) {
      setSelectedTrack(trackId);
    }
  };

  // Handle automation rule creation
  const handleCreateRule = async (triggerType: "night" | "travel" | "mood") => {
    const query = intent?.playlistQuery || "trending songs";
    await createRule(userId, triggerType, query);
  };

  // Handle automation trigger
  const handleTriggerAutomation = async (triggerType?: string) => {
    await triggerAutomation(userId, triggerType);
  };

  // Handle hero preference
  const handleToggleHero = async (hero: string) => {
    if (preferences?.favourite_heroes.includes(hero)) {
      await removeFavouriteHero(userId, hero);
    } else {
      await addFavouriteHero(userId, hero);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🎵 AI Music Assistant</h1>
        <p className="text-subtle-light dark:text-subtle-dark">
          Describe what you want to listen to, and I'll find it for you
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-white/30 dark:border-white/10">
        <h2 className="text-lg font-bold mb-4">🔍 Search Music</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g., 'Play my favourite hero songs' or 'Play relaxing songs at night'"
            className="flex-1 px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSearch}
            disabled={intentLoading || !userInput.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {intentLoading ? "⏳" : "🔎"}
          </button>
        </div>

        {/* Intent Display */}
        {intent && (
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {intent.mood && (
                <div>
                  <span className="text-subtle-light dark:text-subtle-dark">
                    Mood
                  </span>
                  <p className="font-semibold capitalize">{intent.mood}</p>
                </div>
              )}
              {intent.hero && (
                <div>
                  <span className="text-subtle-light dark:text-subtle-dark">
                    Hero
                  </span>
                  <p className="font-semibold capitalize">{intent.hero}</p>
                </div>
              )}
              {intent.timeContext && (
                <div>
                  <span className="text-subtle-light dark:text-subtle-dark">
                    Time
                  </span>
                  <p className="font-semibold capitalize">
                    {intent.timeContext}
                  </p>
                </div>
              )}
              {intent.language && (
                <div>
                  <span className="text-subtle-light dark:text-subtle-dark">
                    Language
                  </span>
                  <p className="font-semibold capitalize">{intent.language}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-subtle-light dark:text-subtle-dark mt-3">
              Query: {intent.playlistQuery} (Confidence:{" "}
              {(intent.confidence * 100).toFixed(0)}%)
            </p>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-white/30 dark:border-white/10">
          <h2 className="text-lg font-bold mb-4">
            🎵 Found {searchResults.length} Tracks
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {track.image && (
                  <img
                    src={track.image}
                    alt={track.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm">{track.name}</p>
                  <p className="text-xs text-subtle-light dark:text-subtle-dark truncate">
                    {track.artist}
                  </p>
                </div>
                <button
                  onClick={() => handlePlayTrack(track.id)}
                  disabled={playerLoading}
                  className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                    selectedTrack === track.id
                      ? "bg-primary text-white"
                      : "bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
                  }`}
                >
                  {selectedTrack === track.id ? "▶" : "Play"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Automation Triggers */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-white/30 dark:border-white/10">
          <h3 className="font-bold mb-3">⚡ Quick Triggers</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleTriggerAutomation("night")}
              className="w-full px-3 py-2 bg-black/10 dark:bg-white/10 rounded hover:bg-black/20 dark:hover:bg-white/20 text-sm font-semibold transition-colors"
            >
              🌙 Night Mode
            </button>
            <button
              onClick={() => handleTriggerAutomation("travel")}
              className="w-full px-3 py-2 bg-black/10 dark:bg-white/10 rounded hover:bg-black/20 dark:hover:bg-white/20 text-sm font-semibold transition-colors"
            >
              🚗 Travel Mode
            </button>
            <button
              onClick={() => handleTriggerAutomation()}
              className="w-full px-3 py-2 bg-black/10 dark:bg-white/10 rounded hover:bg-black/20 dark:hover:bg-white/20 text-sm font-semibold transition-colors"
            >
              🎯 Auto Trigger
            </button>
          </div>
        </div>

        {/* Automation Rules */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-white/30 dark:border-white/10">
          <h3 className="font-bold mb-3">📋 Automation Rules</h3>
          <button
            onClick={() => setShowRules(!showRules)}
            className="w-full px-3 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm font-semibold transition-colors"
          >
            {showRules ? "Hide" : "Show"} Rules ({rules.length})
          </button>
          {showRules && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded"
                >
                  <p className="font-semibold capitalize">
                    {rule.trigger_type}
                  </p>
                  <p className="text-subtle-light dark:text-subtle-dark truncate">
                    {rule.playlist_query}
                  </p>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-500 hover:text-red-600 text-xs mt-1"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-white/30 dark:border-white/10">
          <h3 className="font-bold mb-3">⭐ Preferences</h3>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="w-full px-3 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm font-semibold transition-colors"
          >
            {showPreferences ? "Hide" : "Show"} Preferences
          </button>
          {showPreferences && preferences && (
            <div className="mt-3 space-y-2">
              <div className="text-xs">
                <p className="font-semibold mb-1">Favourite Heroes:</p>
                <div className="flex flex-wrap gap-1">
                  {["prabhas", "mahesh", "ram"].map((hero) => (
                    <button
                      key={hero}
                      onClick={() => handleToggleHero(hero)}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                        preferences.favourite_heroes.includes(hero)
                          ? "bg-primary text-white"
                          : "bg-black/10 dark:bg-white/10"
                      }`}
                    >
                      {hero}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Last Trigger Results */}
      {lastTrigger?.triggered && (
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-white/30 dark:border-white/10">
          <h2 className="text-lg font-bold mb-4">
            ✨ Automation Triggered: {lastTrigger.triggerType}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
            {lastTrigger.recommendations.slice(0, 6).map((track: any) => (
              <div
                key={track.id}
                className="flex items-center gap-2 p-2 rounded bg-black/5 dark:bg-white/5"
              >
                {track.image && (
                  <img
                    src={track.image}
                    alt={track.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{track.name}</p>
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
