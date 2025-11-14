import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/fitbit/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const conn = await getConnection(userId);
    const connected = !!(conn && conn.is_connected);
    return NextResponse.json({ connected });
  } catch (err) {
    console.error('[FITBIT][status] error', err);
    return NextResponse.json({ error: 'Failed to check Fitbit status' }, { status: 500 });
  }
}

