'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useLara } from '@/hooks/useLara';

interface VoiceCommandButtonProps {
  className?: string;
  userId?: string;
}

/**
 * Voice Command Button Component
 * Lara Voice Assistant with wake word detection
 * This is a CLIENT component that handles the complete Lara flow:
 * Wake word "Hey Lara" → Greeting → Listen for command → Parse intent → Execute action → Confirmation
 */
export function VoiceCommandButton({
  className = '',
  userId: userIdProp,
}: VoiceCommandButtonProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [userId, setUserId] = useState<string | undefined>(userIdProp);
  const autoStartedRef = useRef(false);

  // Get user ID from localStorage on mount if not provided
  useEffect(() => {
    if (!userId) {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, [userId]);

  // Use Lara Assistant hook
  const { isRunning, error, start, stop } = useLara({
    userId: userId || 'default-user',
    onError: (err) => {
      console.error('❌ Lara Error:', err);
      setFeedbackMessage(`Error: ${err.message}`);
      setFeedbackType('error');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    },
  });

  // DO NOT auto-start Lara - user must click the button
  // This useEffect is intentionally empty to prevent auto-start
  useEffect(() => {
    // Lara should only start when user clicks the microphone button
    // Not on component mount
  }, []);

  // Handle button toggle
  const handleToggle = () => {
    if (isRunning) {
      console.log('🎤 Stopping Lara');
      stop();
    } else {
      console.log('🎤 Starting Lara');
      start();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={handleToggle}
        size="icon"
        className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transform transition-all duration-300 ${
          isRunning
            ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
            : 'bg-primary hover:bg-primary/90 hover:scale-110'
        } text-white`}
        title={isRunning ? 'Stop listening' : 'Start voice command'}
      >
        <span className="material-symbols-outlined text-4xl">
          {isRunning ? 'mic' : 'mic_none'}
        </span>
      </Button>

      {isRunning && (
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-pulse" />
      )}

      {(isRunning || showFeedback) && (
        <div className="absolute bottom-20 right-0 bg-card-light dark:bg-card-dark rounded-lg p-4 shadow-lg border border-white/30 dark:border-white/10 frosted-glass max-w-xs w-80 z-50">
          {isRunning && !error && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <p className="text-sm text-subtle-light dark:text-subtle-dark">
                Listening for "Hey Lara"...
              </p>
            </div>
          )}

          {showFeedback && (
            <div
              className={`p-3 rounded-lg ${
                feedbackType === 'success'
                  ? 'bg-green-500/10 border border-green-500/30'
                  : feedbackType === 'error'
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-blue-500/10 border border-blue-500/30'
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`material-symbols-outlined text-lg flex-shrink-0 ${
                    feedbackType === 'success'
                      ? 'text-green-500'
                      : feedbackType === 'error'
                        ? 'text-red-500'
                        : 'text-blue-500'
                  }`}
                >
                  {feedbackType === 'success'
                    ? 'check_circle'
                    : feedbackType === 'error'
                      ? 'error'
                      : 'info'}
                </span>
                <p
                  className={`text-sm ${
                    feedbackType === 'success'
                      ? 'text-green-700 dark:text-green-300'
                      : feedbackType === 'error'
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {feedbackMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

