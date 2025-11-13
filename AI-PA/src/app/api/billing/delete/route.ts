import { NextRequest, NextResponse } from 'next/server';
import { deleteBillingReminder } from '@/lib/services/billingServiceServer';
import { z } from 'zod';

// Validation schema
const deleteSchema = z.object({
  billId: z.string().uuid('Invalid bill ID'),
});

export async function DELETE(request: NextRequest) {
  try {
    console.log('📩 DELETE /api/billing/delete - Deleting billing reminder');

    const body = await request.json();
    console.log('📩 Request body:', body);

    // Validate input
    const validationResult = deleteSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('❌ Validation error:', validationResult.error.errors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { billId } = validationResult.data;

    // Delete billing reminder
    await deleteBillingReminder(billId);

    console.log('✅ Billing reminder deleted successfully:', billId);

    return NextResponse.json(
      {
        success: true,
        message: 'Billing reminder deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in DELETE /api/billing/delete:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Failed to delete billing reminder',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

