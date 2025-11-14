import { NextRequest, NextResponse } from 'next/server';
import { updateNotificationStatus } from '@/lib/services/festivalServiceServer';
import { z } from 'zod';

const updateStatusSchema = z.object({
  userId: z.string().uuid(),
  notificationId: z.string().uuid(),
  status: z.enum(['sent', 'read', 'dismissed', 'actioned']),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = updateStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { userId, notificationId, status } = validationResult.data;

    const notification = await updateNotificationStatus(userId, notificationId, status);

    return NextResponse.json(
      {
        success: true,
        message: `Notification status updated to ${status}`,
        data: notification,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error updating notification status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notification status',
      },
      { status: 500 }
    );
  }
}

