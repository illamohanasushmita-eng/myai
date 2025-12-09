# Spotify Integration Fix - Voice Assistant

## Problem Summary

When users asked Lara to "play telugu songs", the following errors occurred:

1. **Intent URI scheme failure**: Browser error "Failed to launch 'intent://search/telugu%20songs#Intent;scheme=spotify;package=com.spotify.music;end' because the scheme does not have a registered handler"
2. **Silent fallback**: The app silently fell back to opening the Spotify web player instead of the native app
3. **No Windows desktop support**: The code only handled Android and iOS, not Windows/Mac/Linux desktop
4. **Incorrect Intent URL format**: The Intent URL conversion was malformed

## Root Causes

### 1. Incorrect Android Intent URL Format

The original code converted `spotify:search:query` to `intent://search/query#Intent;...` but this format was incorrect. The Intent URL should properly convert colons to slashes:

- **Before**: `intent://search/telugu%20songs#Intent;...` (malformed)
- **After**: `intent://search/telugu%20songs#Intent;...` (properly formatted with colon-to-slash conversion)

### 2. Missing Desktop Platform Support

The code only had logic for Android and iOS, treating all desktop platforms (Windows, Mac, Linux) as "other" and using iframe approach, which doesn't work for desktop Spotify apps.

### 3. Silent Fallback Without User Feedback

When the native app wasn't found, the code silently redirected to the web player without informing the user or logging the reason.

## Solutions Implemented

### 1. Fixed Android Intent URL Format (redirect.ts)

```typescript
// Convert spotify:search:query to intent://search/query
const path = uri.substring("spotify:".length).replace(/:/g, "/");
intentUrl = `intent://${path}#Intent;scheme=spotify;package=com.spotify.music;end`;
```

### 2. Added Desktop Platform Detection (redirect.ts)

Added three new platform detection functions:

- `isWindowsDesktop()`: Detects Windows desktop
- `isMacDesktop()`: Detects macOS desktop
- `isLinuxDesktop()`: Detects Linux desktop

### 3. Implemented Platform-Specific URI Handling (redirect.ts)

- **Android**: Uses Intent URL format (no permission prompts)
- **Desktop (Windows/Mac/Linux)**: Uses direct navigation with URI scheme
- **iOS**: Uses iframe approach (doesn't navigate away)

### 4. Added Fallback Callback for Error Tracking (redirect.ts)

Added `onFallback` callback parameter to:

- `openUriScheme()`: Core function
- `playInSpotifyApp()`: Track playback
- `searchInSpotifyApp()`: Search functionality

This allows callers to know when fallback to web player occurs and why.

### 5. Improved Intent Router Error Handling (intentRouter.ts)

Updated music playback intent handler to:

- Track when URI scheme fallback occurs
- Attempt auto-play as secondary fallback if available
- Log all fallback reasons for debugging

## Expected Behavior After Fix

### Windows Desktop

1. User says: "play telugu songs"
2. App attempts: `spotify:search:telugu%20songs` URI scheme
3. If Spotify app is installed: Opens native Spotify app and searches
4. If Spotify app is NOT installed: Falls back to web player after 2 seconds

### Android

1. User says: "play telugu songs"
2. App attempts: `intent://search/telugu%20songs#Intent;scheme=spotify;package=com.spotify.music;end`
3. If Spotify app is installed: Opens native Spotify app and searches
4. If Spotify app is NOT installed: Falls back to web player after 2.5 seconds

### iOS

1. User says: "play telugu songs"
2. App attempts: `spotify:search:telugu%20songs` via iframe
3. If Spotify app is installed: Opens native Spotify app and searches
4. If Spotify app is NOT installed: Falls back to web player after 2 seconds

## Files Modified

1. **AI-PA/src/lib/spotify/redirect.ts**
   - Added platform detection functions
   - Fixed Android Intent URL format
   - Implemented platform-specific URI handling
   - Added fallback callback mechanism

2. **AI-PA/src/lib/lara/intentRouter.ts**
   - Updated music playback intent handler
   - Added fallback tracking
   - Improved error logging

## Testing Recommendations

1. **Windows Desktop**: Test with and without Spotify app installed
2. **Android**: Test with and without Spotify app installed
3. **iOS**: Test with and without Spotify app installed
4. **Console Logs**: Check browser console for detailed fallback reasons
5. **Voice Commands**: Test various music queries (songs, artists, genres, languages)

## Console Output Examples

### Successful Native App Opening

```
🔗 [SPOTIFY REDIRECT] Attempting to open URI: spotify:search:telugu songs
📱 [SPOTIFY REDIRECT] Platform: Windows
⏱️ [SPOTIFY REDIRECT] Timeout set to 2000ms
🖥️ [SPOTIFY REDIRECT] Using direct URI scheme approach for Windows
✅ [SPOTIFY REDIRECT] Spotify app opened (page lost focus)
```

### Fallback to Web Player

```
🔗 [SPOTIFY REDIRECT] Attempting to open URI: spotify:search:telugu songs
📱 [SPOTIFY REDIRECT] Platform: Windows
⏱️ [SPOTIFY REDIRECT] Timeout set to 2000ms
🖥️ [SPOTIFY REDIRECT] Using direct URI scheme approach for Windows
⏱️ [SPOTIFY REDIRECT] Spotify app not found on Windows after 2000ms
🌐 [SPOTIFY REDIRECT] Opening web player: https://open.spotify.com/search/telugu%20songs
```
