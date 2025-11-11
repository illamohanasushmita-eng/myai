# 🎵 Spotify AI Music Assistant

Production-ready AI-driven Spotify automation feature for your Next.js application.

## ⚡ Quick Start (5 Minutes)

### 1. Setup Environment
```bash
cp .env.spotify.example .env.local
# Edit with your credentials
```

### 2. Initialize Database
```sql
-- Copy from src/lib/db/schema.sql
-- Paste into Supabase SQL Editor
-- Execute
```

### 3. Use Component
```typescript
import { MusicAssistant } from '@/components/spotify/MusicAssistant';

export default function Page() {
  return <MusicAssistant userId="user-id" />;
}
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SPOTIFY_INDEX.md](./SPOTIFY_INDEX.md) | **START HERE** - Complete navigation |
| [SPOTIFY_QUICK_REFERENCE.md](./SPOTIFY_QUICK_REFERENCE.md) | Quick setup and API reference |
| [SPOTIFY_INTEGRATION_GUIDE.md](./SPOTIFY_INTEGRATION_GUIDE.md) | Detailed integration guide |
| [SPOTIFY_TESTING_GUIDE.md](./SPOTIFY_TESTING_GUIDE.md) | Testing procedures |
| [SPOTIFY_DEPLOYMENT_CHECKLIST.md](./SPOTIFY_DEPLOYMENT_CHECKLIST.md) | Deployment checklist |
| [SPOTIFY_FILES_SUMMARY.md](./SPOTIFY_FILES_SUMMARY.md) | File reference |
| [SPOTIFY_IMPLEMENTATION_COMPLETE.md](./SPOTIFY_IMPLEMENTATION_COMPLETE.md) | Implementation summary |

## 🎯 Features

### Intent Detection
- Natural language processing
- Mood detection (relaxing, energetic, sad, happy, focus)
- Hero detection (Telugu, Hindi, Tamil actors)
- Time context (night, morning, travel)
- Language detection (English, Telugu, Hindi, Tamil)

### Spotify Integration
- OAuth token management
- Track search
- Playlist search
- Playback control
- Device management

### Automation
- Time-based triggers
- Travel mode
- Mood-based automation
- User-defined rules

### User Management
- Favourite heroes and artists
- Mood preferences
- Listening history
- Preference persistence

## 🔧 API Endpoints

```
POST   /api/ai/intent              # Detect intent
GET    /api/spotify/search         # Search tracks
POST   /api/spotify/play           # Play track
POST   /api/automation/trigger     # Trigger automation
GET    /api/automation/rules       # Get rules
POST   /api/automation/rules       # Create rule
PUT    /api/automation/rules       # Update rule
DELETE /api/automation/rules       # Delete rule
GET    /api/user/preferences       # Get preferences
POST   /api/user/preferences       # Update preferences
```

## 🎣 React Hooks

```typescript
// Intent detection
const { intent, detectIntent } = useAIIntent();

// Search and playback
const { searchResults, searchTracks, playTrack } = useSpotifyPlayer();

// Automation management
const { rules, createRule, triggerAutomation } = useMusicAutomation();

// User preferences
const { preferences, addFavouriteHero } = useUserPreferences();
```

## 📊 Database

4 tables with RLS policies:
- `user_preferences` - User preferences
- `recent_listening` - Listening history
- `automation_rules` - Automation triggers
- `spotify_tokens` - OAuth tokens

## 🚀 Example Usage

```typescript
'use client';

import { MusicAssistant } from '@/components/spotify/MusicAssistant';

export default function Page() {
  return <MusicAssistant userId="user-123" />;
}
```

## 🎨 Components

### MusicAssistant
Main component with all features:
- Search input
- Intent detection
- Track results
- Playback controls
- Automation triggers
- Preferences management

### MusicAssistantExample
Complete example showing all features.

## 🧪 Testing

See [SPOTIFY_TESTING_GUIDE.md](./SPOTIFY_TESTING_GUIDE.md) for:
- API endpoint testing
- Component testing
- Hook testing
- Error scenario testing
- Performance testing

## 🔐 Security

- ✅ Row-level security (RLS)
- ✅ User data isolation
- ✅ Secure token storage
- ✅ Input validation
- ✅ Error sanitization

## 📈 Performance

- ✅ Token caching
- ✅ Search result caching
- ✅ Debounced input
- ✅ Pagination support
- ✅ Lazy loading

## 🌍 Supported

### Languages
- English, Telugu, Hindi, Tamil

### Moods
- Relaxing, Energetic, Sad, Happy, Focus

### Time Contexts
- Night, Morning, Travel

### Heroes
- Telugu: Prabhas, Mahesh, Ram, Allu, NTR, Chiranjeevi, Balakrishna
- Hindi: Shah Rukh Khan, Salman Khan, Aamir Khan, Akshay Kumar, Hrithik Roshan, Ranveer Singh
- Tamil: Rajinikanth, Kamal Haasan, Vijay, Ajith Kumar, Suriya, Dhanush

## 📁 File Structure

```
src/
├── lib/
│   ├── spotify/
│   │   ├── auth.ts
│   │   ├── search.ts
│   │   ├── play.ts
│   │   └── utils.ts
│   ├── ai/
│   │   └── intent-detector.ts
│   ├── types/
│   │   └── spotify.ts
│   └── db/
│       └── schema.sql
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
    ├── MusicAssistant.tsx
    └── MusicAssistantExample.tsx
```

## 🚀 Deployment

See [SPOTIFY_DEPLOYMENT_CHECKLIST.md](./SPOTIFY_DEPLOYMENT_CHECKLIST.md) for:
- Pre-deployment checklist
- Testing procedures
- Staging deployment
- Production deployment
- Monitoring setup
- Rollback procedure

## 🐛 Troubleshooting

See [SPOTIFY_TESTING_GUIDE.md](./SPOTIFY_TESTING_GUIDE.md) for:
- Common issues
- Solutions
- Debugging tips
- Error scenarios

## 📞 Support

1. Check [SPOTIFY_INDEX.md](./SPOTIFY_INDEX.md) for navigation
2. Review [SPOTIFY_INTEGRATION_GUIDE.md](./SPOTIFY_INTEGRATION_GUIDE.md)
3. Check code comments
4. Review TypeScript types

## ✨ Highlights

- ✅ Production-ready code
- ✅ Full TypeScript coverage
- ✅ Comprehensive documentation
- ✅ Testing guide included
- ✅ Security best practices
- ✅ Performance optimized
- ✅ Modular architecture
- ✅ No breaking changes

## 📊 Statistics

- **Total Files**: 27
- **Lines of Code**: ~2000
- **API Endpoints**: 6
- **React Hooks**: 4
- **Components**: 2
- **Database Tables**: 4
- **Documentation Files**: 7

## 🎓 Tech Stack

- Next.js 15.5.6 (App Router)
- React 18.3.1
- TypeScript
- Supabase (PostgreSQL)
- Spotify Web API v1
- Tailwind CSS

## 📝 License

Part of AI-PA application.

## 🎉 Ready to Use!

All code is production-ready. Start with [SPOTIFY_INDEX.md](./SPOTIFY_INDEX.md) for complete navigation.

---

**Version**: 1.0
**Status**: ✅ Production Ready
**Last Updated**: 2025-11-07

