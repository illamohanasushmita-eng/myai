# ⚡ Lara Voice Assistant - Quick Reference Card

**Print this page for quick access!**

---

## 🚀 Quick Start (30 seconds)

```bash
# 1. Start the app
npm run dev

# 2. Open in browser
http://localhost:3002/test-lara

# 3. Click "Start" button

# 4. Say "Hey Lara"

# 5. Wait for "How can I help you?"

# 6. Say a command
```

---

## 🎤 Voice Commands

### Music
- "Play a song"
- "Play [artist/song name]"

### Tasks
- "Show my tasks"
- "Add a task"

### Reminders
- "Show my reminders"
- "Add a reminder"

### Navigation
- "Go to home page"
- "Open professional page"
- "Open personal growth page"

### Generic
- "Tell me something"
- "Search [anything]"

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/lib/voice/lara-assistant.ts` | Main module |
| `src/app/api/ai/parse-intent/route.ts` | Intent API |
| `src/hooks/useLara.ts` | React hook |
| `src/components/LaraAssistant.tsx` | UI component |
| `src/app/test-lara/page.tsx` | Test page |

---

## 🔧 Integration

### Add to Your Page
```typescript
import { LaraAssistant } from '@/components/LaraAssistant';

<LaraAssistant userId={userId} autoStart={true} />
```

### Use Hook
```typescript
import { useLara } from '@/hooks/useLara';

const { isRunning, start, stop } = useLara({ userId });
```

---

## 🐛 Troubleshooting

### Microphone Not Working
- Check browser permissions
- Check microphone is connected
- Verify volume is not muted

### No Sound Output
- Check speaker is connected
- Check volume is not muted
- Verify browser volume

### Intent Not Recognized
- Speak more clearly
- Use exact command phrases
- Check OpenAI API key

### Navigation Not Working
- Check page exists
- Verify route is correct
- Check browser console

---

## 📊 Supported Intents

1. **PLAY_SONG** - Spotify playback
2. **OPEN_TASKS_PAGE** - Tasks page
3. **OPEN_ADD_TASK_PAGE** - Add task
4. **OPEN_REMINDERS_PAGE** - Reminders
5. **OPEN_ADD_REMINDER_PAGE** - Add reminder
6. **OPEN_HOME_PAGE** - Home page
7. **OPEN_PROFESSIONAL_PAGE** - Professional
8. **OPEN_PERSONAL_GROWTH_PAGE** - Growth
9. **GENERAL_QUERY** - OpenAI response

---

## 🔗 Important Links

| Link | Purpose |
|------|---------|
| http://localhost:3002/test-lara | Test page |
| http://localhost:3002/dashboard | Home |
| http://localhost:3002/professional | Tasks |
| http://localhost:3002/reminders | Reminders |

---

## 📚 Documentation

| Document | Time |
|----------|------|
| 🎉_LARA_READY_TO_USE.md | 5 min |
| 🎤_LARA_QUICK_START.md | 2 min |
| 🎤_LARA_VOICE_ASSISTANT_COMPLETE.md | 30 min |
| 🧪_LARA_TESTING_GUIDE.md | 1 hour |
| 🔧_LARA_TROUBLESHOOTING.md | 30 min |
| 🚀_LARA_DEPLOYMENT_GUIDE.md | 1 hour |

---

## ✅ Verification Checklist

- [ ] Microphone is working
- [ ] Speaker is working
- [ ] Internet connection is stable
- [ ] Environment variables are set
- [ ] Browser is up to date
- [ ] Cache is cleared
- [ ] API keys are valid

---

## 🎯 Common Commands

```
"Hey Lara"
"Play a song"
"Show my tasks"
"Add a reminder"
"Go to home page"
"Tell me a joke"
```

---

## 🔐 Environment Variables

```bash
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy --prod
```

### Netlify
```bash
netlify deploy --prod
```

### Docker
```bash
docker build -t lara .
docker run -p 3002:3002 lara
```

---

## 📞 Debug Commands

### Browser Console
```javascript
// Test microphone
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('Microphone works!'))
  .catch(err => console.error('Error:', err));

// Test text-to-speech
const utterance = new SpeechSynthesisUtterance('Hello');
window.speechSynthesis.speak(utterance);
```

### Terminal
```bash
# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Format
npm run format
```

---

## 🎯 Flow Diagram

```
User says "Hey Lara"
        ↓
App speaks "How can I help you?"
        ↓
App listens for command
        ↓
App sends to OpenAI
        ↓
OpenAI returns intent
        ↓
App executes action
        ↓
App speaks confirmation
        ↓
Loop back to listening
```

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Wake word detection | < 1 sec |
| Command recording | 2-5 sec |
| Intent parsing | 1-2 sec |
| Action execution | < 1 sec |
| Voice response | 1-3 sec |
| Total cycle | 5-12 sec |

---

## 🎓 Learning Path

1. **Beginner**: Read 🎉_LARA_READY_TO_USE.md
2. **Intermediate**: Read 🎤_LARA_QUICK_START.md
3. **Advanced**: Read 🎤_LARA_VOICE_ASSISTANT_COMPLETE.md

---

## 🆘 Need Help?

1. Check browser console (F12)
2. Read troubleshooting guide
3. Check documentation index
4. Review test scenarios

---

## ✨ Features

✅ Wake word detection
✅ Voice command recognition
✅ Intent parsing with AI
✅ Action execution
✅ Voice confirmation
✅ Continuous listening
✅ Error handling
✅ Beautiful UI

---

## 🎉 Status

✅ Implementation: COMPLETE
✅ Documentation: COMPLETE
✅ Testing: COMPLETE
✅ Build: SUCCESSFUL
✅ Production: READY

---

**Ready to use Lara! 🎤✨**

**Start now**: `npm run dev` → `/test-lara` → Say "Hey Lara"

