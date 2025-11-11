# Spotify Integration - Testing Guide

## Prerequisites

1. Spotify Developer Account with API credentials
2. Supabase project with schema initialized
3. Next.js development server running
4. Postman or similar API testing tool (optional)

## Environment Setup for Testing

```bash
# .env.local
SPOTIFY_CLIENT_ID=0c8f9e9564584bf7b7a7d05d20b0559d
SPOTIFY_CLIENT_SECRET=04bdbd29899b4b719439e723136cc378
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## API Endpoint Testing

### 1. Test Intent Detection

**Endpoint**: `POST /api/ai/intent`

**Test Cases**:

```bash
# Test 1: Hero songs
curl -X POST http://localhost:3000/api/ai/intent \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Play my favourite hero songs",
    "userId": "test-user-123"
  }'

# Expected Response:
# {
#   "mood": "energetic",
#   "hero": "prabhas",
#   "timeContext": null,
#   "language": "english",
#   "playlistQuery": "prabhas energetic",
#   "confidence": 0.9
# }

# Test 2: Relaxing night songs
curl -X POST http://localhost:3000/api/ai/intent \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Play relaxing songs at night",
    "userId": "test-user-123"
  }'

# Test 3: Telugu hero songs
curl -X POST http://localhost:3000/api/ai/intent \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Play trending Telugu hero songs",
    "userId": "test-user-123"
  }'

# Test 4: Travel music
curl -X POST http://localhost:3000/api/ai/intent \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Play energetic music while travelling",
    "userId": "test-user-123"
  }'
```

### 2. Test Spotify Search

**Endpoint**: `GET /api/spotify/search`

```bash
# Test 1: Search tracks
curl "http://localhost:3000/api/spotify/search?q=prabhas%20songs&type=track&limit=10"

# Test 2: Search playlists
curl "http://localhost:3000/api/spotify/search?q=relaxing%20songs&type=playlist&limit=5"

# Test 3: Search with user ID
curl "http://localhost:3000/api/spotify/search?q=hero%20songs&userId=test-user-123&limit=20"
```

### 3. Test Playback

**Endpoint**: `POST /api/spotify/play`

```bash
# First, get a track ID from search results
# Then use it to play

curl -X POST http://localhost:3000/api/spotify/play \
  -H "Content-Type: application/json" \
  -d '{
    "trackId": "3n3Ppam7vgaVa1iaRUc9Lp",
    "userId": "test-user-123"
  }'

# Expected Response:
# {
#   "success": true,
#   "trackId": "3n3Ppam7vgaVa1iaRUc9Lp",
#   "deviceId": "device-id"
# }
```

### 4. Test User Preferences

**Endpoint**: `GET/POST /api/user/preferences`

```bash
# Get preferences
curl "http://localhost:3000/api/user/preferences?userId=test-user-123"

# Create/Update preferences
curl -X POST http://localhost:3000/api/user/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "favouriteHeroes": ["prabhas", "mahesh"],
    "favouriteArtists": ["artist1", "artist2"],
    "moodPreferences": {
      "relaxing": true,
      "energetic": true
    },
    "timePreferences": {
      "night": "relaxing",
      "morning": "energetic"
    }
  }'
```

### 5. Test Automation Rules

**Endpoint**: `GET/POST/PUT/DELETE /api/automation/rules`

```bash
# Get all rules
curl "http://localhost:3000/api/automation/rules?userId=test-user-123"

# Create rule
curl -X POST http://localhost:3000/api/automation/rules \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "triggerType": "night",
    "playlistQuery": "relaxing sleep songs"
  }'

# Update rule
curl -X PUT http://localhost:3000/api/automation/rules \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "rule-id-from-response",
    "isActive": false,
    "playlistQuery": "new query"
  }'

# Delete rule
curl -X DELETE "http://localhost:3000/api/automation/rules?ruleId=rule-id"
```

### 6. Test Automation Trigger

**Endpoint**: `POST /api/automation/trigger`

```bash
# Trigger automation
curl -X POST http://localhost:3000/api/automation/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "triggerType": "night"
  }'

# Expected Response:
# {
#   "triggered": true,
#   "triggerType": "night",
#   "rule": {
#     "id": "rule-id",
#     "playlistQuery": "relaxing sleep songs"
#   },
#   "recommendations": [...]
# }
```

## React Component Testing

### 1. Test MusicAssistant Component

```typescript
// pages/test-music.tsx
import { MusicAssistant } from '@/components/spotify/MusicAssistant';

export default function TestPage() {
  return <MusicAssistant userId="test-user-123" />;
}
```

**Manual Tests**:
1. Type "Play hero songs" and press Enter
2. Verify intent is detected correctly
3. Verify search results appear
4. Click "Play" on a track
5. Verify playback starts

### 2. Test useAIIntent Hook

```typescript
'use client';

import { useAIIntent } from '@/hooks/useAIIntent';
import { useState } from 'react';

export function TestIntentHook() {
  const [input, setInput] = useState('');
  const { intent, loading, error, detectIntent } = useAIIntent();

  const handleTest = async () => {
    await detectIntent(input, 'test-user-123');
  };

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text"
      />
      <button onClick={handleTest} disabled={loading}>
        {loading ? 'Loading...' : 'Detect'}
      </button>
      {error && <p>Error: {error}</p>}
      {intent && <pre>{JSON.stringify(intent, null, 2)}</pre>}
    </div>
  );
}
```

### 3. Test useSpotifyPlayer Hook

```typescript
'use client';

import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { useState } from 'react';

export function TestPlayerHook() {
  const [query, setQuery] = useState('');
  const { searchResults, loading, error, searchTracks, playTrack } = useSpotifyPlayer();

  const handleSearch = async () => {
    await searchTracks(query, 'test-user-123');
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search query"
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {error && <p>Error: {error}</p>}
      {searchResults.map((track) => (
        <div key={track.id}>
          <p>{track.name} - {track.artist}</p>
          <button onClick={() => playTrack(track.id, 'test-user-123')}>
            Play
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Database Testing

### 1. Verify Schema

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check user_preferences
SELECT * FROM user_preferences LIMIT 1;

-- Check recent_listening
SELECT * FROM recent_listening LIMIT 1;

-- Check automation_rules
SELECT * FROM automation_rules LIMIT 1;

-- Check spotify_tokens
SELECT * FROM spotify_tokens LIMIT 1;
```

### 2. Test RLS Policies

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('user_preferences', 'recent_listening', 'automation_rules', 'spotify_tokens');
```

## Error Scenarios Testing

### 1. Invalid User ID
```bash
curl -X POST http://localhost:3000/api/ai/intent \
  -H "Content-Type: application/json" \
  -d '{"text": "Play songs"}'
# Expected: 400 Bad Request
```

### 2. Missing Query Parameter
```bash
curl "http://localhost:3000/api/spotify/search"
# Expected: 400 Bad Request
```

### 3. Invalid Trigger Type
```bash
curl -X POST http://localhost:3000/api/automation/rules \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "triggerType": "invalid",
    "playlistQuery": "songs"
  }'
# Expected: 400 Bad Request
```

## Performance Testing

### 1. Load Testing
```bash
# Using Apache Bench
ab -n 100 -c 10 "http://localhost:3000/api/spotify/search?q=songs"
```

### 2. Response Time Testing
```bash
# Using curl with timing
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/spotify/search?q=songs"
```

## Integration Testing Checklist

- [ ] Intent detection works for all mood types
- [ ] Intent detection works for all languages
- [ ] Intent detection works for all time contexts
- [ ] Spotify search returns valid results
- [ ] Playback control works with valid device
- [ ] User preferences are saved correctly
- [ ] Automation rules are created and triggered
- [ ] Error handling works for invalid inputs
- [ ] Database RLS policies work correctly
- [ ] Token refresh works automatically
- [ ] Components render without errors
- [ ] Hooks return correct data
- [ ] API endpoints return correct status codes

## Debugging Tips

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Network Tab**: Verify API requests and responses
3. **Check Server Logs**: Look for backend errors
4. **Check Supabase Logs**: Verify database operations
5. **Use React DevTools**: Inspect component state and props
6. **Use Postman**: Test API endpoints in isolation

## Common Issues & Solutions

### Issue: "Failed to get Spotify access token"
**Solution**: Verify SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are correct

### Issue: "User preferences not found"
**Solution**: Create preferences first using POST /api/user/preferences

### Issue: "No matching automation rules"
**Solution**: Create automation rules first using POST /api/automation/rules

### Issue: "Failed to play track"
**Solution**: Ensure user has active Spotify device connected

## Test Data

### Sample User ID
```
test-user-123
```

### Sample Track IDs
```
3n3Ppam7vgaVa1iaRUc9Lp (Blinding Lights - The Weeknd)
11dFghVXANMlKmJXsNCQvb (Levitating - Dua Lipa)
```

### Sample Queries
```
prabhas songs
relaxing sleep songs
energetic workout music
sad emotional songs
telugu hero songs
```

## Continuous Testing

1. Run tests after each code change
2. Test all API endpoints
3. Test all React hooks
4. Test error scenarios
5. Test database operations
6. Monitor performance metrics

