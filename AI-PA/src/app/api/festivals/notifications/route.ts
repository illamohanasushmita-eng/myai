import { NextRequest, NextResponse } from 'next/server';
import { getUserNotifications } from '@/lib/services/festivalServiceServer';
import type { NotificationFilters } from '@/lib/types/festival';

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

    const filters: NotificationFilters = {};

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!.split(',');
    }

    if (searchParams.get('type')) {
      filters.type = searchParams.get('type')!.split(',');
    }

    if (searchParams.get('priority')) {
      filters.priority = searchParams.get('priority')!.split(',');
    }

    const notifications = await getUserNotifications(userId, filters);

    return NextResponse.json(
      { success: true, data: notifications },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error fetching notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
      },
      { status: 500 }
    );
  }
}

