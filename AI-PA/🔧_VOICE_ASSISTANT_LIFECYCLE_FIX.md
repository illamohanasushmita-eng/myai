# 🔧 Voice Assistant Lifecycle Fix

## Problem Summary

The voice assistant had critical lifecycle issues:

1. **Wake word listener stops after one cycle** - Never re-activates
2. **Repeating "Wake word recognition ended"** - Listener ends prematurely
3. **Actions never trigger** - Pipeline callback not executing
4. **No re-activation** - Restart logic has timing/race condition issues

## Root Causes Identified

### Issue A: Callback Stale Closure
- `onWakeWordDetected` callback was defined before `useWakeWord` hook
- Callback captured stale references to `stopWakeWordListener` and `startWakeWordListener`
- **Fix**: Use `callbackRef` to store and update callback dynamically

### Issue B: Premature Listener Ending
- `onend` handler was restarting too aggressively
- Multiple restart attempts caused race conditions
- **Fix**: Use `pendingRestartRef` to prevent duplicate restarts

### Issue C: Timing Issues
- Restart timeout was 1000ms, causing delays
- No explicit restart function for pipeline completion
- **Fix**: Reduce timeout to 500ms, add explicit `restartWakeWordListener()` function

### Issue D: No Persistent State
- Listener state was tied to component lifecycle
- Hot reload would break the listener
- **Fix**: Add `wakeWordManager.ts` for persistent, component-independent listening

## Fixes Implemented

### 1. useWakeWord.ts - Enhanced Hook

**Key Changes:**
- Added `callbackRef` to store callback dynamically
- Added `pendingRestartRef` to prevent duplicate restarts
- Added `restartWakeWordListener()` function for explicit restarts
- Updated `onresult` to call callback via ref
- Refactored `onend` to use pending flag and shorter timeout (500ms)

**New Return Value:**
```typescript
{
  isListeningForWakeWord,
  wakeWordDetected,
  startWakeWordListener,
  stopWakeWordListener,
  restartWakeWordListener,  // NEW
  isSupported,
  error,
}
```

### 2. useLaraAssistant.ts - Fixed Pipeline

**Key Changes:**
- Import `restartWakeWordListener` from `useWakeWord`
- Use explicit `restartWakeWordListener()` in finally block
- Reduced restart delay from 1000ms to 300ms
- Added logging for pipeline callback trigger

**Pipeline Flow:**
```
Wake Word Detected
  ↓
Stop Listener
  ↓
Record Audio (5s)
  ↓
STT Conversion
  ↓
Intent Classification
  ↓
Action Routing
  ↓
Restart Listener (300ms delay)
  ↓
Back to Wake Mode
```

### 3. wakeWordManager.ts - NEW Persistent Manager

**Purpose:** Provide component-independent persistent listening

**Features:**
- Singleton pattern for single instance
- Automatic restart on listener end
- Processing state to prevent restart during action execution
- Error recovery with error count tracking
- Explicit `start()`, `stop()`, `restart()`, `disable()`, `enable()` methods

**Usage:**
```typescript
import { getWakeWordManager } from '@/lib/ai/wakeWordManager';

const manager = getWakeWordManager({
  onWakeWordDetected: () => { /* ... */ },
  onError: (err) => { /* ... */ },
});

manager.start();
manager.restart();  // After processing
manager.destroy();  // On cleanup
```

## Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    WAKE MODE                            │
│  Listener running continuously, waiting for wake word   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Wake word detected
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  LISTENING MODE                         │
│  Stop listener, record audio for 5 seconds              │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Recording complete
                     ↓
┌─────────────────────────────────────────────────────────┐
│                 PROCESSING MODE                         │
│  STT → Classify Intent → Route Action → Execute         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Action complete
                     ↓
┌─────────────────────────────────────────────────────────┐
│              RESTART LISTENER (300ms)                   │
│  Explicit restart via restartWakeWordListener()         │
└────────────────────┬────────────────────────────────────┘
                     │
                     └──→ Back to WAKE MODE
```

## Console Output - Expected Behavior

```
🎤 Starting wake word listener
🎤 Wake word listener started
🎤 Final transcript: hey lara
✅ Wake word detected: hey lara
🎤 Calling onWakeWordDetected callback
🎤 Pipeline callback triggered from wake word listener
🎤 Wake word detected! Starting pipeline...
🎤 Step 1: Stopping wake word listener
🎤 Step 2: Recording audio for 5 seconds
✅ Audio recorded
🎤 Step 3: Converting audio to text
✅ Transcribed text: show my tasks
🎤 Step 4: Classifying intent
✅ Intent classified: {intent: "show_tasks", ...}
🎤 Step 5: Routing action
📋 Showing tasks
✅ Pipeline completed successfully
🎤 Step 6: Restarting wake word listener
🎤 Calling restartWakeWordListener
🎤 Explicitly restarting wake word listener
🎤 Starting wake word recognition again
🎤 Wake word listener started
🎤 Final transcript: hey lara
✅ Wake word detected: hey lara
... (cycle repeats)
```

## Testing Checklist

- [ ] Open dashboard
- [ ] Say "Hey Lara" - should detect and start pipeline
- [ ] Say command "show my tasks" - should navigate to /tasks
- [ ] Say "Hey Lara" again - should detect (not stuck)
- [ ] Say "show reminders" - should navigate to /reminders
- [ ] Say "Hey Lara" multiple times - should work every time
- [ ] Check console for repeating "Wake word recognition ended" - should NOT appear
- [ ] Check console for "Restarting wake word listener" - should appear ONCE per cycle
- [ ] Refresh page - listener should auto-start
- [ ] No errors in console

## Files Modified

1. **src/hooks/useWakeWord.ts** - Enhanced with callback ref and explicit restart
2. **src/hooks/useLaraAssistant.ts** - Fixed pipeline with explicit restart
3. **src/lib/ai/wakeWordManager.ts** - NEW persistent manager (optional)

## Migration Notes

- No breaking changes to component API
- `VoiceCommandButton.tsx` works as-is
- Optional: Use `wakeWordManager.ts` for advanced use cases
- Existing code continues to work with improvements

## Performance Impact

- ✅ Reduced restart delay: 1000ms → 500ms (listener) + 300ms (pipeline)
- ✅ Eliminated duplicate restart attempts
- ✅ Reduced CPU usage from repeated restarts
- ✅ Faster wake word re-activation

## Future Improvements

1. Add Vosk support for offline wake word detection
2. Implement wake word confidence scoring
3. Add audio level visualization
4. Support multiple wake words
5. Add wake word training/customization

