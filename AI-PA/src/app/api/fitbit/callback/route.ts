import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/fitbit/auth';


export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // userId
  if (!code || !state) {
    return NextResponse.redirect(new URL('/healthcare?fitbit=error', url.origin));
  }

  try {
    await exchangeCodeForTokens(code, state);
    return NextResponse.redirect(new URL('/healthcare?fitbit=connected', url.origin));
  } catch (err) {
    console.error('[FITBIT][callback] error', err);
    return NextResponse.redirect(new URL('/healthcare?fitbit=error', url.origin));
  }
}
