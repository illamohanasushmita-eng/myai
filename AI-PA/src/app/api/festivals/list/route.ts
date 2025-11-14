import { NextRequest, NextResponse } from 'next/server';
import { getFestivals } from '@/lib/services/festivalServiceServer';
import type { FestivalFilters } from '@/lib/types/festival';

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

    const filters: FestivalFilters = {};

    if (searchParams.get('country')) {
      filters.country = searchParams.get('country')!;
    }

    if (searchParams.get('category')) {
      filters.category = searchParams.get('category')!.split(',');
    }

    if (searchParams.get('startDate')) {
      filters.startDate = searchParams.get('startDate')!;
    }

    if (searchParams.get('endDate')) {
      filters.endDate = searchParams.get('endDate')!;
    }

    if (searchParams.get('isActive')) {
      filters.isActive = searchParams.get('isActive') === 'true';
    }

    if (searchParams.get('reminderEnabled')) {
      filters.reminderEnabled = searchParams.get('reminderEnabled') === 'true';
    }

    const festivals = await getFestivals(userId, filters);

    return NextResponse.json(
      { success: true, data: festivals },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error fetching festivals:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch festivals',
      },
      { status: 500 }
    );
  }
}

