'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get token and type from URL params
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (token && type) {
          // Verify the OTP token
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as 'signup' | 'recovery' | 'invite',
          });

          if (error) {
            console.error('Error verifying OTP:', error);
            setMessage('Email verification failed. Please try again.');
            setTimeout(() => router.push('/signin?error=verification_failed'), 2000);
            return;
          }

          if (data.user) {
            setMessage('Email verified successfully! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 1000);
          }
        } else {
          // Check if user is already authenticated
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            router.push('/dashboard');
          } else {
            router.push('/signin?error=no_token');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setMessage('An error occurred during verification.');
        setTimeout(() => router.push('/signin?error=callback_error'), 2000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-foreground">{message}</p>
      </div>
    </div>
  );
}
