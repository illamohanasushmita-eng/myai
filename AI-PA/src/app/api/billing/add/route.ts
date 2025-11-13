import { NextRequest, NextResponse } from 'next/server';
import { createBillingReminder } from '@/lib/services/billingServiceServer';
import { CreateBillingReminderInput } from '@/lib/types/database';
import { z } from 'zod';

// Validation schema
const createBillingSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  bill_name: z.string().min(1, 'Bill name is required'),
  category: z.enum([
    'phone_emi',
    'electricity',
    'water',
    'internet',
    'gas',
    'home_loan',
    'vehicle_emi',
    'ott_subscription',
    'insurance',
    'credit_card',
    'mobile_recharge',
    'rent',
    'other',
  ]),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  frequency: z.enum(['monthly', 'quarterly', 'yearly', 'one-time']).optional(),
  reminder_days: z.number().min(0).max(30).optional(),
  reminder_enabled: z.boolean().optional(),
  notes: z.string().optional(),
  auto_pay: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('📩 POST /api/billing/add - Creating new billing reminder');

    const body = await request.json();
    console.log('📩 Request body:', body);

    // Validate input
    const validationResult = createBillingSchema.safeParse(body);
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

    const { userId, ...billingData } = validationResult.data;

    // Create billing reminder
    const newBill = await createBillingReminder(
      userId,
      billingData as CreateBillingReminderInput
    );

    console.log('✅ Billing reminder created successfully:', newBill.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Billing reminder created successfully',
        data: newBill,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error in POST /api/billing/add:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Failed to create billing reminder',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

