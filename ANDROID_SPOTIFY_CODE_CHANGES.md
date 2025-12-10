# Android Spotify Integration - Exact Code Changes

## File: `AI-PA/src/lib/spotify/redirect.ts`

### Change 1: openUriScheme() - Android Branch (Lines 91-143)

**BEFORE (Broken - Direct Navigation)**:

```typescript
if (isAndroid()) {
  // Android: Use Intent URL format to avoid permission prompts
  console.log(
    "📱 [SPOTIFY REDIRECT] Using Android Intent URL approach (no permission prompt)",
  );

  let intentUrl: string;
  if (uri.startsWith("spotify://")) {
    const path = uri.substring("spotify://".length);
    intentUrl = `intent://${path}#Intent;scheme=spotify;package=com.spotify.music;end`;
  } else if (uri.startsWith("spotify:")) {
    const path = uri.substring("spotify:".length).replace(/:/g, "/");
    intentUrl = `intent://${path}#Intent;scheme=spotify;package=com.spotify.music;end`;
  } else {
    intentUrl = uri;
  }

  console.log(`🔗 [SPOTIFY REDIRECT] Intent URL: ${intentUrl}`);

  // ❌ PROBLEM: Direct navigation causes page reload
  window.location.href = intentUrl;

  // Rest of visibility detection...
}
```

**AFTER (Fixed - Iframe Approach)**:

```typescript
if (isAndroid()) {
  // Android: Try direct URI scheme first (works with Spotify app)
  console.log("📱 [SPOTIFY REDIRECT] Using Android URI scheme approach");
  console.log(`🔗 [SPOTIFY REDIRECT] Direct URI: ${uri}`);

  // ✅ SOLUTION: Use iframe to attempt URI scheme without page navigation
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.src = uri; // Use standard URI: spotify:search:query
  document.body.appendChild(iframe);

  console.log("📱 [SPOTIFY REDIRECT] Created iframe with URI scheme");

  // Monitor visibility to detect if app opened
  const handleVisibilityChange = () => {
    if (document.hidden) {
      appOpened = true;
      console.log("✅ [SPOTIFY REDIRECT] Spotify app opened (page lost focus)");
      clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Fallback to web player if app doesn't open
  const fallbackTimer = setTimeout(() => {
    if (!appOpened && !fallbackTriggered) {
      fallbackTriggered = true;
      const reason = `Spotify app not found on Android after ${timeout}ms`;
      console.log(`⏱️ [SPOTIFY REDIRECT] ${reason}`);
      console.log(`🌐 [SPOTIFY REDIRECT] Opening web player: ${webUrl}`);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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

### Change 2: searchInSpotifyApp() (Lines 273-310)

**BEFORE (Platform-Specific)**:

```typescript
export async function searchInSpotifyApp(
  query: string,
  onFallback?: (reason: string) => void,
): Promise<void> {
  try {
    console.log(`🔍 [SPOTIFY REDIRECT] Searching for: ${query}`);

    if (!query || query.trim().length === 0) {
      console.error("❌ [SPOTIFY REDIRECT] Invalid search query provided");
      throw new Error("Search query is required");
    }

    const encodedQuery = encodeURIComponent(query);

    // ❌ PROBLEM: Different formats for Android vs other platforms
    let spotifyUri: string;
    if (isAndroid()) {
      spotifyUri = `spotify://search/${encodedQuery}`; // Deep link format
      console.log(
        `📱 [SPOTIFY REDIRECT] Using Android deep link format: ${spotifyUri}`,
      );
    } else {
      spotifyUri = `spotify:search:${encodedQuery}`; // Standard format
      console.log(
        `🔗 [SPOTIFY REDIRECT] Using standard URI scheme format: ${spotifyUri}`,
      );
    }

    const webUrl = `https://open.spotify.com/search/${encodedQuery}`;
    openUriScheme(spotifyUri, webUrl, undefined, onFallback);
  } catch (error) {
    console.error("❌ [SPOTIFY REDIRECT] Error searching Spotify:", error);
    onFallback?.(
      `Error searching Spotify: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
```

**AFTER (Unified Format)**:

```typescript
export async function searchInSpotifyApp(
  query: string,
  onFallback?: (reason: string) => void,
): Promise<void> {
  try {
    console.log(`🔍 [SPOTIFY REDIRECT] Searching for: ${query}`);

    if (!query || query.trim().length === 0) {
      console.error("❌ [SPOTIFY REDIRECT] Invalid search query provided");
      throw new Error("Search query is required");
    }

    const encodedQuery = encodeURIComponent(query);

    // ✅ SOLUTION: Use standard format for all platforms
    const spotifyUri = `spotify:search:${encodedQuery}`;
    console.log(`🔗 [SPOTIFY REDIRECT] Using URI scheme format: ${spotifyUri}`);

    const webUrl = `https://open.spotify.com/search/${encodedQuery}`;
    openUriScheme(spotifyUri, webUrl, undefined, onFallback);
  } catch (error) {
    console.error("❌ [SPOTIFY REDIRECT] Error searching Spotify:", error);
    onFallback?.(
      `Error searching Spotify: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
```

### Change 3: playInSpotifyApp() (Lines 230-263)

**BEFORE (Platform-Specific)**:

```typescript
export async function playInSpotifyApp(
  trackId: string,
  onFallback?: (reason: string) => void,
): Promise<void> {
  try {
    console.log(`🎵 [SPOTIFY REDIRECT] Opening track: ${trackId}`);

    if (!trackId || trackId.trim().length === 0) {
      console.error("❌ [SPOTIFY REDIRECT] Invalid track ID provided");
      throw new Error("Track ID is required");
    }

    // ❌ PROBLEM: Different formats for Android vs other platforms
    let spotifyUri: string;
    if (isAndroid()) {
      spotifyUri = `spotify://track/${trackId}`; // Deep link format
      console.log(
        `📱 [SPOTIFY REDIRECT] Using Android deep link format: ${spotifyUri}`,
      );
    } else {
      spotifyUri = `spotify:track:${trackId}`; // Standard format
      console.log(
        `🔗 [SPOTIFY REDIRECT] Using standard URI scheme format: ${spotifyUri}`,
      );
    }

    const webUrl = `https://open.spotify.com/track/${trackId}`;
    openUriScheme(spotifyUri, webUrl, undefined, onFallback);
  } catch (error) {
    console.error("❌ [SPOTIFY REDIRECT] Error opening track:", error);
    onFallback?.(
      `Error opening track: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
```

**AFTER (Unified Format)**:

```typescript
export async function playInSpotifyApp(
  trackId: string,
  onFallback?: (reason: string) => void,
): Promise<void> {
  try {
    console.log(`🎵 [SPOTIFY REDIRECT] Opening track: ${trackId}`);

    if (!trackId || trackId.trim().length === 0) {
      console.error("❌ [SPOTIFY REDIRECT] Invalid track ID provided");
      throw new Error("Track ID is required");
    }

    // ✅ SOLUTION: Use standard format for all platforms
    const spotifyUri = `spotify:track:${trackId}`;
    console.log(`🔗 [SPOTIFY REDIRECT] Using URI scheme format: ${spotifyUri}`);

    const webUrl = `https://open.spotify.com/track/${trackId}`;
    openUriScheme(spotifyUri, webUrl, undefined, onFallback);
  } catch (error) {
    console.error("❌ [SPOTIFY REDIRECT] Error opening track:", error);
    onFallback?.(
      `Error opening track: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
```

## Summary of Changes

| Aspect             | Before                                         | After                           |
| ------------------ | ---------------------------------------------- | ------------------------------- |
| Android approach   | `window.location.href` with Intent URL         | iframe with standard URI scheme |
| Page navigation    | Full page reload                               | No page navigation              |
| URI format         | Platform-specific (`spotify://` vs `spotify:`) | Unified standard format         |
| Fallback detection | Unreliable                                     | Reliable visibility detection   |
| Error handling     | Silent fallback                                | Callback with reason            |

## Testing the Changes

### Test Case 1: Android with Spotify App

```
Command: "play prabhas songs"
Expected: Native Spotify app opens with search results
Console: "✅ Spotify app opened (page lost focus)"
```

### Test Case 2: Android without Spotify App

```
Command: "play prabhas songs"
Expected: Falls back to web player after 2.5 seconds
Console: "Spotify app not found on Android after 2500ms"
```

### Test Case 3: Desktop (Windows/Mac/Linux)

```
Command: "play prabhas songs"
Expected: Native Spotify app opens (if installed)
Console: "🖥️ Using direct URI scheme approach for Windows"
```

## No Breaking Changes

✅ All changes are backward compatible:

- Callback parameter is optional
- Existing code without callbacks still works
- No changes to function signatures
- No changes to return types
