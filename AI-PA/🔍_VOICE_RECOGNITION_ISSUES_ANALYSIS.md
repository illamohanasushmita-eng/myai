# 🔍 Voice Recognition Issues - Root Cause Analysis

**Status**: INVESTIGATING  
**Date**: 2025-11-07

---

## 🔴 Issues Identified

### Issue 1: Voice Recognition Not Working
**Symptom**: Wake word indicator is blinking (listening), but voice commands are not being recognized or processed.

**Root Cause**: 
The `useWakeWord` hook detects "Hey Lara" and calls `activateFromWakeWord()`, which should trigger `useVoiceCommand` to start listening. However, there's a timing issue:

1. `useWakeWord` stops listening after detecting wake word (line 77 in useWakeWord.ts)
2. `activateFromWakeWord()` is called (line 63 in VoiceCommandButton.tsx)
3. But `useVoiceCommand` may not be properly initialized or may have stale references

**Technical Details**:
- `useWakeWord` uses `continuous: true` (always listening)
- `useVoiceCommand` uses `continuous: false` (single utterance)
- When wake word is detected, `recognition.stop()` is called
- Then `activateFromWakeWord()` tries to start a NEW listening session
- But the recognition object might be in an invalid state

### Issue 2: Spotify Integration Not Connected to Voice Commands
**Symptom**: "play a song" command shows "Opening music player..." but doesn't actually play music.

**Root Cause**:
- The `play_music` intent is detected correctly
- But the `executeCommand()` function in VoiceCommandButton.tsx only sets a message (line 134)
- It doesn't actually call Spotify API to search and play music
- Spotify integration exists but is not connected to voice commands

**Technical Details**:
- Spotify search API exists: `/api/spotify/search`
- Spotify play API exists: `/api/spotify/play`
- But voice command handler doesn't use them
- No user context/ID is passed to Spotify functions

### Issue 3: Missing User Context
**Symptom**: Spotify API calls need user ID but voice commands don't have it.

**Root Cause**:
- Voice commands are processed without user authentication context
- Spotify functions require `userId` parameter
- No way to get current user ID in VoiceCommandButton component

---

## 📋 Required Fixes

### Fix 1: Improve Wake Word to Voice Command Transition
- Ensure proper state reset between wake word and voice command
- Add delay to allow recognition object to reset
- Improve error handling for recognition state transitions
- Add logging to debug the flow

### Fix 2: Implement Spotify Integration in Voice Commands
- Add Spotify search functionality when "play_music" intent is detected
- Implement track selection logic
- Call Spotify play API with proper parameters
- Add user context/authentication

### Fix 3: Add User Context to Voice Commands
- Get current user ID from session/auth
- Pass user ID through voice command processing
- Use user ID for Spotify API calls

### Fix 4: Improve Command Execution
- Add actual action handlers for music commands
- Implement search and play flow
- Add feedback for music playback
- Handle Spotify authentication errors

---

## 🔧 Implementation Plan

1. **Fix useWakeWord → useVoiceCommand transition**
   - Add proper state management
   - Ensure recognition object is ready
   - Add delay between stop and start

2. **Add Spotify integration to voice commands**
   - Create new API endpoint for voice-based music search/play
   - Integrate with existing Spotify services
   - Add user context handling

3. **Update VoiceCommandButton**
   - Get user ID from auth context
   - Implement music command handler
   - Add Spotify search and play logic

4. **Test all voice commands**
   - Test wake word detection
   - Test voice command recognition
   - Test music playback
   - Test other commands (tasks, reminders, etc.)

---

## 📊 Files to Modify

1. `src/hooks/useWakeWord.ts` - Improve state management
2. `src/hooks/useVoiceCommand.ts` - Add user context support
3. `src/components/voice/VoiceCommandButton.tsx` - Implement music handler
4. `src/app/api/ai/voice-command/route.ts` - Add user context
5. `src/app/api/spotify/voice-play/route.ts` - NEW: Voice-based music playback

---

## 🎯 Success Criteria

- ✅ Wake word detection works
- ✅ Voice command recognition works after wake word
- ✅ "Play a song" command searches and plays music
- ✅ All other voice commands work
- ✅ Automatic execution without manual clicks
- ✅ Proper error handling and user feedback


