import { NextRequest, NextResponse } from 'next/server';
import { disconnectFitbit } from '@/lib/fitbit/auth';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    await disconnectFitbit(userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[FITBIT][disconnect] error', err);
    return NextResponse.json({ error: 'Failed to disconnect Fitbit' }, { status: 500 });
  }
}

