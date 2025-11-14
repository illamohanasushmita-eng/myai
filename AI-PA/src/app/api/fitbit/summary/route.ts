import { NextRequest, NextResponse } from 'next/server';
import { getDailySummary } from '@/lib/fitbit/api';
import { getConnection } from '@/lib/fitbit/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const conn = await getConnection(userId);
    if (!conn || !conn.is_connected) {
      return NextResponse.json({ connected: false });
    }

    const summary = await getDailySummary(userId, date);
    return NextResponse.json(summary);
  } catch (err) {
    console.error('[FITBIT][summary] error', err);
    return NextResponse.json({ error: 'Failed to fetch Fitbit data' }, { status: 500 });
  }
}

