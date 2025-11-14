'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validation
    if (!email || !password) {
      setMessageType('error');
      setMessage('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.user) {
        // Store user ID in localStorage
        localStorage.setItem('userId', result.user.id);
        localStorage.setItem('userEmail', result.user.email || '');

        setMessageType('success');
        setMessage('✅ Sign in successful! Redirecting...');

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      setMessageType('error');
      const errorMessage = error?.message || 'Sign in failed. Please try again.';
      setMessage(`❌ ${errorMessage}`);
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          mail
        </span>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-input-light dark:bg-input-dark border-none rounded-lg focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Password Field */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          lock
        </span>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-input-light dark:bg-input-dark border-none rounded-lg focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full font-bold py-3 px-5 rounded-lg !mt-6"
        size="lg"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Don't have an account?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}

