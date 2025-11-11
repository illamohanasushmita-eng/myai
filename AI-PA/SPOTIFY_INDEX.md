# Spotify AI Music Assistant - Complete Index

## 📚 Documentation Files

### Getting Started
1. **[SPOTIFY_QUICK_REFERENCE.md](./SPOTIFY_QUICK_REFERENCE.md)** - Start here! Quick setup and API reference
2. **[SPOTIFY_INTEGRATION_GUIDE.md](./SPOTIFY_INTEGRATION_GUIDE.md)** - Complete integration guide with examples
3. **[SPOTIFY_TESTING_GUIDE.md](./SPOTIFY_TESTING_GUIDE.md)** - Testing procedures and debugging tips
4. **[SPOTIFY_FILES_SUMMARY.md](./SPOTIFY_FILES_SUMMARY.md)** - Complete file listing and statistics

## 🗂️ Source Code Structure

### Database
```
src/lib/db/
└── schema.sql                 # Supabase schema with 4 tables + RLS
```

### Spotify Services
```
src/lib/spotify/
├── auth.ts                    # OAuth token management
├── search.ts                  # Track/playlist search
├── play.ts                    # Playback control
└── utils.ts                   # Helper functions
```

### AI & Intent Detection
```
src/lib/ai/
└── intent-detector.ts         # Natural language processing
```

### Types
```
src/lib/types/
└── spotify.ts                 # TypeScript interfaces
```

### API Routes
```
src/app/api/
├── ai/intent/route.ts         # Intent detection endpoint
├── spotify/
│   ├── search/route.ts        # Track search endpoint
│   └── play/route.ts          # Playback endpoint
├── automation/
│   ├── trigger/route.ts       # Automation trigger endpoint
│   └── rules/route.ts         # Automation rules CRUD
└── user/preferences/route.ts  # User preferences endpoint
```

### React Hooks
```
src/hooks/
├── useAIIntent.ts             # Intent detection hook
├── useSpotifyPlayer.ts        # Search & playback hook
├── useMusicAutomation.ts      # Automation management hook
└── useUserPreferences.ts      # Preferences management hook
```

### Components
```
src/components/spotify/
├── MusicAssistant.tsx         # Main component
└── MusicAssistantExample.tsx  # Complete example
```

### Configuration
```
.env.spotify.example           # Environment variables template
```

## 🚀 Quick Start (5 Minutes)

### Step 1: Setup Environment
```bash
cp .env.spotify.example .env.local
# Edit .env.local with your credentials
```

### Step 2: Initialize Database
```sql
-- Copy content from src/lib/db/schema.sql
-- Paste into Supabase SQL Editor
-- Execute
```

### Step 3: Use Component
```typescript
import { MusicAssistant } from '@/components/spotify/MusicAssistant';

export default function Page() {
  return <MusicAssistant userId="user-id" />;
}
```

### Step 4: Test
- Type "Play hero songs"
- Verify results appear
- Click Play

## 📖 API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/ai/intent` | POST | Detect intent | User ID |
| `/api/spotify/search` | GET | Search tracks | Optional |
| `/api/spotify/play` | POST | Play track | User ID |
| `/api/automation/trigger` | POST | Trigger automation | User ID |
| `/api/automation/rules` | GET/POST/PUT/DELETE | Manage rules | User ID |
| `/api/user/preferences` | GET/POST | Manage preferences | User ID |

## 🎯 Features

### Intent Detection
- ✅ Mood detection (relaxing, energetic, sad, happy, focus)
- ✅ Hero detection (Telugu, Hindi, Tamil actors)
- ✅ Time context (night, morning, travel)
- ✅ Language detection (English, Telugu, Hindi, Tamil)
- ✅ Confidence scoring

### Spotify Integration
- ✅ OAuth token management
- ✅ Track search
- ✅ Playlist search
- ✅ Playback control
- ✅ Device management
- ✅ Automatic token refresh

### Automation
- ✅ Time-based triggers (night, morning)
- ✅ Travel mode
- ✅ Mood-based automation
- ✅ User-defined rules
- ✅ Rule management (CRUD)

### User Management
- ✅ Favourite heroes
- ✅ Favourite artists
- ✅ Mood preferences
- ✅ Time preferences
- ✅ Listening history

## 🔧 React Hooks API

### useAIIntent()
```typescript
const { intent, loading, error, detectIntent, reset } = useAIIntent();
await detectIntent(text, userId);
```

### useSpotifyPlayer()
```typescript
const { searchResults, loading, error, isPlaying, searchTracks, playTrack, playPlaylist } = useSpotifyPlayer();
await searchTracks(query, userId);
await playTrack(trackId, userId);
```

### useMusicAutomation()
```typescript
const { rules, loading, error, lastTrigger, fetchRules, createRule, updateRule, deleteRule, triggerAutomation } = useMusicAutomation();
await fetchRules(userId);
await createRule(userId, triggerType, query);
```

### useUserPreferences()
```typescript
const { preferences, loading, error, fetchPreferences, updatePreferences, addFavouriteHero, removeFavouriteHero } = useUserPreferences();
await fetchPreferences(userId);
await addFavouriteHero(userId, hero);
```

## 📊 Database Schema

### Tables
1. **user_preferences** - User's favourite heroes, artists, and preferences
2. **recent_listening** - Listening history with intent context
3. **automation_rules** - User-defined automation triggers
4. **spotify_tokens** - OAuth tokens with expiration

### Features
- ✅ Row-level security (RLS)
- ✅ User data isolation
- ✅ Automatic timestamps
- ✅ Soft deletes support

## 🎨 UI Components

### MusicAssistant
- Search input with intent detection
- Search results display
- Track playback controls
- Automation triggers
- Preferences management

### MusicAssistantExample
- Complete feature showcase
- All hooks demonstrated
- Error handling
- Loading states

## 🧪 Testing

### Unit Tests
- Intent detection logic
- Spotify API calls
- Hook functionality
- Component rendering

### Integration Tests
- API endpoint testing
- Database operations
- End-to-end flows

### Manual Testing
- See [SPOTIFY_TESTING_GUIDE.md](./SPOTIFY_TESTING_GUIDE.md)

## 🔐 Security

- ✅ RLS policies on all tables
- ✅ User data isolation
- ✅ Secure token storage
- ✅ Input validation
- ✅ Error message sanitization

## 📈 Performance

- ✅ Token caching
- ✅ Search result caching
- ✅ Debounced input
- ✅ Pagination support
- ✅ Lazy loading

## 🐛 Debugging

### Browser DevTools
- Check Network tab for API calls
- Check Console for errors
- Use React DevTools for component state

### Server Logs
- Check Next.js terminal
- Check Supabase logs
- Check API response status

### Common Issues
See [SPOTIFY_TESTING_GUIDE.md](./SPOTIFY_TESTING_GUIDE.md) for troubleshooting

## 📚 Code Examples

### Search and Play
```typescript
const { intent, detectIntent } = useAIIntent();
const { searchTracks, playTrack } = useSpotifyPlayer();

const detected = await detectIntent(userText, userId);
const results = await searchTracks(detected.playlistQuery, userId);
await playTrack(results[0].id, userId);
```

### Create Automation
```typescript
const { createRule } = useMusicAutomation();
await createRule(userId, 'night', 'relaxing sleep songs');
```

### Update Preferences
```typescript
const { updatePreferences } = useUserPreferences();
await updatePreferences(userId, {
  favourite_heroes: ['prabhas', 'mahesh'],
});
```

## 🔄 Workflow

1. User enters natural language command
2. Intent detection classifies the command
3. Spotify search finds matching tracks
4. User selects and plays a track
5. Listening history is recorded
6. Automation rules can be created
7. Future similar commands trigger automation

## 📱 Supported Platforms

- ✅ Web (Next.js)
- ✅ Desktop (Electron)
- ✅ Mobile (React Native - future)

## 🌍 Supported Languages

- ✅ English
- ✅ Telugu
- ✅ Hindi
- ✅ Tamil

## 🎬 Supported Heroes

### Telugu
- Prabhas, Mahesh, Ram, Allu, NTR, Chiranjeevi, Balakrishna

### Hindi
- Shah Rukh Khan, Salman Khan, Aamir Khan, Akshay Kumar, Hrithik Roshan, Ranveer Singh

### Tamil
- Rajinikanth, Kamal Haasan, Vijay, Ajith Kumar, Suriya, Dhanush

## 📞 Support

For issues or questions:
1. Check [SPOTIFY_TESTING_GUIDE.md](./SPOTIFY_TESTING_GUIDE.md)
2. Review [SPOTIFY_INTEGRATION_GUIDE.md](./SPOTIFY_INTEGRATION_GUIDE.md)
3. Check code comments in source files
4. Review TypeScript types for API contracts

## 📝 File Checklist

- [x] Database schema
- [x] Spotify services
- [x] Intent detection
- [x] API routes
- [x] React hooks
- [x] Components
- [x] TypeScript types
- [x] Documentation
- [x] Testing guide
- [x] Quick reference

## 🎉 You're Ready!

All files are created and ready to use. Start with [SPOTIFY_QUICK_REFERENCE.md](./SPOTIFY_QUICK_REFERENCE.md) for a quick overview, then refer to [SPOTIFY_INTEGRATION_GUIDE.md](./SPOTIFY_INTEGRATION_GUIDE.md) for detailed information.

Happy coding! 🎵

