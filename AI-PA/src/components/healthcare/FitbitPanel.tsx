'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Summary {
  connected: boolean;
  date: string;
  steps: number;
  calories: number;
  restingHeartRate: number | null;
  sleep: { totalMinutesAsleep: number; totalTimeInBed: number };
}

export function FitbitPanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [banner, setBanner] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const uid = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (uid) {
      setUserId(uid);
      return;
    }
    // Fallback: try Supabase session
    supabase.auth.getUser()
      .then(({ data }) => {
        const sid = data?.user?.id || null;
        if (sid) {
          try { localStorage.setItem('userId', sid); } catch {}
          setUserId(sid);
        } else {
          setUserId(null);
        }
      })
      .catch(() => setUserId(null));
  }, []);

  useEffect(() => {
    // Handle fitbit callback query param and show a banner
    if (typeof window !== 'undefined') {
      try {
        const current = new URL(window.location.href);
        const status = current.searchParams.get('fitbit');
        if (status === 'connected') {
          setBanner({ text: 'Fitbit connected successfully', type: 'success' });
        } else if (status === 'error') {
          setBanner({ text: 'Fitbit connection failed. Please try again.', type: 'error' });
        }
        if (status) {
          current.searchParams.delete('fitbit');
          window.history.replaceState({}, '', current.toString());
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (!userId) {
        // No user logged in; stop loading so UI can show sign-in prompt
        setConnected(false);
        setSummary(null);
        setLoading(false);
        return;
      }
      try {
        const statusRes = await fetch(`/api/fitbit/status?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' });
        const status = await statusRes.json();
        setConnected(!!status.connected);
        if (status.connected) {
          const sumRes = await fetch(`/api/fitbit/summary?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' });
          const sum = await sumRes.json();
          if (sum.connected) setSummary(sum);
        } else {
          setSummary(null);
        }
      } catch (e) {
        console.error('Failed to load Fitbit status/summary', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const connect = () => {
    if (!userId) return;
    window.location.href = `/api/fitbit/auth?userId=${encodeURIComponent(userId)}`;
  };

  const disconnect = async () => {
    if (!userId) return;
    try {
      setDisconnecting(true);
      await fetch('/api/fitbit/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setConnected(false);
      setSummary(null);
    } catch (e) {
      console.error('Failed to disconnect Fitbit', e);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-md frosted-glass border border-white/30 dark:border-white/10">
      {banner && (
        <div className={`mb-3 px-3 py-2 rounded ${banner.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'}`}>
          {banner.text}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">monitor_heart</span>
          <div>
            <h2 className="text-xl font-bold">Fitbit</h2>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              {connected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
        {connected ? (
          <Button variant="ghost" onClick={disconnect} disabled={disconnecting} className="text-red-500">
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        ) : !userId ? (
          <div className="text-sm text-subtle-light dark:text-subtle-dark">
            Please sign in to connect Fitbit.{' '}
            <Link href="/signin" className="text-primary underline">Sign in</Link>
          </div>
        ) : (
          <Button onClick={connect} disabled={loading} className="font-semibold">
            Connect Fitbit
          </Button>
        )}
      </div>
      {connected && summary && (
        <div className="grid grid-cols-2 gap-4 mt-4 text-center">
          <div>
            <p className="text-2xl font-bold">{summary.steps.toLocaleString()}</p>
            <p className="text-xs text-subtle-light dark:text-subtle-dark">Steps</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{summary.calories.toLocaleString()}</p>
            <p className="text-xs text-subtle-light dark:text-subtle-dark">Calories</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{summary.restingHeartRate ?? '\u2014'}</p>
            <p className="text-xs text-subtle-light dark:text-subtle-dark">Resting HR</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {Math.floor((summary.sleep.totalMinutesAsleep || 0) / 60)}h{' '}
              {Math.round((summary.sleep.totalMinutesAsleep || 0) % 60)}m
            </p>
            <p className="text-xs text-subtle-light dark:text-subtle-dark">Sleep</p>
          </div>
        </div>
      )}



    </div>
  );
}

