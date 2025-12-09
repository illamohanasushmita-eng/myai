/**
 * Spotify Redirect Service
 * Handles redirecting users to Spotify app/web player
 * Supports both URI scheme approach (app redirect) and Web Playback SDK (auto-play)
 *
 * IMPORTANT: URI schemes do NOT support automatic playback
 * For auto-play, use playTrackWithAutoPlay() which requires userId
 */

/**
 * Helper function to sanitize music queries
 * Removes punctuation and extra whitespace
 *
 * @param query - Raw music query
 * @returns Sanitized query
 */
export function sanitizeMusicQuery(query: string): string {
  if (!query) return "";

  // Remove punctuation and extra whitespace
  return query
    .replace(/[.,!?;:'"]/g, "") // Remove punctuation
    .trim()
    .replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Detect if running on Android
 */
function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

/**
 * Detect if running on iOS
 */
function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Detect if running on Windows desktop
 */
function isWindowsDesktop(): boolean {
  return (
    /Windows/i.test(navigator.userAgent) &&
    !/Android/i.test(navigator.userAgent)
  );
}

/**
 * Detect if running on macOS desktop
 */
function isMacDesktop(): boolean {
  return (
    /Macintosh|Mac OS X/i.test(navigator.userAgent) &&
    !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

/**
 * Detect if running on Linux desktop
 */
function isLinuxDesktop(): boolean {
  return (
    /Linux/i.test(navigator.userAgent) && !/Android/i.test(navigator.userAgent)
  );
}

/**
 * Helper function to open URI scheme without permission prompts
 * Uses Android Intent URLs on Android (no permission prompt)
 * Uses direct navigation on desktop platforms
 * Uses iframe approach on iOS
 *
 * Strategy:
 * 1. On Android: Try direct URI scheme first, then Intent URL as fallback
 * 2. On Desktop (Windows/Mac/Linux): Use direct navigation with URI scheme
 * 3. On iOS: Use iframe with URI scheme
 * 4. Monitor visibility to detect if app opened
 * 5. Fallback to web player if app doesn't open after timeout
 *
 * @param uri - Spotify URI scheme (e.g., spotify:track:ID)
 * @param webUrl - Web player URL for fallback
 * @param timeoutMs - Timeout before fallback (default 2500ms for Android, 2000ms for others)
 * @param onFallback - Callback when falling back to web player
 * @returns Promise that resolves when the URI scheme attempt is complete (after timeout or app opens)
 */
function openUriScheme(
  uri: string,
  webUrl: string,
  timeoutMs?: number,
  onFallback?: (reason: string) => void,
): Promise<void> {
  return new Promise((resolve) => {
    console.log(`🔗 [SPOTIFY REDIRECT] Attempting to open URI: ${uri}`);
    const platform = isAndroid()
      ? "Android"
      : isIOS()
        ? "iOS"
        : isWindowsDesktop()
          ? "Windows"
          : isMacDesktop()
            ? "macOS"
            : isLinuxDesktop()
              ? "Linux"
              : "Unknown";
    console.log(`📱 [SPOTIFY REDIRECT] Platform: ${platform}`);

    const timeout = timeoutMs ?? (isAndroid() ? 2500 : 2000);
    console.log(`⏱️ [SPOTIFY REDIRECT] Timeout set to ${timeout}ms`);

    let appOpened = false;
    let fallbackTriggered = false;

    if (isAndroid()) {
      // Android: Try direct URI scheme first (works with Spotify app)
      // If that fails, the browser will show an error and we'll fallback to web
      console.log("📱 [SPOTIFY REDIRECT] Using Android URI scheme approach");
      console.log(`🔗 [SPOTIFY REDIRECT] Direct URI: ${uri}`);

      // Create an iframe to attempt the URI scheme
      // This prevents page navigation if the app isn't installed
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.src = uri;
      document.body.appendChild(iframe);

      console.log("📱 [SPOTIFY REDIRECT] Created iframe with URI scheme");

      // Monitor visibility to detect if app opened
      const handleVisibilityChange = () => {
        if (document.hidden) {
          appOpened = true;
          console.log(
            "✅ [SPOTIFY REDIRECT] Spotify app opened (page lost focus)",
          );
          clearTimeout(fallbackTimer);
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
          resolve(); // Resolve promise when app opens
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
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
          onFallback?.(reason);
          // Use window.open instead of window.location.href to avoid page navigation
          // This opens the web player in a new tab/window without disrupting the current page
          window.open(webUrl, "_blank");
          resolve(); // Resolve promise when fallback is triggered
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
    } else if (isWindowsDesktop() || isMacDesktop() || isLinuxDesktop()) {
      // Desktop: Use iframe approach with URI scheme (doesn't navigate away from page)
      console.log(
        `🖥️ [SPOTIFY REDIRECT] Using iframe-based URI scheme approach for ${platform}`,
      );

      // Create an iframe to attempt the URI scheme
      // This prevents page navigation if the app isn't installed
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.src = uri;
      document.body.appendChild(iframe);

      console.log("🖥️ [SPOTIFY REDIRECT] Created iframe with URI scheme");

      // Monitor visibility to detect if app opened
      const handleVisibilityChange = () => {
        if (document.hidden) {
          appOpened = true;
          console.log(
            "✅ [SPOTIFY REDIRECT] Spotify app opened (page lost focus)",
          );
          clearTimeout(fallbackTimer);
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
          resolve(); // Resolve promise when app opens
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Fallback to web player if app doesn't open
      const fallbackTimer = setTimeout(() => {
        if (!appOpened && !fallbackTriggered) {
          fallbackTriggered = true;
          const reason = `Spotify app not found on ${platform} after ${timeout}ms`;
          console.log(`⏱️ [SPOTIFY REDIRECT] ${reason}`);
          console.log(`🌐 [SPOTIFY REDIRECT] Opening web player: ${webUrl}`);
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
          onFallback?.(reason);
          // Use window.open instead of window.location.href to avoid page navigation
          // This opens the web player in a new tab/window without disrupting the current page
          window.open(webUrl, "_blank");
          resolve(); // Resolve promise when fallback is triggered
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
    } else {
      // iOS: Use iframe approach (doesn't navigate away from page)
      console.log(
        "📱 [SPOTIFY REDIRECT] Using iframe-based URI scheme approach for iOS",
      );

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";

      console.log(`🔗 [SPOTIFY REDIRECT] Creating iframe with URI: ${uri}`);
      iframe.src = uri;
      document.body.appendChild(iframe);

      // Monitor visibility to detect if app opened
      const handleVisibilityChange = () => {
        if (document.hidden) {
          appOpened = true;
          console.log(
            "✅ [SPOTIFY REDIRECT] Spotify app opened (page lost focus)",
          );
          clearTimeout(fallbackTimer);
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
          resolve(); // Resolve promise when app opens
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Fallback to web player if app doesn't open
      const fallbackTimer = setTimeout(() => {
        if (!appOpened && !fallbackTriggered) {
          fallbackTriggered = true;
          const reason = `Spotify app not found on iOS after ${timeout}ms`;
          console.log(`⏱️ [SPOTIFY REDIRECT] ${reason}`);
          console.log(`🌐 [SPOTIFY REDIRECT] Opening web player: ${webUrl}`);
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
          onFallback?.(reason);
          // Use window.open instead of window.location.href to avoid page navigation
          // This opens the web player in a new tab/window without disrupting the current page
          window.open(webUrl, "_blank");
          resolve(); // Resolve promise when fallback is triggered
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
  });
}

/**
 * Open a specific track in Spotify app
 * Uses spotify:track:{ID} URI scheme with web player fallback
 * Works on Android, iOS, and Desktop platforms
 *
 * @param trackId - Spotify track ID
 * @param onFallback - Optional callback when falling back to web player
 * @returns Promise that resolves when redirect is initiated
 */
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

    // Use standard Spotify URI scheme format for all platforms
    // The Spotify app recognizes this format on Android, iOS, and Desktop
    // Format: spotify:track:{ID}
    const spotifyUri = `spotify:track:${trackId}`;
    console.log(`🔗 [SPOTIFY REDIRECT] Using URI scheme format: ${spotifyUri}`);

    const webUrl = `https://open.spotify.com/track/${trackId}`;

    // Open Spotify app with web player fallback
    openUriScheme(spotifyUri, webUrl, undefined, onFallback);
  } catch (error) {
    console.error("❌ [SPOTIFY REDIRECT] Error opening track:", error);
    onFallback?.(
      `Error opening track: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Open Spotify search in app
 * Uses spotify:search:{query} URI scheme with web player fallback
 * On Android, uses the same URI scheme format as other platforms
 * On Desktop, uses direct URI scheme navigation
 *
 * @param query - Search query (song name, artist, genre, etc.)
 * @param onFallback - Optional callback when falling back to web player
 * @returns Promise that resolves when redirect is initiated
 */
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

    // Encode query for URI scheme
    const encodedQuery = encodeURIComponent(query);

    // Use standard Spotify URI scheme format for all platforms
    // The Spotify app on Android recognizes both formats, but the standard format is more reliable
    // Format: spotify:search:{query}
    const spotifyUri = `spotify:search:${encodedQuery}`;
    console.log(`🔗 [SPOTIFY REDIRECT] Using URI scheme format: ${spotifyUri}`);

    const webUrl = `https://open.spotify.com/search/${encodedQuery}`;

    // Open Spotify app with web player fallback
    // Wait for the URI scheme attempt to complete (either app opens or timeout)
    await openUriScheme(spotifyUri, webUrl, undefined, onFallback);
  } catch (error) {
    console.error("❌ [SPOTIFY REDIRECT] Error searching Spotify:", error);
    onFallback?.(
      `Error searching Spotify: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Open Spotify home page
 * Opens the Spotify web player home page
 *
 * @returns Promise that resolves when redirect is initiated
 */
export async function openSpotifyHome(): Promise<void> {
  try {
    console.log("🏠 [SPOTIFY REDIRECT] Opening Spotify home");

    const spotifyHomeUrl = "https://open.spotify.com";
    console.log(`🏠 [SPOTIFY REDIRECT] Opening: ${spotifyHomeUrl}`);

    window.location.href = spotifyHomeUrl;
  } catch (error) {
    console.error("❌ [SPOTIFY REDIRECT] Error opening Spotify home:", error);
  }
}

/**
 * Helper function to validate Spotify track ID format
 * Spotify track IDs are typically 22 characters long
 *
 * @param trackId - Track ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidSpotifyTrackId(trackId: string): boolean {
  if (!trackId || typeof trackId !== "string") {
    return false;
  }
  // Spotify track IDs are typically 22 characters of alphanumeric characters
  return /^[a-zA-Z0-9]{22}$/.test(trackId);
}

/**
 * Helper function to extract track ID from Spotify URL
 * Handles formats like:
 * - https://open.spotify.com/track/123abc
 * - spotify:track:123abc
 *
 * @param url - Spotify URL or URI
 * @returns Track ID or null if not found
 */
export function extractTrackIdFromUrl(url: string): string | null {
  try {
    // Handle spotify:track:ID format
    const uriMatch = url.match(/spotify:track:([a-zA-Z0-9]+)/);
    if (uriMatch) {
      return uriMatch[1];
    }

    // Handle https://open.spotify.com/track/ID format
    const urlMatch = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }

    return null;
  } catch (error) {
    console.error("❌ [SPOTIFY REDIRECT] Error extracting track ID:", error);
    return null;
  }
}

/**
 * Play a track with automatic playback using Spotify Web Playback SDK
 * This function is a FALLBACK after URI scheme attempt
 * It triggers actual playback on an active Spotify device
 *
 * IMPORTANT:
 * - This is called AFTER URI scheme attempt (as fallback)
 * - Requires user authentication and an active Spotify device
 * - Does NOT fallback to URI scheme (URI scheme is tried first)
 *
 * @param trackId - Spotify track ID
 * @param userId - User ID for authentication
 * @param trackName - Track name for logging
 * @returns Promise that resolves when playback is initiated
 */
export async function playTrackWithAutoPlay(
  trackId: string,
  userId: string,
  trackName: string = "track",
): Promise<boolean> {
  try {
    console.log(
      `🎵 [SPOTIFY REDIRECT] Attempting auto-play fallback for: ${trackName} (ID: ${trackId})`,
    );

    if (!trackId || trackId.trim().length === 0) {
      console.error("❌ [SPOTIFY REDIRECT] Invalid track ID provided");
      return false;
    }

    if (!userId || userId.trim().length === 0) {
      console.error("❌ [SPOTIFY REDIRECT] User ID required for auto-play");
      return false;
    }

    // Call the Spotify playback API endpoint
    console.log(
      `🎵 [SPOTIFY REDIRECT] Calling /api/spotify/play for auto-play fallback`,
    );
    const response = await fetch("/api/spotify/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trackId,
        userId,
      }),
    });

    if (!response.ok) {
      console.error(
        `❌ [SPOTIFY REDIRECT] Auto-play API error: ${response.status} ${response.statusText}`,
      );
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ [SPOTIFY REDIRECT] Error details:", errorData);
      return false;
    }

    const data = await response.json();

    if (data.success) {
      console.log(
        `✅ [SPOTIFY REDIRECT] Auto-play fallback successful for: ${trackName}`,
      );
      return true;
    } else {
      console.warn(
        `⚠️ [SPOTIFY REDIRECT] Auto-play returned success=false: ${data.error || "Unknown error"}`,
      );
      return false;
    }
  } catch (error) {
    console.error(
      "❌ [SPOTIFY REDIRECT] Error during auto-play fallback:",
      error,
    );
    return false;
  }
}
