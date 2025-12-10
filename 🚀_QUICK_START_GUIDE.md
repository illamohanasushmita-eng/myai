# 🚀 QUICK START GUIDE - VOICE AUTOMATION PIPELINE

**Status**: ✅ READY TO USE  
**Date**: 2025-11-08

---

## ⚡ 5-MINUTE SETUP

### Step 1: Start Application

```bash
npm run dev
```

### Step 2: Open Browser

```
http://localhost:3002
```

### Step 3: Open DevTools

```
Press: F12
Tab: Console
```

### Step 4: Grant Microphone Permission

```
Browser will ask for microphone access
Click: Allow
```

### Step 5: Test Voice Command

```
Say: "Hey Lara"
Then say: "play music" or "add task"
```

---

## 🎤 VOICE COMMANDS

### Music Commands

```
"Hey Lara, play my favorite music"
"Hey Lara, play rock music"
"Hey Lara, play jazz"
```

### Task Commands

```
"Hey Lara, add task buy groceries"
"Hey Lara, show my tasks"
"Hey Lara, add task call mom"
```

### Reminder Commands

```
"Hey Lara, add reminder call mom at 3pm"
"Hey Lara, show my reminders"
"Hey Lara, remind me to buy milk"
```

### Navigation Commands

```
"Hey Lara, show tasks"
"Hey Lara, show reminders"
"Hey Lara, navigate to tasks"
```

---

## 📊 EXPECTED BEHAVIOR

### When You Say "Hey Lara"

1. Button turns blue and pulses
2. Console shows: "🎤 Wake word detected!"
3. System starts recording
4. Console shows: "✅ Audio recorded"

### When You Say a Command

1. Console shows: "✅ Transcribed text: [your command]"
2. Console shows: "✅ Intent classified: [intent type]"
3. Console shows: "🎤 Step 5: Routing action"
4. Action executes (music plays, task added, page navigates)
5. Console shows: "✅ Pipeline completed successfully"
6. System restarts listening

---

## 🎯 INTEGRATION IN YOUR APP

### Option 1: Use LaraAssistantButton Component

```typescript
import { LaraAssistantButton } from '@/components/voice/LaraAssistantButton';

export default function Dashboard() {
  return (
    <div>
      <LaraAssistantButton userId="user123" />
    </div>
  );
}
```

### Option 2: Use useLaraAssistant Hook

```typescript
import { useLaraAssistant } from '@/hooks/useLaraAssistant';

export default function MyComponent() {
  const {
    isProcessing,
    currentIntent,
    lastActionResult,
    error,
    isListeningForWakeWord,
    startAssistant,
    stopAssistant,
  } = useLaraAssistant({
    userId: 'user123',
    onWakeWordDetected: () => console.log('Wake word!'),
    onIntentClassified: (intent) => console.log('Intent:', intent),
    onActionExecuted: (result) => console.log('Action:', result),
    onError: (error) => console.log('Error:', error),
  });

  return (
    <button onClick={startAssistant}>
      {isListeningForWakeWord ? 'Listening...' : 'Start'}
    </button>
  );
}
```

---

## 🔍 CONSOLE LOGS TO LOOK FOR

### Success Logs

```
✅ Wake word detected: hey lara
✅ Audio recorded
✅ Transcribed text: play my favorite music
✅ Intent classified: {intent: "play_music", ...}
✅ Now playing [Song Name]
✅ Pipeline completed successfully
```

### Error Logs

```
❌ Error classifying intent: [error]
❌ Error routing action: [error]
❌ Failed to transcribe audio: [error]
```

---

## 🐛 TROUBLESHOOTING

### Wake word not detected

- Check microphone is connected
- Check microphone permissions
- Speak clearly and louder
- Refresh page (Ctrl+R)

### Command not recognized

- Speak slowly and clearly
- Check console for transcribed text
- Verify intent classification in console
- Check Gemini API is working

### Action not executed

- Check console for action routing logs
- Verify API endpoints exist
- Check network tab for API calls
- Check for JavaScript errors

### Navigation not working

- Verify component is CLIENT component
- Check router.push() is called
- Verify navigation target is correct
- Check for routing errors in console

---

## 📁 KEY FILES

| File                                           | Purpose                   |
| ---------------------------------------------- | ------------------------- |
| `src/lib/ai/intent-classifier.ts`              | Classify intent from text |
| `src/lib/ai/action-router.ts`                  | Route and execute actions |
| `src/hooks/useLaraAssistant.ts`                | Complete pipeline hook    |
| `src/app/api/ai/stt/route.ts`                  | Speech-to-text API        |
| `src/components/voice/LaraAssistantButton.tsx` | UI component              |

---

## 🎯 SUPPORTED INTENTS

| Intent         | Command Example  | Action                 |
| -------------- | ---------------- | ---------------------- |
| play_music     | "play music"     | Play on Spotify        |
| add_task       | "add task"       | Add to tasks           |
| show_tasks     | "show tasks"     | Navigate to /tasks     |
| add_reminder   | "add reminder"   | Add reminder           |
| show_reminders | "show reminders" | Navigate to /reminders |
| navigate       | "navigate to"    | Navigate to target     |
| general_query  | "what is"        | Process query          |

---

## 🎤 SUPPORTED WAKE WORDS

1. hey lara
2. hey laura
3. hey lora
4. hey larra
5. hey laira
6. hey lera

---

## 📊 PIPELINE STEPS

```
1. Wake word detected
2. Stop wake word listener
3. Record audio (5 seconds)
4. Convert to text (Gemini STT)
5. Classify intent (Gemini)
6. Route action
7. Execute action
8. Restart wake word listener
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Application running on port 3002
- [ ] DevTools open (F12)
- [ ] Microphone connected
- [ ] Microphone permissions granted
- [ ] Say "Hey Lara" - wake word detected
- [ ] Say command - action executed
- [ ] Check console for logs
- [ ] No errors in console

---

## 🚀 NEXT STEPS

1. **Test basic command**: Say "Hey Lara, show tasks"
2. **Test music command**: Say "Hey Lara, play music"
3. **Test task command**: Say "Hey Lara, add task"
4. **Test reminder command**: Say "Hey Lara, add reminder"
5. **Test sequential commands**: Say multiple commands
6. **Check console**: Verify all logs

---

## 📞 SUPPORT

If you encounter issues:

1. Check console logs (F12)
2. Verify microphone permissions
3. Check network tab for API calls
4. Refresh page (Ctrl+R)
5. Check browser compatibility

---

**Your voice automation pipeline is ready!** 🎤✨
