import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SPOTIFY_CLIENT_ID = '0c8f9e9564584bf7b7a7d05d20b0559d';
const SPOTIFY_CLIENT_SECRET = '04bdbd29899b4b719439e723136cc378';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token';

export interface SpotifyToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

export async function getSpotifyAccessToken(userId: string): Promise<string> {
  try {
    // Check if token exists in database
    const { data: tokenData, error: fetchError } = await supabase
      .from('spotify_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // If token exists and not expired, return it
    if (tokenData && new Date(tokenData.expires_at) > new Date()) {
      return tokenData.access_token;
    }

    // If refresh token exists, refresh the access token
    if (tokenData?.refresh_token) {
      return await refreshSpotifyToken(userId, tokenData.refresh_token);
    }

    // Get new token using Client Credentials flow
    return await getClientCredentialsToken();
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
}

async function refreshSpotifyToken(userId: string, refreshToken: string): Promise<string> {
  try {
    const response = await fetch(SPOTIFY_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Spotify token refresh failed: ${response.statusText}`);
    }

    const data = await response.json();
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    // Update token in database
    await supabase
      .from('spotify_tokens')
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    throw error;
  }
}

async function getClientCredentialsToken(): Promise<string> {
  try {
    const response = await fetch(SPOTIFY_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Spotify auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify client credentials token:', error);
    throw error;
  }
}

export async function saveSpotifyToken(
  userId: string,
  accessToken: string,
  refreshToken?: string,
  expiresIn: number = 3600
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await supabase
      .from('spotify_tokens')
      .upsert({
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error saving Spotify token:', error);
    throw error;
  }
}

