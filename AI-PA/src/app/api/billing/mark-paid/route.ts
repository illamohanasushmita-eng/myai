import { NextRequest, NextResponse } from 'next/server';
import { markBillAsPaid } from '@/lib/services/billingServiceServer';
import { z } from 'zod';

// Validation schema
const markPaidSchema = z.object({
  billId: z.string().uuid('Invalid bill ID'),
  paymentMethod: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('📩 POST /api/billing/mark-paid - Marking bill as paid');

    const body = await request.json();
    console.log('📩 Request body:', body);

    // Validate input
    const validationResult = markPaidSchema.safeParse(body);
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

    const { billId, paymentMethod } = validationResult.data;

    // Mark bill as paid
    const updatedBill = await markBillAsPaid(billId, paymentMethod);

    console.log('✅ Bill marked as paid successfully:', billId);

    return NextResponse.json(
      {
        success: true,
        message: 'Bill marked as paid successfully',
        data: updatedBill,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in POST /api/billing/mark-paid:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Failed to mark bill as paid',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

