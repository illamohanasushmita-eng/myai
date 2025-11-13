import { NextRequest, NextResponse } from 'next/server';
import {
  getUserBillingReminders,
  getUpcomingBills,
} from '@/lib/services/billingServiceServer';
import { BillingStatus } from '@/lib/types/database';

export async function GET(request: NextRequest) {
  try {
    console.log('📩 GET /api/billing/list - Fetching billing reminders');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as BillingStatus | null;
    const upcoming = searchParams.get('upcoming') === 'true';

    if (!userId) {
      console.error('❌ Missing userId parameter');
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    console.log('📩 Query params:', { userId, status, upcoming });

    let bills;

    if (upcoming) {
      // Get upcoming bills (next 30 days)
      bills = await getUpcomingBills(userId);
      console.log(`✅ Found ${bills.length} upcoming bills`);
    } else {
      // Get all bills or filter by status
      bills = await getUserBillingReminders(userId, status || undefined);
      console.log(`✅ Found ${bills.length} bills`);
    }

    return NextResponse.json(
      {
        success: true,
        count: bills.length,
        data: bills,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in GET /api/billing/list:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Failed to fetch billing reminders',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

