import { NextRequest, NextResponse } from 'next/server';
import { getFitbitAuthorizeUrl } from '@/lib/fitbit/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const url = getFitbitAuthorizeUrl(userId);
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('[FITBIT][auth] error', err);
    return NextResponse.json({ error: 'Failed to start Fitbit auth' }, { status: 500 });
  }
}

