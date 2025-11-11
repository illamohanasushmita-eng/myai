# Spotify AI Music Assistant Integration Guide

## Overview
This guide covers the complete AI-driven Spotify automation feature integrated into the Next.js application.

## Setup Instructions

### 1. Environment Variables
Copy `.env.spotify.example` to `.env.local` and add your credentials:

```bash
SPOTIFY_CLIENT_ID=0c8f9e9564584bf7b7a7d05d20b0559d
SPOTIFY_CLIENT_SECRET=04bdbd29899b4b719439e723136cc378
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Setup
Run the SQL schema from `src/lib/db/schema.sql` in your Supabase dashboard:

```sql
-- Creates tables:
-- - user_preferences
-- - recent_listening
-- - automation_rules
-- - spotify_tokens
```

### 3. Install Dependencies
```bash
npm install @supabase/supabase-js
```

## API Endpoints

### POST /api/ai/intent
Detects user intent from natural language input.

**Request:**
```json
{
  "text": "Play my favourite hero songs",
  "userId": "user-id"
}
```

**Response:**
```json
{
  "mood": "energetic",
  "hero": "prabhas",
  "timeContext": "night",
  "language": "telugu",
  "playlistQuery": "prabhas telugu energetic night",
  "confidence": 0.95
}
```

### GET /api/spotify/search
Searches for tracks on Spotify.

**Query Parameters:**
- `q` (required): Search query
- `type` (optional): 'track' or 'playlist' (default: 'track')
- `limit` (optional): Number of results (default: 20)
- `userId` (optional): User ID for personalized results

**Response:**
```json
{
  "query": "prabhas songs",
  "type": "track",
  "results": [
    {
      "id": "track-id",
      "name": "Track Name",
      "artists": [{ "name": "Artist Name" }],
      "album": { "name": "Album", "images": [...] },
      "preview_url": "https://..."
    }
  ],
  "count": 20
}
```

### POST /api/spotify/play
Plays a track or playlist on user's Spotify device.

**Request:**
```json
{
  "trackId": "track-id",
  "userId": "user-id",
  "deviceId": "device-id" // optional
}
```

**Response:**
```json
{
  "success": true,
  "trackId": "track-id",
  "deviceId": "device-id"
}
```

### POST /api/automation/trigger
Triggers automation based on time/context.

**Request:**
```json
{
  "userId": "user-id",
  "triggerType": "night" // 'night', 'travel', or 'mood'
}
```

**Response:**
```json
{
  "triggered": true,
  "triggerType": "night",
  "rule": {
    "id": "rule-id",
    "playlistQuery": "relaxing night songs"
  },
  "recommendations": [...]
}
```

### GET /api/user/preferences
Fetches user preferences.

**Query Parameters:**
- `userId` (required): User ID

### POST /api/user/preferences
Updates user preferences.

**Request:**
```json
{
  "userId": "user-id",
  "favouriteHeroes": ["prabhas", "mahesh"],
  "favouriteArtists": ["artist1", "artist2"],
  "moodPreferences": { "relaxing": true, "energetic": true },
  "timePreferences": { "night": "relaxing", "morning": "energetic" }
}
```

### GET /api/automation/rules
Fetches automation rules for a user.

### POST /api/automation/rules
Creates a new automation rule.

**Request:**
```json
{
  "userId": "user-id",
  "triggerType": "night",
  "playlistQuery": "relaxing night songs"
}
```

### PUT /api/automation/rules
Updates an automation rule.

### DELETE /api/automation/rules
Deletes an automation rule.

## React Hooks

### useAIIntent()
Detects user intent from text input.

```typescript
const { intent, loading, error, detectIntent, reset } = useAIIntent();

await detectIntent("Play hero songs", userId);
```

### useSpotifyPlayer()
Manages Spotify search and playback.

```typescript
const { searchResults, loading, error, isPlaying, searchTracks, playTrack, playPlaylist } = useSpotifyPlayer();

await searchTracks("prabhas songs", userId);
await playTrack(trackId, userId);
```

### useMusicAutomation()
Manages automation rules and triggers.

```typescript
const { rules, loading, error, lastTrigger, fetchRules, createRule, updateRule, deleteRule, triggerAutomation } = useMusicAutomation();

await fetchRules(userId);
await createRule(userId, 'night', 'relaxing songs');
await triggerAutomation(userId);
```

### useUserPreferences()
Manages user preferences.

```typescript
const { preferences, loading, error, fetchPreferences, updatePreferences, addFavouriteHero, removeFavouriteHero } = useUserPreferences();

await fetchPreferences(userId);
await addFavouriteHero(userId, 'prabhas');
```

## Usage Example

```typescript
import { MusicAssistant } from '@/components/spotify/MusicAssistant';

export default function Page() {
  return <MusicAssistant userId="user-id" />;
}
```

## Intent Detection Examples

- "Play my favourite hero songs" → mood: energetic, hero: detected
- "Play relaxing songs at night" → mood: relaxing, timeContext: night
- "Play energetic music while travelling" → mood: energetic, timeContext: travel
- "Play sad songs" → mood: sad
- "Play trending Telugu hero songs" → language: telugu, hero: detected

## Supported Languages
- English
- Telugu
- Hindi
- Tamil

## Supported Moods
- relaxing
- energetic
- sad
- happy
- focus

## Supported Time Contexts
- night
- morning
- travel

## Supported Trigger Types
- night: Triggers at 10 PM - 6 AM
- travel: Manual trigger for travel scenarios
- mood: Manual mood-based trigger

## Error Handling

All API endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Server Error

## Performance Tips

1. Cache search results to reduce API calls
2. Use debouncing for input fields
3. Implement pagination for large result sets
4. Store user preferences locally with AsyncStorage
5. Use React.memo for track list components

## Security Considerations

1. Never expose SPOTIFY_CLIENT_SECRET in frontend code
2. Always validate user IDs on the backend
3. Implement rate limiting on API endpoints
4. Use HTTPS for all API calls
5. Validate and sanitize user input

## Troubleshooting

### "Failed to get Spotify access token"
- Check SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET
- Verify Spotify API credentials are valid

### "User preferences not found"
- Create preferences first using POST /api/user/preferences
- Ensure user_id is correct

### "No matching automation rules"
- Create automation rules using POST /api/automation/rules
- Check trigger_type matches current context

### "Failed to play track"
- Ensure user has active Spotify device
- Check device is online and connected
- Verify track is available in user's region

