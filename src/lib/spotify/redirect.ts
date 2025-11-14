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
  if (!query) return '';

  // Remove punctuation and extra whitespace
  return query
    .replace(/[.,!?;:'"]/g, '') // Remove punctuation
    .trim()
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Helper function to open URI scheme without navigating away from the app
 * Uses iframe approach to trigger URI scheme without page navigation
 *
 * @param uri - The URI scheme to open (e.g., spotify:track:123)
 * @param fallbackUrl - The fallback URL if URI scheme doesn't work
 * @param timeoutMs - Timeout in milliseconds before falling back
 */
function openUriScheme(uri: string, fallbackUrl: string, timeoutMs: number = 2000): void {
  console.log(`🔗 [SPOTIFY REDIRECT] Attempting to open URI: ${uri}`);

  // Create an iframe to trigger the URI scheme without navigating
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = uri;
  document.body.appendChild(iframe);

  // Set timeout to fallback to web URL if app doesn't respond
  const fallbackTimeout = setTimeout(() => {
    console.log(`⏱️ [SPOTIFY REDIRECT] URI scheme didn't trigger after ${timeoutMs}ms, falling back to web URL`);
    console.log(`� [SPOTIFY REDIRECT] Opening web URL: ${fallbackUrl}`);

    // Remove the iframe
    document.body.removeChild(iframe);

    // Open web URL in new tab/window
    window.open(fallbackUrl, '_blank');
  }, timeoutMs);

  // If the app opens, the page might lose focus or the iframe might be removed
  // We'll also try to detect if the URI scheme worked by checking visibility
  const checkVisibility = setInterval(() => {
    if (document.hidden) {
      console.log('✅ [SPOTIFY REDIRECT] App opened (page lost focus), clearing fallback');
      clearTimeout(fallbackTimeout);
      clearInterval(checkVisibility);
      try {
        document.body.removeChild(iframe);
      } catch (e) {
        // iframe might already be removed
      }
    }
  }, 100);

  // Clear interval after timeout
  setTimeout(() => {
    clearInterval(checkVisibility);
  }, timeoutMs + 500);
}

/**
 * Open a specific track in Spotify app/web player
 * Uses spotify:track:{ID} URI scheme with fallback to web player
 *
 * @param trackId - Spotify track ID
 * @returns Promise that resolves when redirect is initiated
 */
export async function playInSpotifyApp(trackId: string): Promise<void> {
  try {
    console.log(`� [SPOTIFY REDIRECT] Opening track: ${trackId}`);

    if (!trackId || trackId.trim().length === 0) {
      console.error('❌ [SPOTIFY REDIRECT] Invalid track ID provided');
      throw new Error('Track ID is required');
    }

    // Construct Spotify URI scheme
    const spotifyUri = `spotify:track:${trackId}`;
    const webUrl = `https://open.spotify.com/track/${trackId}`;

    console.log(`🎵 [SPOTIFY REDIRECT] Spotify URI: ${spotifyUri}`);
    console.log(`🌐 [SPOTIFY REDIRECT] Fallback URL: ${webUrl}`);

    // Use iframe approach to open URI scheme without navigating away
    openUriScheme(spotifyUri, webUrl, 2000);

  } catch (error) {
    console.error('❌ [SPOTIFY REDIRECT] Error opening track:', error);
    // Fallback to web player on error
    try {
      const webUrl = `https://open.spotify.com/track/${trackId}`;
      console.log(`🌐 [SPOTIFY REDIRECT] Error fallback to web player: ${webUrl}`);
      window.open(webUrl, '_blank');
    } catch (fallbackError) {
      console.error('❌ [SPOTIFY REDIRECT] Fallback also failed:', fallbackError);
    }
  }
}

/**
 * Open Spotify search in app/web player
 * Uses spotify:search:{query} URI scheme with fallback to web search
 *
 * @param query - Search query (song name, artist, genre, etc.)
 * @returns Promise that resolves when redirect is initiated
 */
export async function searchInSpotifyApp(query: string): Promise<void> {
  try {
    console.log(`🔍 [SPOTIFY REDIRECT] Searching for: ${query}`);

    if (!query || query.trim().length === 0) {
      console.error('❌ [SPOTIFY REDIRECT] Invalid search query provided');
      throw new Error('Search query is required');
    }

    // Encode query for URI scheme
    const encodedQuery = encodeURIComponent(query);
    const spotifyUri = `spotify:search:${encodedQuery}`;
    const webUrl = `https://open.spotify.com/search/${encodedQuery}`;

    console.log(`🔍 [SPOTIFY REDIRECT] Spotify search URI: ${spotifyUri}`);
    console.log(`🌐 [SPOTIFY REDIRECT] Fallback URL: ${webUrl}`);

    // Use iframe approach to open URI scheme without navigating away
    openUriScheme(spotifyUri, webUrl, 2000);

  } catch (error) {
    console.error('❌ [SPOTIFY REDIRECT] Error searching Spotify:', error);
    // Fallback to web search on error
    try {
      const encodedQuery = encodeURIComponent(query);
      const webUrl = `https://open.spotify.com/search/${encodedQuery}`;
      console.log(`🌐 [SPOTIFY REDIRECT] Error fallback to web search: ${webUrl}`);
      window.open(webUrl, '_blank');
    } catch (fallbackError) {
      console.error('❌ [SPOTIFY REDIRECT] Fallback also failed:', fallbackError);
    }
  }
}

/**
 * Open Spotify home page
 * Opens the Spotify app home or web player home page
 *
 * @returns Promise that resolves when redirect is initiated
 */
export async function openSpotifyHome(): Promise<void> {
  try {
    console.log('🏠 [SPOTIFY REDIRECT] Opening Spotify home');

    // Try to open Spotify app home first
    const spotifyAppUri = 'spotify:';
    const spotifyWebUrl = 'https://open.spotify.com';

    console.log(`🏠 [SPOTIFY REDIRECT] Spotify app URI: ${spotifyAppUri}`);
    console.log(`🏠 [SPOTIFY REDIRECT] Fallback URL: ${spotifyWebUrl}`);

    // Use iframe approach to open URI scheme without navigating away
    openUriScheme(spotifyAppUri, spotifyWebUrl, 2000);
  } catch (error) {
    console.error('❌ [SPOTIFY REDIRECT] Error opening Spotify home:', error);
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
  if (!trackId || typeof trackId !== 'string') {
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
    console.error('❌ [SPOTIFY REDIRECT] Error extracting track ID:', error);
    return null;
  }
}

/**
 * Play a track with automatic playback using Spotify Web Playback SDK
 * This function triggers actual playback on an active Spotify device
 *
 * IMPORTANT: Requires user authentication and an active Spotify device
 *
 * @param trackId - Spotify track ID
 * @param userId - User ID for authentication
 * @param trackName - Track name for logging
 * @returns Promise that resolves when playback is initiated
 */
export async function playTrackWithAutoPlay(
  trackId: string,
  userId: string,
  trackName: string = 'track'
): Promise<boolean> {
  try {
    console.log(`🎵 [SPOTIFY REDIRECT] Initiating auto-play for: ${trackName} (ID: ${trackId})`);

    if (!trackId || trackId.trim().length === 0) {
      console.error('❌ [SPOTIFY REDIRECT] Invalid track ID provided');
      return false;
    }

    if (!userId || userId.trim().length === 0) {
      console.error('❌ [SPOTIFY REDIRECT] User ID required for auto-play');
      console.log('🎵 [SPOTIFY REDIRECT] Falling back to URI scheme redirect');
      await playInSpotifyApp(trackId);
      return false;
    }

    // Call the Spotify playback API endpoint
    console.log(`🎵 [SPOTIFY REDIRECT] Calling /api/spotify/play for auto-play`);
    const response = await fetch('/api/spotify/play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trackId,
        userId,
      }),
    });

    if (!response.ok) {
      console.error(`❌ [SPOTIFY REDIRECT] Auto-play API error: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [SPOTIFY REDIRECT] Error details:', errorData);

      // Fallback to URI scheme if auto-play fails
      console.log('🎵 [SPOTIFY REDIRECT] Falling back to URI scheme redirect');
      await playInSpotifyApp(trackId);
      return false;
    }

    const data = await response.json();

    if (data.success) {
      console.log(`✅ [SPOTIFY REDIRECT] Auto-play successful for: ${trackName}`);
      return true;
    } else {
      console.warn(`⚠️ [SPOTIFY REDIRECT] Auto-play returned success=false: ${data.error || 'Unknown error'}`);
      // Fallback to URI scheme if auto-play fails
      console.log('🎵 [SPOTIFY REDIRECT] Falling back to URI scheme redirect');
      await playInSpotifyApp(trackId);
      return false;
    }

  } catch (error) {
    console.error('❌ [SPOTIFY REDIRECT] Error during auto-play:', error);
    // Fallback to URI scheme on error
    try {
      console.log('🎵 [SPOTIFY REDIRECT] Falling back to URI scheme redirect');
      await playInSpotifyApp(trackId);
    } catch (fallbackError) {
      console.error('❌ [SPOTIFY REDIRECT] Fallback also failed:', fallbackError);
    }
    return false;
  }
}
