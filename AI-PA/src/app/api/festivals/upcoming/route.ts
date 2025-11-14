import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingFestivals } from '@/lib/services/festivalServiceServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const daysAhead = parseInt(searchParams.get('daysAhead') || '30');
    const country = searchParams.get('country') || 'IN';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const festivals = await getUpcomingFestivals(userId, daysAhead, country);

    return NextResponse.json(
      { success: true, data: festivals },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error fetching upcoming festivals:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch upcoming festivals',
      },
      { status: 500 }
    );
  }
}

