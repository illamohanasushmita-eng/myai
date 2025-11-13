import { NextRequest, NextResponse } from 'next/server';
import { getBillingInsights } from '@/lib/services/billingServiceServer';

export async function GET(request: NextRequest) {
  try {
    console.log('📩 GET /api/billing/insights - Fetching billing insights');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      console.error('❌ Missing userId parameter');
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    console.log('📩 Fetching insights for user:', userId);

    // Get billing insights
    const insights = await getBillingInsights(userId);

    console.log('✅ Billing insights calculated successfully');

    return NextResponse.json(
      {
        success: true,
        data: insights,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in GET /api/billing/insights:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Failed to fetch billing insights',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

