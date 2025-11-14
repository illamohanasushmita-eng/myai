import { NextRequest, NextResponse } from 'next/server';
import { getUserFestivalPreferences } from '@/lib/services/festivalServiceServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const preferences = await getUserFestivalPreferences(userId);

    return NextResponse.json(
      { success: true, data: preferences },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error fetching festival preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch festival preferences',
      },
      { status: 500 }
    );
  }
}

