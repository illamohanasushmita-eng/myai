# 🎤 Wake Word Workflow - Fixed Flow Diagram

---

## 📊 Complete Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM STARTUP                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Initialize Speech API
                              ↓
                    Create Recognition Object
                              ↓
                    Set continuous = true
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              PASSIVE LISTENING MODE (Wake Word)                 │
│                                                                 │
│  enabled: true                                                  │
│  wakeWordActive: true                                           │
│  isListening: false (command mode)                              │
│                                                                 │
│  ✅ Listening for "Hey Lara"                                    │
│  ✅ No infinite restarts                                        │
│  ✅ Continuous passive listening                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User says "Hey Lara"
                              ↓
                    onresult event fires
                              ↓
                    Check if "hey lara" in transcript
                              ↓
                    ✅ WAKE WORD DETECTED!
                              ↓
        ┌───────────────────────────────────────┐
        │ Set wakeWordDetectedRef = true         │
        │ Set isStoppingRef = true               │
        │ Call recognition.stop()                │
        │ Call onWakeWordDetected callback       │
        └───────────────────────────────────────┘
                              ↓
                    onend event fires
                              ↓
        ┌───────────────────────────────────────┐
        │ Check: isMountedRef.current?           │
        │ YES → Continue                         │
        │ NO → Return (component unmounted)      │
        └───────────────────────────────────────┘
                              ↓
        ┌───────────────────────────────────────┐
        │ Check: shouldRestart?                  │
        │ enabledRef.current = true              │
        │ wakeWordDetectedRef.current = true ✅  │
        │ isStoppingRef.current = true ✅        │
        │                                        │
        │ Result: shouldRestart = FALSE          │
        │ → Do NOT restart listener              │
        └───────────────────────────────────────┘
                              ↓
        ┌───────────────────────────────────────┐
        │ In onWakeWordDetected callback:        │
        │ 1. stopWakeWordListener()              │
        │ 2. activateFromWakeWord()              │
        │    - Calls startListening() (command)  │
        │    - Resets state                      │
        └───────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              ACTIVE LISTENING MODE (Command)                    │
│                                                                 │
│  enabled: false (wake word disabled)                            │
│  wakeWordActive: false                                          │
│  isListening: true (command mode active)                        │
│                                                                 │
│  ✅ Listening for user's command                               │
│  ✅ Recognition.continuous = false                             │
│  ✅ Will stop after speech ends                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User says "show my tasks"
                              ↓
                    onresult event fires
                              ↓
                    Accumulate transcript
                              ↓
                    User stops speaking
                              ↓
                    onend event fires
                              ↓
                    Process command with Gemini AI
                              ↓
                    Extract intent: "show_tasks"
                              ↓
        ┌───────────────────────────────────────┐
        │ In handleCommandResponse:              │
        │ 1. Show success feedback               │
        │ 2. Execute command                     │
        │ 3. Navigate to /professional           │
        │ 4. Wait 1 second                       │
        │ 5. setWakeWordActive(true)             │
        │ 6. startWakeWordListener()             │
        └───────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              RETURN TO PASSIVE LISTENING MODE                   │
│                                                                 │
│  enabled: true (wake word re-enabled)                           │
│  wakeWordActive: true                                           │
│  isListening: false (command mode ended)                        │
│                                                                 │
│  ✅ Back to listening for "Hey Lara"                            │
│  ✅ Ready for next command                                      │
│  ✅ No infinite loops                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (Cycle repeats)
```

---

## 🔄 State Transitions

### Transition 1: Startup → Wake Word Listening

```
Component Mount
    ↓
enableWakeWord = true
wakeWordActive = true
isListening = false
    ↓
enabled = true && true && true = TRUE
    ↓
startWakeWordListener()
    ↓
recognition.start()
    ↓
Listening for "Hey Lara"
```

### Transition 2: Wake Word Detected → Command Listening

```
User says "Hey Lara"
    ↓
onresult: "hey lara" detected
    ↓
wakeWordDetectedRef = true
isStoppingRef = true
recognition.stop()
    ↓
onend: Check shouldRestart
    ↓
shouldRestart = true && false && true = FALSE
    ↓
Do NOT restart (correct!)
    ↓
onWakeWordDetected callback:
  - stopWakeWordListener()
  - activateFromWakeWord()
    ↓
wakeWordActive = false
isListening = true
    ↓
enabled = true && false && false = FALSE
    ↓
Command listening active
```

### Transition 3: Command Executed → Wake Word Listening

```
Command processed
    ↓
handleCommandResponse()
    ↓
Execute command
    ↓
Wait 1 second
    ↓
setWakeWordActive(true)
startWakeWordListener()
    ↓
wakeWordActive = true
isListening = false
    ↓
enabled = true && true && true = TRUE
    ↓
recognition.start()
    ↓
Back to listening for "Hey Lara"
```

---

## 🛡️ Safety Checks

### Check 1: Component Mounted?

```typescript
if (!isMountedRef.current) {
  console.log("🎤 Component unmounted, not restarting");
  return;
}
```

**Purpose**: Prevent listeners from restarting after component unmounts  
**Benefit**: Prevents memory leaks and errors

### Check 2: Should Restart?

```typescript
const shouldRestart =
  enabledRef.current && !wakeWordDetectedRef.current && !isStoppingRef.current;
```

**Conditions**:

- `enabledRef.current`: Wake word feature is enabled
- `!wakeWordDetectedRef.current`: Wake word was NOT detected
- `!isStoppingRef.current`: We're not intentionally stopping

**Benefit**: Prevents infinite loops

### Check 3: Enabled State Sync

```typescript
useEffect(() => {
  enabledRef.current = enabled;
}, [enabled]);
```

**Purpose**: Keep ref in sync with state  
**Benefit**: Event handlers see current enabled value

---

## 📋 Key Differences (Before vs After)

| Aspect             | Before (Broken)              | After (Fixed)             |
| ------------------ | ---------------------------- | ------------------------- |
| **State Sync**     | Used state in event handlers | Uses refs for sync access |
| **Enabled Check**  | Checked stale state          | Checks current ref        |
| **Unmount Check**  | No check                     | Checks isMountedRef       |
| **Restart Logic**  | Always restarted             | Conditional restart       |
| **Wake Word Mode** | Kept restarting              | Stops on detection        |
| **Command Mode**   | Didn't activate              | Activates properly        |
| **Infinite Loop**  | ❌ YES                       | ✅ NO                     |

---

## 🎯 Critical Fixes

### Fix 1: Ref Synchronization

```typescript
// BEFORE: Used state (stale)
if (enabled && !wakeWordDetectedRef.current) {
}

// AFTER: Uses ref (current)
if (enabledRef.current && !wakeWordDetectedRef.current) {
}
```

### Fix 2: Unmount Detection

```typescript
// BEFORE: No check
recognition.onend = () => {
  /* restart */
};

// AFTER: Checks if mounted
if (!isMountedRef.current) return;
```

### Fix 3: Proper Mode Switching

```typescript
// BEFORE: Didn't stop wake word listener
onWakeWordDetected: () => {
  activateFromWakeWord();
};

// AFTER: Stops wake word before command
onWakeWordDetected: () => {
  stopWakeWordListener();
  activateFromWakeWord();
};
```

### Fix 4: Wake Word Re-enable

```typescript
// BEFORE: Didn't re-enable wake word
handleCommandResponse() { /* execute */ }

// AFTER: Re-enables wake word after command
handleCommandResponse() {
  /* execute */
  setWakeWordActive(true);
  startWakeWordListener();
}
```

---

## ✅ Result

**All transitions work correctly!**

- ✅ Startup → Wake word listening
- ✅ Wake word detected → Command listening
- ✅ Command executed → Wake word listening
- ✅ No infinite loops
- ✅ Proper cleanup on unmount
- ✅ Smooth user experience
