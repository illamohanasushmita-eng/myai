# 🚀 Voice Automation Quick Start

**Time**: 5 minutes  
**Status**: ✅ Ready to Use

---

## 📦 What's Included

✅ Complete voice automation workflow  
✅ Wake word detection ("Hey Lara")  
✅ Intent classification (Gemini AI)  
✅ Spotify music automation  
✅ Task management automation  
✅ Reminder automation  
✅ Navigation automation  
✅ Voice response (TTS)  
✅ React hook for easy integration

---

## 🎯 Quick Integration

### Step 1: Import the Hook

```typescript
import { useVoiceAutomation } from "@/hooks/useVoiceAutomation";
```

### Step 2: Use in Component

```typescript
export function DashboardPage() {
  const {
    isListening,
    isProcessing,
    transcript,
    lastResult,
    startListening,
    stopListening,
  } = useVoiceAutomation({
    userId: 'user-123',
    onSuccess: (result) => {
      console.log('✅ Command executed:', result.response);
    },
    onError: (error) => {
      console.error('❌ Error:', error.message);
    },
  });

  return (
    <div>
      <button onClick={startListening}>
        {isListening ? 'Listening...' : 'Start Voice Command'}
      </button>
      <button onClick={stopListening}>Stop</button>
      {transcript && <p>You said: {transcript}</p>}
      {lastResult && <p>Response: {lastResult.response}</p>}
    </div>
  );
}
```

---

## 🎤 Voice Commands

### Music Commands

```
"Hey Lara, play a song"
"Hey Lara, play romantic Telugu songs"
"Hey Lara, play my favorite hero songs"
```

### Task Commands

```
"Hey Lara, add a task"
"Hey Lara, add buy groceries to my task list"
"Hey Lara, show my tasks"
```

### Reminder Commands

```
"Hey Lara, add reminder at 5 PM"
"Hey Lara, remind me to call mom"
"Hey Lara, show my reminders"
```

### Navigation Commands

```
"Hey Lara, go to tasks page"
"Hey Lara, open reminders section"
"Hey Lara, go to health"
"Hey Lara, show my work"
```

---

## 📁 File Structure

```
src/
├── lib/voice/
│   ├── voice-automation.ts          # Main workflow
│   ├── spotify-automation.ts        # Music automation
│   ├── task-automation.ts           # Task automation
│   ├── reminder-automation.ts       # Reminder automation
│   └── navigation-automation.ts     # Navigation automation
├── hooks/
│   └── useVoiceAutomation.ts        # React hook
└── app/api/ai/voice-automation/
    └── classify/route.ts            # Intent classification API
```

---

## 🔄 Workflow

```
1. User says "Hey Lara"
   ↓
2. System detects wake word
   ↓
3. Speaks "Yes, how can I help?"
   ↓
4. User says command
   ↓
5. System classifies intent (Gemini AI)
   ↓
6. System executes action
   ↓
7. System speaks response
   ↓
✅ Done
```

---

## 🎯 Intent Classification

The system automatically classifies commands into:

- `play_music` - Music playback
- `add_task` - Create task
- `show_tasks` - View tasks
- `add_reminder` - Create reminder
- `show_reminders` - View reminders
- `navigate` - Go to section
- `general_query` - General questions

---

## 🔧 Configuration

### Enable/Disable Voice Automation

```typescript
const { ... } = useVoiceAutomation({
  userId: 'user-123',
  enabled: true,  // Enable/disable
  language: 'en-US',  // Language
});
```

### Custom Language

```typescript
const { ... } = useVoiceAutomation({
  userId: 'user-123',
  language: 'es-ES',  // Spanish
});
```

---

## 🚀 Advanced Usage

### Direct Function Calls

```typescript
import { voiceAutomation } from "@/lib/voice/voice-automation";

const result = await voiceAutomation("Hey Lara, play a song", userId, context);
```

### Spotify Automation

```typescript
import { automateSpotifyPlayback } from "@/lib/voice/spotify-automation";

await automateSpotifyPlayback("romantic songs", userId);
```

### Task Automation

```typescript
import { addTaskVoice } from "@/lib/voice/task-automation";

await addTaskVoice("Buy groceries", userId);
```

### Reminder Automation

```typescript
import { addReminderVoice } from "@/lib/voice/reminder-automation";

await addReminderVoice("Call mom", userId, "17:00");
```

### Navigation Automation

```typescript
import { navigateVoice } from "@/lib/voice/navigation-automation";

await navigateVoice("tasks", router);
```

---

## 🧪 Testing

### Test Wake Word Detection

```typescript
import { detectWakeWord } from "@/lib/voice/voice-automation";

const detected = detectWakeWord("Hey Lara, play a song");
console.log(detected); // true
```

### Test Intent Classification

```typescript
import { classifyIntent } from "@/lib/voice/voice-automation";

const intent = await classifyIntent("play romantic songs");
console.log(intent); // { intent: 'play_music', musicQuery: 'romantic songs', ... }
```

### Test Voice Response

```typescript
import { speakResponse } from "@/lib/voice/voice-automation";

await speakResponse("Playing your song now");
```

---

## 🐛 Troubleshooting

### Issue: Voice not recognized

- Check microphone permissions
- Verify browser supports Web Speech API
- Check console for errors

### Issue: Commands not executing

- Verify userId is correct
- Check API endpoints are working
- Review console for error messages

### Issue: Spotify not playing

- Verify Spotify credentials in .env
- Check user has Spotify account
- Review API response in network tab

---

## 📊 Status

✅ Implementation: COMPLETE  
✅ Testing: READY  
✅ Documentation: COMPLETE  
✅ Deployment: READY

---

## 🎉 You're Ready!

Your voice automation workflow is ready to use. Start integrating it into your components!

**Next Steps**:

1. Import `useVoiceAutomation` hook
2. Add to your component
3. Test voice commands
4. Deploy to production

---

**Status**: ✅ READY FOR PRODUCTION
