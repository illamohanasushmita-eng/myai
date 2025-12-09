import { NextRequest, NextResponse } from 'next/server';
import { playTrack, playPlaylist, getAvailableDevices } from '@/lib/spotify/play';

export async function POST(request: NextRequest) {
  try {
    const { trackId, playlistId, userId, deviceId, type } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!trackId && !playlistId) {
      return NextResponse.json(
        { error: 'Either trackId or playlistId is required' },
        { status: 400 }
      );
    }

    let success = false;
    let device = deviceId;

    // If no device specified, get the first active device
    if (!device) {
      try {
        const devices = await getAvailableDevices(userId);
        const activeDevice = devices.find((d) => d.is_active);
        device = activeDevice?.id || devices[0]?.id;
      } catch (error) {
        console.warn('Could not get devices, proceeding without device ID');
      }
    }

    if (trackId) {
      const trackUri = `spotify:track:${trackId}`;
      success = await playTrack(userId, trackUri, device);
    } else if (playlistId) {
      const playlistUri = `spotify:playlist:${playlistId}`;
      success = await playPlaylist(userId, playlistUri, device);
    }

    return NextResponse.json({
      success,
      trackId,
      playlistId,
      deviceId: device,
    });
  } catch (error) {
    console.error('Error playing track:', error);
    return NextResponse.json(
      { error: 'Failed to play track' },
      { status: 500 }
    );
  }
}

