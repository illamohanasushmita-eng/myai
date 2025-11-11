# Spotify Integration - Quick Reference

## File Structure
```
src/
├── lib/
│   ├── spotify/
│   │   ├── auth.ts          # Token management
│   │   ├── search.ts        # Track/playlist search
│   │   ├── play.ts          # Playback control
│   │   └── utils.ts         # Helper functions
│   ├── ai/
│   │   └── intent-detector.ts # Intent classification
│   └── types/
│       └── spotify.ts       # TypeScript types
├── app/api/
│   ├── ai/intent/route.ts
│   ├── spotify/
│   │   ├── search/route.ts
│   │   └── play/route.ts
│   ├── automation/
│   │   ├── trigger/route.ts
│   │   └── rules/route.ts
│   └── user/preferences/route.ts
├── hooks/
│   ├── useAIIntent.ts
│   ├── useSpotifyPlayer.ts
│   ├── useMusicAutomation.ts
│   └── useUserPreferences.ts
└── components/spotify/
    └── MusicAssistant.tsx
```

## Quick Start

### 1. Setup Environment
```bash
# Add to .env.local
SPOTIFY_CLIENT_ID=0c8f9e9564584bf7b7a7d05d20b0559d
SPOTIFY_CLIENT_SECRET=04bdbd29899b4b719439e723136cc378
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### 2. Run Database Schema
```sql
-- Execute in Supabase SQL Editor
-- Copy content from src/lib/db/schema.sql
```

### 3. Use in Component
```typescript
import { MusicAssistant } from '@/components/spotify/MusicAssistant';

export default function Page() {
  return <MusicAssistant userId="user-123" />;
}
```

## API Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/intent` | POST | Detect user intent |
| `/api/spotify/search` | GET | Search tracks |
| `/api/spotify/play` | POST | Play track/playlist |
| `/api/automation/trigger` | POST | Trigger automation |
| `/api/user/preferences` | GET/POST | Manage preferences |
| `/api/automation/rules` | GET/POST/PUT/DELETE | Manage rules |

## Hook Quick Reference

```typescript
// Detect intent
const { intent, detectIntent } = useAIIntent();
await detectIntent("Play hero songs", userId);

// Search and play
const { searchResults, searchTracks, playTrack } = useSpotifyPlayer();
await searchTracks("prabhas songs", userId);
await playTrack(trackId, userId);

// Automation
const { rules, createRule, triggerAutomation } = useMusicAutomation();
await createRule(userId, 'night', 'relaxing songs');
await triggerAutomation(userId);

// Preferences
const { preferences, addFavouriteHero } = useUserPreferences();
await addFavouriteHero(userId, 'prabhas');
```

## Intent Detection Keywords

### Moods
- **relaxing**: chill, calm, peaceful, sleep, meditation
- **energetic**: energy, pump, workout, gym, running, dance
- **sad**: melancholy, emotional, heartbreak, breakup
- **happy**: cheerful, uplifting, positive, joy
- **focus**: study, work, concentrate, productivity

### Time Contexts
- **night**: sleep, bedtime, late, evening
- **morning**: wake, breakfast, sunrise, dawn
- **travel**: drive, car, road, journey, commute

### Heroes (Telugu)
- prabhas, mahesh, ram, allu, ntr, chiranjeevi, balakrishna

### Heroes (Hindi)
- shah rukh, salman, aamir, akshay, hrithik, ranveer

### Heroes (Tamil)
- rajinikanth, kamal, vijay, ajith, suriya, dhanush

### Languages
- telugu, hindi, tamil, english

## Common Patterns

### Search and Play
```typescript
const { intent, detectIntent } = useAIIntent();
const { searchTracks, playTrack } = useSpotifyPlayer();

const detected = await detectIntent(userText, userId);
const results = await searchTracks(detected.playlistQuery, userId);
await playTrack(results[0].id, userId);
```

### Create Automation Rule
```typescript
const { createRule } = useMusicAutomation();
await createRule(userId, 'night', 'relaxing sleep songs');
```

### Trigger Automation
```typescript
const { triggerAutomation } = useMusicAutomation();
const result = await triggerAutomation(userId, 'night');
if (result.triggered) {
  // Play recommended tracks
}
```

### Update Preferences
```typescript
const { updatePreferences } = useUserPreferences();
await updatePreferences(userId, {
  favourite_heroes: ['prabhas', 'mahesh'],
  favourite_artists: ['artist1', 'artist2'],
});
```

## Database Tables

### user_preferences
- user_id (UUID)
- favourite_heroes (TEXT[])
- favourite_artists (TEXT[])
- mood_preferences (JSONB)
- time_preferences (JSONB)

### recent_listening
- id (UUID)
- user_id (UUID)
- query (TEXT)
- mood (TEXT)
- hero (TEXT)
- time_context (TEXT)
- track_id (TEXT)
- timestamp (TIMESTAMP)

### automation_rules
- id (UUID)
- user_id (UUID)
- trigger_type (TEXT: 'night'|'travel'|'mood')
- playlist_query (TEXT)
- is_active (BOOLEAN)

### spotify_tokens
- id (UUID)
- user_id (UUID)
- access_token (TEXT)
- refresh_token (TEXT)
- expires_at (TIMESTAMP)

## Utility Functions

```typescript
import { 
  formatTrackDuration,
  getTrackImageUrl,
  getArtistNames,
  buildSpotifyUri,
  generatePlaylistQueryFromPreferences,
  isTrackPreviewAvailable,
  sortTracksByPopularity,
  filterTracksByDuration,
  deduplicateTracks,
  groupTracksByArtist,
  getRandomTracks
} from '@/lib/spotify/utils';
```

## Error Handling

```typescript
const { intent, error, loading } = useAIIntent();

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
if (intent) return <div>Intent: {intent.mood}</div>;
```

## Performance Tips

1. Debounce search input
2. Cache search results
3. Use React.memo for lists
4. Implement pagination
5. Lazy load images
6. Use AsyncStorage for local caching

## Supported Regions

Spotify API works globally. Check regional availability for specific tracks.

## Rate Limits

- Spotify API: 429 Too Many Requests
- Implement exponential backoff
- Cache results to reduce calls

## Next Steps

1. ✅ Setup environment variables
2. ✅ Run database schema
3. ✅ Test API endpoints
4. ✅ Integrate MusicAssistant component
5. ✅ Add to your pages
6. ✅ Customize UI as needed

