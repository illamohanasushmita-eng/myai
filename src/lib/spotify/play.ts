import { getSpotifyAccessToken } from './auth';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export interface PlaybackDevice {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  volume_percent: number;
}

export async function getAvailableDevices(userId: string): Promise<PlaybackDevice[]> {
  try {
    const accessToken = await getSpotifyAccessToken(userId);

    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/devices`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get devices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.devices;
  } catch (error) {
    console.error('Error getting available devices:', error);
    throw error;
  }
}

export async function playTrack(
  userId: string,
  trackUri: string,
  deviceId?: string
): Promise<boolean> {
  try {
    const accessToken = await getSpotifyAccessToken(userId);

    const body: any = {
      uris: [trackUri],
    };

    if (deviceId) {
      body.device_id = deviceId;
    }

    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/play`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 204) {
      return true;
    }

    if (!response.ok) {
      throw new Error(`Failed to play track: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error playing track:', error);
    throw error;
  }
}

export async function playPlaylist(
  userId: string,
  playlistUri: string,
  deviceId?: string
): Promise<boolean> {
  try {
    const accessToken = await getSpotifyAccessToken(userId);

    const body: any = {
      context_uri: playlistUri,
    };

    if (deviceId) {
      body.device_id = deviceId;
    }

    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/play`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 204) {
      return true;
    }

    if (!response.ok) {
      throw new Error(`Failed to play playlist: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error playing playlist:', error);
    throw error;
  }
}

export async function pausePlayback(userId: string, deviceId?: string): Promise<boolean> {
  try {
    const accessToken = await getSpotifyAccessToken(userId);

    const params = deviceId ? `?device_id=${deviceId}` : '';

    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/pause${params}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      return true;
    }

    if (!response.ok) {
      throw new Error(`Failed to pause playback: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error pausing playback:', error);
    throw error;
  }
}

export async function getCurrentPlayback(userId: string): Promise<any> {
  try {
    const accessToken = await getSpotifyAccessToken(userId);

    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get current playback: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting current playback:', error);
    throw error;
  }
}

export async function setVolume(
  userId: string,
  volumePercent: number,
  deviceId?: string
): Promise<boolean> {
  try {
    const accessToken = await getSpotifyAccessToken(userId);

    const params = new URLSearchParams({
      volume_percent: Math.min(100, Math.max(0, volumePercent)).toString(),
    });

    if (deviceId) {
      params.append('device_id', deviceId);
    }

    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/volume?${params}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      return true;
    }

    if (!response.ok) {
      throw new Error(`Failed to set volume: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error setting volume:', error);
    throw error;
  }
}

