import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const FITBIT_CLIENT_ID = (process.env.FITBIT_CLIENT_ID || '').trim();
const FITBIT_CLIENT_SECRET = (process.env.FITBIT_CLIENT_SECRET || '').trim();
const FITBIT_REDIRECT_URI = process.env.FITBIT_REDIRECT_URI || 'http://localhost:3002/api/fitbit/callback';
const FITBIT_SCOPES = (process.env.FITBIT_SCOPES || 'activity heartrate sleep profile').trim();


const FITBIT_AUTHORIZE_URL = 'https://www.fitbit.com/oauth2/authorize';
const FITBIT_TOKEN_URL = 'https://api.fitbit.com/oauth2/token';

// Admin client (server-only)
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export interface FitbitConnectionRow {
  connection_id: string;
  user_id: string;
  fitbit_user_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  scope: string | null;
  token_type: string | null;
  expires_at: string | null; // ISO
  connected_at: string | null;
  updated_at: string | null;
  is_connected: boolean | null;
}

function basicAuthHeader(): string {
  const creds = Buffer.from(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`).toString('base64');
  return `Basic ${creds}`;
}

export function getFitbitAuthorizeUrl(userId: string): string {
  const url = new URL(FITBIT_AUTHORIZE_URL);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', FITBIT_CLIENT_ID);
  url.searchParams.set('redirect_uri', FITBIT_REDIRECT_URI);
  url.searchParams.set('scope', FITBIT_SCOPES);
  url.searchParams.set('state', userId);
  // Optional UX hint
  url.searchParams.set('prompt', 'consent');
  return url.toString();
}

export async function exchangeCodeForTokens(code: string, userId: string): Promise<void> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: FITBIT_REDIRECT_URI,
    client_id: FITBIT_CLIENT_ID,
  }).toString();

  const auth = basicAuthHeader();

  const res = await fetch(FITBIT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: auth,
    },
    body,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Fitbit token exchange failed: ${res.status} ${res.statusText} — ${txt}`);
  }

  const data = await res.json();
  const expiresIn: number = data.expires_in;
  await saveFitbitToken({
    userId,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn,
    scope: data.scope,
    tokenType: data.token_type,
    fitbitUserId: data.user_id,
  });
}

export async function saveFitbitToken(args: {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope?: string;
  tokenType?: string;
  fitbitUserId?: string;
}): Promise<void> {
  const { userId, accessToken, refreshToken, expiresIn, scope, tokenType, fitbitUserId } = args;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  // Upsert by user_id (requires UNIQUE constraint on user_id)
  const { error } = await supabaseAdmin
    .from('fitbit_connections')
    .upsert(
      {
        user_id: userId,
        fitbit_user_id: fitbitUserId || null,
        access_token: accessToken,
        refresh_token: refreshToken,
        scope: scope || null,
        token_type: tokenType || 'Bearer',
        expires_at: expiresAt,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_connected: true,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('[FITBIT] Failed to save token:', error);
    throw error;
  }
}

export async function getConnection(userId: string): Promise<FitbitConnectionRow | null> {
  const { data, error } = await supabaseAdmin
    .from('fitbit_connections')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('[FITBIT] getConnection error:', error);
    throw error;
  }
  return (data as FitbitConnectionRow | null) || null;
}

function isExpired(expiresAtIso: string | null | undefined): boolean {
  if (!expiresAtIso) return true;
  const expiresAt = new Date(expiresAtIso).getTime();
  return Date.now() >= expiresAt - 60_000; // refresh 1 minute early
}

export async function getFitbitAccessToken(userId: string): Promise<string> {
  const row = await getConnection(userId);
  if (!row || !row.is_connected) {
    throw new Error('Fitbit is not connected for this user.');
  }

  if (isExpired(row.expires_at)) {
    if (!row.refresh_token) throw new Error('Missing refresh token');
    return await refreshFitbitToken(userId, row.refresh_token);
  }
  if (!row.access_token) throw new Error('Missing access token');
  return row.access_token;
}

export async function refreshFitbitToken(userId: string, refreshToken: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: FITBIT_CLIENT_ID,
  }).toString();

  const res = await fetch(FITBIT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Fitbit token refresh failed: ${res.status} ${res.statusText} — ${txt}`);
  }

  const data = await res.json();
  const expiresIn: number = data.expires_in;

  const { error } = await supabaseAdmin
    .from('fitbit_connections')
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      scope: data.scope,
      token_type: data.token_type || 'Bearer',
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      is_connected: true,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('[FITBIT] Failed to update token:', error);
    throw error;
  }

  return data.access_token as string;
}

export async function disconnectFitbit(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('fitbit_connections')
    .update({
      is_connected: false,
      access_token: null,
      refresh_token: null,
      expires_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('[FITBIT] Failed to disconnect:', error);
    throw error;
  }
}

