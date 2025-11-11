# 📋 Implementation Guide - Voice Assistant Lifecycle Fix

## Overview

This guide explains the fixed voice assistant lifecycle and how to use it.

## Architecture

### Layer 1: Wake Word Detection (useWakeWord.ts)
- Manages Web Speech API recognition
- Handles continuous listening
- Detects wake word variations
- Provides explicit restart function

### Layer 2: Pipeline Orchestration (useLaraAssistant.ts)
- Coordinates wake word → record → STT → classify → route → restart
- Manages processing state
- Handles errors and recovery
- Triggers navigation

### Layer 3: Persistent Manager (wakeWordManager.ts - Optional)
- Component-independent listening
- Singleton pattern
- Advanced state management
- Useful for background listening

## How It Works

### 1. Initialization

```typescript
// In VoiceCommandButton.tsx
const {
  isListeningForWakeWord,
  startAssistant,
  stopAssistant,
  restartAssistant,
  isProcessing,
  error,
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
```

### 2. Wake Word Detection Flow

```
User says "Hey Lara"
  ↓
useWakeWord detects wake word
  ↓
Calls onWakeWordDetected callback
  ↓
Callback stored in callbackRef
  ↓
Pipeline callback executes
  ↓
Stops listener
  ↓
Records audio
```

### 3. Processing Flow

```
Audio recorded
  ↓
geminiSTT converts to text
  ↓
classifyIntent classifies intent
  ↓
routeAction executes action
  ↓
Navigation happens (in component)
  ↓
restartWakeWordListener called
  ↓
Listener restarts after 300ms
  ↓
Back to listening
```

## Key Functions

### useWakeWord Hook

```typescript
const {
  isListeningForWakeWord,      // boolean - is listening
  wakeWordDetected,             // boolean - was detected
  startWakeWordListener,        // () => void - start listening
  stopWakeWordListener,         // () => void - stop listening
  restartWakeWordListener,      // () => void - restart listening
  isSupported,                  // boolean - browser support
  error,                        // string | null - error message
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
  isProcessing,                 // boolean - processing command
  currentIntent,                // Intent | null - current intent
  lastActionResult,             // ActionResult | null - last result
  error,                        // string | null - error message
  isListeningForWakeWord,       // boolean - is listening
  startAssistant,               // () => void - start
  stopAssistant,                // () => void - stop
  restartAssistant,             // () => void - restart
} = useLaraAssistant({
  onWakeWordDetected: () => {},
  onIntentClassified: (intent) => {},
  onActionExecuted: (result) => {},
  onError: (err) => {},
  userId: 'user-id',
});
```

### WakeWordManager (Optional)

```typescript
import { getWakeWordManager } from '@/lib/ai/wakeWordManager';

const manager = getWakeWordManager({
  onWakeWordDetected: () => {},
  onError: (err) => {},
  language: 'en-US',
});

manager.start();              // Start listening
manager.stop();               // Stop listening
manager.restart();            // Restart listening
manager.disable();            // Disable (won't restart)
manager.enable();             // Enable (will restart)
manager.destroy();            // Cleanup
manager.getState();           // Get current state
```

## State Management

### Wake Word Hook State

```typescript
{
  isListeningForWakeWord: boolean,    // Currently listening
  wakeWordDetected: boolean,          // Wake word was detected
  isSupported: boolean,               // Browser support
  error: string | null,               // Error message
}
```

### Pipeline Hook State

```typescript
{
  isProcessing: boolean,              // Processing command
  currentIntent: Intent | null,       // Current intent
  lastActionResult: ActionResult | null,  // Last action result
  error: string | null,               // Error message
  isListeningForWakeWord: boolean,    // Currently listening
}
```

### Manager State

```typescript
{
  isListening: boolean,               // Currently listening
  isProcessing: boolean,              // Processing command
  lastDetectedAt: number | undefined, // Last detection timestamp
  errorCount: number,                 // Error count
}
```

## Error Handling

### Common Errors

1. **"Speech recognition not supported"**
   - Browser doesn't support Web Speech API
   - Check browser compatibility

2. **"No microphone found"**
   - Microphone not connected
   - Check device settings

3. **"Microphone permission denied"**
   - User denied microphone access
   - Request permission again

4. **"Network error"**
   - Network connection issue
   - Check internet connection

### Recovery

```typescript
onError: (err) => {
  console.error('Error:', err);
  
  if (err.includes('permission')) {
    // Request permission again
  } else if (err.includes('network')) {
    // Retry after delay
    setTimeout(() => restartAssistant(), 2000);
  } else {
    // Show error to user
  }
}
```

## Performance Optimization

### Reduce Latency

```typescript
// Use shorter recording duration for faster response
const audioBlob = await recordForFixedDuration(3000); // 3s instead of 5s
```

### Reduce CPU Usage

```typescript
// Disable interim results if not needed
recognition.interimResults = false;

// Use lower sample rate
const mediaRecorder = new MediaRecorder(stream, {
  audioBitsPerSecond: 16000,
});
```

### Reduce Memory Usage

```typescript
// Clear audio chunks after processing
audioChunksRef.current = [];

// Stop media tracks
stream.getTracks().forEach(track => track.stop());
```

## Testing

### Manual Testing

1. Open dashboard
2. Say "Hey Lara"
3. Say command
4. Verify action executes
5. Say "Hey Lara" again
6. Repeat 5+ times

### Automated Testing

```typescript
// Test wake word detection
test('detects wake word', async () => {
  const { result } = renderHook(() => useWakeWord());
  
  // Simulate wake word detection
  // Verify callback is called
});

// Test pipeline execution
test('executes pipeline', async () => {
  const { result } = renderHook(() => useLaraAssistant());
  
  // Simulate wake word detection
  // Verify all steps execute
  // Verify restart is called
});
```

## Debugging

### Enable Verbose Logging

```typescript
// In useWakeWord.ts
console.log('🎤 [DEBUG]', message);

// In useLaraAssistant.ts
console.log('🎤 [PIPELINE]', message);

// In wakeWordManager.ts
console.log('🎤 [MANAGER]', message);
```

### Check Console Output

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
✅ Intent classified: {intent: "show_tasks"}
🎤 Step 5: Routing action
📋 Showing tasks
✅ Pipeline completed successfully
🎤 Step 6: Restarting wake word listener
🎤 Calling restartWakeWordListener
🎤 Explicitly restarting wake word listener
🎤 Starting wake word recognition again
🎤 Wake word listener started
```

## Troubleshooting

### Wake word not detected

1. Check microphone is working
2. Speak clearly and loudly
3. Check language setting
4. Try different wake word variations

### Actions not executing

1. Check console for errors
2. Verify intent classification
3. Check action router
4. Verify navigation target

### Listener stops after one cycle

1. Check for errors in console
2. Verify restartWakeWordListener is called
3. Check for pending restart flag
4. Verify callback is being called

### High CPU usage

1. Disable interim results
2. Reduce sample rate
3. Increase recording duration
4. Use lower language model

