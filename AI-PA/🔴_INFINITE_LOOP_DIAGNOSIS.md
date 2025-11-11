# 🔴 Infinite Loop Issue - Diagnosis & Root Cause

**Status**: DIAGNOSED  
**Date**: 2025-11-08  
**Issue**: System stuck in infinite restart loop  
**Severity**: CRITICAL  

---

## 🎯 PROBLEM SUMMARY

The wake word detection system is stuck in an infinite restart loop:

```
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
🎤 Starting wake word recognition again
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
[REPEATS INFINITELY]
```

---

## 🔍 ROOT CAUSE ANALYSIS

### Issue 1: Callback Dependency Chain (PRIMARY CAUSE)

**Location**: `VoiceCommandButton.tsx` lines 70-92

```typescript
const {
  isListeningForWakeWord,
  wakeWordDetected,
  startWakeWordListener,
  stopWakeWordListener,
  isSupported: wakeWordSupported,
} = useWakeWord({
  enabled: enableWakeWord && wakeWordActive && !isListening,
  onWakeWordDetected: () => {
    // This callback is recreated on EVERY render!
    console.log('🎤 Wake word detected in component');
    setFeedbackType('success');
    setFeedbackMessage('Wake word detected! Listening for command...');
    setShowFeedback(true);
    stopWakeWordListener();
    activateFromWakeWord();
  },
  onError: (err) => {
    // This callback is also recreated on EVERY render!
    if (err && !err.includes('aborted') && !err.includes('No speech')) {
      console.error('Wake word error:', err);
      setFeedbackType('error');
      setFeedbackMessage(err);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
  },
});
```

**Problem**: 
- `onWakeWordDetected` callback is recreated on every render
- `onError` callback is recreated on every render
- These are dependencies in `useWakeWord` hook (line 207)
- When dependencies change, `setupRecognition` is recreated
- This causes the recognition to be re-initialized constantly

### Issue 2: Enabled State Dependency

**Location**: `VoiceCommandButton.tsx` line 71

```typescript
enabled: enableWakeWord && wakeWordActive && !isListening,
```

**Problem**:
- `enabled` state changes frequently
- When `enabled` changes, it triggers re-initialization
- This can cause the listener to restart unexpectedly

### Issue 3: Missing Dependency Memoization

**Location**: `VoiceCommandButton.tsx` lines 72-91

**Problem**:
- Callbacks are not memoized with `useCallback`
- They change on every render
- This causes `setupRecognition` to be recreated
- Recognition gets re-initialized constantly

### Issue 4: Recognition Restart Logic

**Location**: `useWakeWord.ts` lines 170-206

```typescript
recognition.onend = () => {
  console.log('🎤 Wake word recognition ended');

  if (!isMountedRef.current) {
    console.log('🎤 Component unmounted, not restarting');
    return;
  }

  setIsListeningForWakeWord(false);

  // Check if we should restart
  const shouldRestart = enabledRef.current && !wakeWordDetectedRef.current && !isStoppingRef.current;

  if (shouldRestart) {
    console.log('🎤 Restarting wake word listener...');
    setTimeout(() => {
      if (!isMountedRef.current) return;

      try {
        console.log('🎤 Starting wake word recognition again');
        recognition.start();
      } catch (e) {
        // Ignore errors when restarting
        if (e instanceof Error && !e.message.includes('already started')) {
          console.error('Error restarting wake word listener:', e);
        }
      }
    }, 500);
  }
};
```

**Problem**:
- When recognition ends, it immediately tries to restart
- If `enabled` is true and no wake word detected, it restarts
- But if callbacks keep changing, recognition keeps re-initializing
- This creates an infinite loop of: end → restart → re-initialize → end → restart

---

## 📊 INFINITE LOOP FLOW

```
1. Component renders
   ↓
2. onWakeWordDetected callback created (new reference)
   ↓
3. useWakeWord dependency changes
   ↓
4. setupRecognition recreated
   ↓
5. Recognition re-initialized
   ↓
6. Recognition starts
   ↓
7. Recognition ends (no speech detected)
   ↓
8. onend handler checks shouldRestart
   ↓
9. shouldRestart = true (enabled && !detected && !stopping)
   ↓
10. Calls recognition.start() after 500ms
    ↓
11. Recognition starts again
    ↓
12. Recognition ends again (no speech detected)
    ↓
13. LOOP BACK TO STEP 8
```

---

## 🎯 WHY IT'S HAPPENING NOW

### Timeline
1. Previous fix separated mount tracking from recognition setup
2. This was correct, but didn't address callback dependency issue
3. When component renders, callbacks are recreated
4. This causes `setupRecognition` to be recreated
5. Recognition gets re-initialized
6. If no speech is detected, it tries to restart
7. But recognition keeps getting re-initialized
8. Creates infinite loop

---

## ✅ SOLUTION REQUIRED

### Fix 1: Memoize Callbacks in VoiceCommandButton
- Wrap `onWakeWordDetected` with `useCallback`
- Wrap `onError` with `useCallback`
- This prevents callbacks from being recreated on every render

### Fix 2: Stabilize Enabled State
- Use `useCallback` for enabled state logic
- Or pass stable boolean instead of computed value

### Fix 3: Add Debouncing to Recognition Restart
- Add delay before restarting recognition
- Prevent rapid restart cycles

### Fix 4: Add Recognition State Tracking
- Track if recognition is currently running
- Prevent multiple simultaneous instances

---

## 📋 CONSOLE LOGS TO EXPECT

### Current (BROKEN)
```
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
🎤 Starting wake word recognition again
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
[REPEATS INFINITELY]
```

### After Fix (EXPECTED)
```
🎤 Starting wake word listener
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
🎤 Starting wake word recognition again
[WAITS FOR USER TO SAY "HEY LARA"]
🎤 Final transcript: hey lara
✅ Wake word detected: hey lara
🎤 Calling onWakeWordDetected callback
🎤 Wake word detected in component
🎤 Wake word recognition ended
🎤 Wake word detected, not restarting (waiting for command processing)
```

---

## 🔧 NEXT STEPS

1. **Memoize callbacks** in VoiceCommandButton
2. **Stabilize enabled state** logic
3. **Add recognition state tracking** to prevent re-initialization
4. **Test the fix** with console logs
5. **Verify continuous listening** works

---

## 📞 DIAGNOSIS COMPLETE

The infinite loop is caused by:
1. ❌ Callbacks recreated on every render
2. ❌ Dependencies change constantly
3. ❌ Recognition re-initialized repeatedly
4. ❌ Restart logic triggers infinite cycle

**Solution**: Memoize callbacks and stabilize dependencies


