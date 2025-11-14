# Exact Code Changes - Android Spotify Integration Fix

## File: `AI-PA/src/lib/spotify/redirect.ts`

### Change 1: openUriScheme() - Android Branch (Lines 91-143)

**Location**: Inside the `if (isAndroid())` block

**BEFORE**:
```typescript
if (isAndroid()) {
  // Android: Use Intent URL format to avoid permission prompts
  console.log('📱 [SPOTIFY REDIRECT] Using Android Intent URL approach (no permission prompt)');

  let intentUrl: string;

  if (uri.startsWith('spotify://')) {
    const path = uri.substring('spotify://'.length);
    intentUrl = `intent://${path}#Intent;scheme=spotify;package=com.spotify.music;end`;
  } else if (uri.startsWith('spotify:')) {
    const path = uri.substring('spotify:'.length).replace(/:/g, '/');
    intentUrl = `intent://${path}#Intent;scheme=spotify;package=com.spotify.music;end`;
  } else {
    intentUrl = uri;
  }

  console.log(`🔗 [SPOTIFY REDIRECT] Intent URL: ${intentUrl}`);

  // Use direct navigation with Intent URL (no permission prompt)
  window.location.href = intentUrl;

  // Monitor visibility to detect if app opened
  const handleVisibilityChange = () => {
    if (document.hidden) {
      appOpened = true;
      console.log('✅ [SPOTIFY REDIRECT] Spotify app opened (page lost focus)');
      clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Fallback to web player if app doesn't open
  const fallbackTimer = setTimeout(() => {
    if (!appOpened && !fallbackTriggered) {
      fallbackTriggered = true;
      const reason = `Spotify app not found on Android after ${timeout}ms`;
      console.log(`⏱️ [SPOTIFY REDIRECT] ${reason}`);
      console.log(`🌐 [SPOTIFY REDIRECT] Opening web player: ${webUrl}`);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      onFallback?.(reason);
      window.location.href = webUrl;
    }
  }, timeout);
}
```

**AFTER**:
```typescript
if (isAndroid()) {
  // Android: Try direct URI scheme first (works with Spotify app)
  // If that fails, the browser will show an error and we'll fallback to web
  console.log('📱 [SPOTIFY REDIRECT] Using Android URI scheme approach');
  console.log(`🔗 [SPOTIFY REDIRECT] Direct URI: ${uri}`);

  // Create an iframe to attempt the URI scheme
  // This prevents page navigation if the app isn't installed
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.src = uri;
  document.body.appendChild(iframe);

  console.log('📱 [SPOTIFY REDIRECT] Created iframe with URI scheme');

  // Monitor visibility to detect if app opened
  const handleVisibilityChange = () => {
    if (document.hidden) {
      appOpened = true;
      console.log('✅ [SPOTIFY REDIRECT] Spotify app opened (page lost focus)');
      clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Fallback to web player if app doesn't open
  const fallbackTimer = setTimeout(() => {
    if (!appOpened && !fallbackTriggered) {
      fallbackTriggered = true;
      const reason = `Spotify app not found on Android after ${timeout}ms`;
      console.log(`⏱️ [SPOTIFY REDIRECT] ${reason}`);
      console.log(`🌐 [SPOTIFY REDIRECT] Opening web player: ${webUrl}`);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      onFallback?.(reason);
      window.location.href = webUrl;
    }
  }, timeout);

  // Clean up iframe after a short delay
  setTimeout(() => {
    try {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    } catch (e) {
      // Iframe might already be removed
    }
  }, 100);
}
```

**Key Differences**:
- ❌ Removed: Intent URL conversion logic
- ❌ Removed: `window.location.href = intentUrl`
- ✅ Added: Iframe creation with URI scheme
- ✅ Added: Iframe cleanup after 100ms

---

### Change 2: searchInSpotifyApp() (Lines 275-310)

**BEFORE**:
```typescript
export async function searchInSpotifyApp(query: string, onFallback?: (reason: string) => void): Promise<void> {
  try {
    console.log(`🔍 [SPOTIFY REDIRECT] Searching for: ${query}`);

    if (!query || query.trim().length === 0) {
      console.error('❌ [SPOTIFY REDIRECT] Invalid search query provided');
      throw new Error('Search query is required');
    }

    const encodedQuery = encodeURIComponent(query);

    // For Android, use the Spotify app's deep link format
    // Format: spotify://search/{query}
    // For other platforms, use standard format: spotify:search:{query}
    let spotifyUri: string;

    if (isAndroid()) {
      spotifyUri = `spotify://search/${encodedQuery}`;
      console.log(`📱 [SPOTIFY REDIRECT] Using Android deep link format: ${spotifyUri}`);
    } else {
      spotifyUri = `spotify:search:${encodedQuery}`;
      console.log(`🔗 [SPOTIFY REDIRECT] Using standard URI scheme format: ${spotifyUri}`);
    }

    const webUrl = `https://open.spotify.com/search/${encodedQuery}`;

    // Open Spotify app with web player fallback
    openUriScheme(spotifyUri, webUrl, undefined, onFallback);

  } catch (error) {
    console.error('❌ [SPOTIFY REDIRECT] Error searching Spotify:', error);
    onFallback?.(`Error searching Spotify: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

**AFTER**:
```typescript
export async function searchInSpotifyApp(query: string, onFallback?: (reason: string) => void): Promise<void> {
  try {
    console.log(`🔍 [SPOTIFY REDIRECT] Searching for: ${query}`);

    if (!query || query.trim().length === 0) {
      console.error('❌ [SPOTIFY REDIRECT] Invalid search query provided');
      throw new Error('Search query is required');
    }

    const encodedQuery = encodeURIComponent(query);

    // Use standard Spotify URI scheme format for all platforms
    // The Spotify app on Android recognizes both formats, but the standard format is more reliable
    // Format: spotify:search:{query}
    const spotifyUri = `spotify:search:${encodedQuery}`;
    console.log(`🔗 [SPOTIFY REDIRECT] Using URI scheme format: ${spotifyUri}`);

    const webUrl = `https://open.spotify.com/search/${encodedQuery}`;

    // Open Spotify app with web player fallback
    openUriScheme(spotifyUri, webUrl, undefined, onFallback);

  } catch (error) {
    console.error('❌ [SPOTIFY REDIRECT] Error searching Spotify:', error);
    onFallback?.(`Error searching Spotify: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

**Key Differences**:
- ❌ Removed: Platform-specific if/else logic
- ❌ Removed: Android deep link format check
- ✅ Added: Unified URI format for all platforms
- ✅ Simplified: Single URI construction

---

### Change 3: playInSpotifyApp() (Lines 239-263)

**BEFORE**:
```typescript
export async function playInSpotifyApp(trackId: string, onFallback?: (reason: string) => void): Promise<void> {
  try {
    console.log(`🎵 [SPOTIFY REDIRECT] Opening track: ${trackId}`);

    if (!trackId || trackId.trim().length === 0) {
      console.error('❌ [SPOTIFY REDIRECT] Invalid track ID provided');
      throw new Error('Track ID is required');
    }

    // Construct Spotify URI scheme
    // For Android, use deep link format: spotify://track/{ID}
    // For other platforms, use standard format: spotify:track:{ID}
    let spotifyUri: string;

    if (isAndroid()) {
      spotifyUri = `spotify://track/${trackId}`;
      console.log(`📱 [SPOTIFY REDIRECT] Using Android deep link format: ${spotifyUri}`);
    } else {
      spotifyUri = `spotify:track:${trackId}`;
      console.log(`🔗 [SPOTIFY REDIRECT] Using standard URI scheme format: ${spotifyUri}`);
    }

    const webUrl = `https://open.spotify.com/track/${trackId}`;

    // Open Spotify app with web player fallback
    openUriScheme(spotifyUri, webUrl, undefined, onFallback);

  } catch (error) {
    console.error('❌ [SPOTIFY REDIRECT] Error opening track:', error);
    onFallback?.(`Error opening track: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

**AFTER**:
```typescript
export async function playInSpotifyApp(trackId: string, onFallback?: (reason: string) => void): Promise<void> {
  try {
    console.log(`🎵 [SPOTIFY REDIRECT] Opening track: ${trackId}`);

    if (!trackId || trackId.trim().length === 0) {
      console.error('❌ [SPOTIFY REDIRECT] Invalid track ID provided');
      throw new Error('Track ID is required');
    }

    // Use standard Spotify URI scheme format for all platforms
    // The Spotify app recognizes this format on Android, iOS, and Desktop
    // Format: spotify:track:{ID}
    const spotifyUri = `spotify:track:${trackId}`;
    console.log(`🔗 [SPOTIFY REDIRECT] Using URI scheme format: ${spotifyUri}`);

    const webUrl = `https://open.spotify.com/track/${trackId}`;

    // Open Spotify app with web player fallback
    openUriScheme(spotifyUri, webUrl, undefined, onFallback);

  } catch (error) {
    console.error('❌ [SPOTIFY REDIRECT] Error opening track:', error);
    onFallback?.(`Error opening track: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

**Key Differences**:
- ❌ Removed: Platform-specific if/else logic
- ❌ Removed: Android deep link format check
- ✅ Added: Unified URI format for all platforms
- ✅ Simplified: Single URI construction

---

## Summary

| Change | Type | Impact |
|--------|------|--------|
| openUriScheme() Android branch | Major | Enables proper app opening |
| searchInSpotifyApp() | Minor | Simplifies code |
| playInSpotifyApp() | Minor | Simplifies code |

**Total Lines Changed**: ~50 lines
**Files Modified**: 1 file
**Breaking Changes**: None
**Backward Compatible**: Yes ✅

