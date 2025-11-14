import { NextRequest, NextResponse } from 'next/server';
import { toggleFestivalReminder } from '@/lib/services/festivalServiceServer';
import { z } from 'zod';

const toggleReminderSchema = z.object({
  userId: z.string().uuid(),
  eventId: z.string().uuid(),
  enabled: z.boolean(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = toggleReminderSchema.safeParse(body);

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

    const { userId, eventId, enabled } = validationResult.data;

    const festival = await toggleFestivalReminder(userId, eventId, enabled);

    return NextResponse.json(
      {
        success: true,
        message: `Festival reminder ${enabled ? 'enabled' : 'disabled'}`,
        data: festival,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error toggling festival reminder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle festival reminder',
      },
      { status: 500 }
    );
  }
}

