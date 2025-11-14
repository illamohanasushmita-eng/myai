import { NextRequest, NextResponse } from 'next/server';
import { updateUserFestivalPreferences } from '@/lib/services/festivalServiceServer';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  userId: z.string().uuid(),
  countries: z.array(z.string()).optional(),
  enabled_categories: z.array(z.string()).optional(),
  voice_notifications_enabled: z.boolean().optional(),
  push_notifications_enabled: z.boolean().optional(),
  notification_time: z.string().optional(),
  days_before_notification: z.number().int().min(0).max(30).optional(),
  muted_festivals: z.array(z.string()).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = updatePreferencesSchema.safeParse(body);

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

    const { userId, ...updateData } = validationResult.data;

    const preferences = await updateUserFestivalPreferences(userId, updateData);

    return NextResponse.json(
      {
        success: true,
        message: 'Festival preferences updated successfully',
        data: preferences,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error updating festival preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update festival preferences',
      },
      { status: 500 }
    );
  }
}

