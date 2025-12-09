# 🚀 Quick Start - Voice Assistant

## Installation

No new dependencies needed! All fixes are in existing files.

## Basic Usage

### 1. In Your Component

```typescript
'use client';

import { useLaraAssistant } from '@/hooks/useLaraAssistant';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function VoiceButton() {
  const router = useRouter();
  const {
    isListeningForWakeWord,
    isProcessing,
    error,
    startAssistant,
    stopAssistant,
  } = useLaraAssistant({
    onWakeWordDetected: () => {
      console.log('Wake word detected!');
    },
    onActionExecuted: (result) => {
      if (result.data?.navigationTarget) {
        router.push(result.data.navigationTarget);
      }
    },
    onError: (err) => {
      console.error('Error:', err);
    },
  });

  // Auto-start on mount
  useEffect(() => {
    startAssistant();
  }, [startAssistant]);

  return (
    <div>
      <button onClick={startAssistant}>
        {isListeningForWakeWord ? '🎤 Listening...' : '🎤 Start'}
      </button>
      {isProcessing && <p>Processing...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## Lifecycle

```
1. User says "Hey Lara"
   ↓
2. Wake word detected
   ↓
3. Recording starts (5 seconds)
   ↓
4. Audio converted to text
   ↓
5. Intent classified
   ↓
6. Action executed
   ↓
7. Navigation happens
   ↓
8. Listener restarts
   ↓
9. Back to step 1
```

## Console Output

```
🎤 Starting wake word listener
🎤 Wake word listener started
🎤 Final transcript: hey lara
✅ Wake word detected: hey lara
🎤 Wake word detected! Starting pipeline...
🎤 Step 1: Stopping wake word listener
🎤 Step 2: Recording audio for 5 seconds
✅ Audio recorded
🎤 Step 3: Converting audio to text
✅ Transcribed text: show my tasks
🎤 Step 4: Classifying intent
✅ Intent classified: {intent: "show_tasks"}
🎤 Step 5: Routing action
📋 Showing tasks
✅ Pipeline completed successfully
🎤 Step 6: Restarting wake word listener
🎤 Explicitly restarting wake word listener
🎤 Starting wake word recognition again
🎤 Wake word listener started
```

## API Reference

### useWakeWord Hook

```typescript
const {
  isListeningForWakeWord,      // Is listening for wake word
  wakeWordDetected,             // Was wake word detected
  startWakeWordListener,        // Start listening
  stopWakeWordListener,         // Stop listening
  restartWakeWordListener,      // Restart listening
  isSupported,                  // Browser support
  error,                        // Error message
} = useWakeWord({
  enabled: true,
  onWakeWordDetected: () => {},
  onError: (err) => {},
  language: 'en-US',
});
```

### useLaraAssistant Hook

```typescript
const {
  isProcessing,                 // Processing command
  currentIntent,                // Current intent
  lastActionResult,             // Last action result
  error,                        // Error message
  isListeningForWakeWord,       // Is listening
  startAssistant,               // Start assistant
  stopAssistant,                // Stop assistant
  restartAssistant,             // Restart assistant
} = useLaraAssistant({
  onWakeWordDetected: () => {},
  onIntentClassified: (intent) => {},
  onActionExecuted: (result) => {},
  onError: (err) => {},
  userId: 'user-id',
});
```

## Common Tasks

### Start Listening

```typescript
const { startAssistant } = useLaraAssistant();

useEffect(() => {
  startAssistant();
}, [startAssistant]);
```

### Stop Listening

```typescript
const { stopAssistant } = useLaraAssistant();

const handleStop = () => {
  stopAssistant();
};
```

### Handle Navigation

```typescript
const router = useRouter();

const { lastActionResult } = useLaraAssistant({
  onActionExecuted: (result) => {
    if (result.data?.navigationTarget) {
      router.push(result.data.navigationTarget);
    }
  },
});
```

### Handle Errors

```typescript
const { error } = useLaraAssistant({
  onError: (err) => {
    if (err.includes('permission')) {
      // Request microphone permission
    } else if (err.includes('network')) {
      // Retry after delay
    } else {
      // Show error to user
    }
  },
});
```

## Troubleshooting

### Wake word not detected
- Check microphone is working
- Speak clearly and loudly
- Try different wake word variations

### Actions not executing
- Check console for errors
- Verify intent classification
- Check action router

### Listener stops
- Check for errors in console
- Verify restartWakeWordListener is called
- Check browser console for exceptions

## Testing

```bash
# Start development server
npm run dev

# Open dashboard
# http://localhost:3002

# Say "Hey Lara"
# Say command like "show my tasks"
# Verify navigation to /tasks
# Repeat multiple times
```

## Files Modified

- ✅ `src/hooks/useWakeWord.ts` - Enhanced with callback ref and explicit restart
- ✅ `src/hooks/useLaraAssistant.ts` - Fixed pipeline with explicit restart
- ✅ `src/lib/ai/wakeWordManager.ts` - NEW persistent manager (optional)

## Performance

- ✅ Faster restart: 500ms (listener) + 300ms (pipeline)
- ✅ No duplicate restarts
- ✅ Lower CPU usage
- ✅ Better error recovery

## Next Steps

1. Test the voice assistant
2. Say "Hey Lara" multiple times
3. Verify actions execute
4. Check console for expected logs
5. Deploy to production

## Support

For issues or questions:
1. Check console for error messages
2. Review implementation guide
3. Check troubleshooting section
4. Verify microphone is working

---

**Ready to use!** 🎤✨

