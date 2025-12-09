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
  const [isProcessingTask, setIsProcessingTask] = useState(false);
  const [commandCompleted, setCommandCompleted] = useState(false);
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
    oneShot: true, // Enable one-shot mode
    onError: (err) => {
      console.error('❌ Lara Error:', err);
      setFeedbackMessage(`Error: ${err.message}`);
      setFeedbackType('error');
      setShowFeedback(true);
      setIsProcessingTask(false);
      setTimeout(() => setShowFeedback(false), 3000);
    },
    onTaskStatusChange: (status, message) => {
      setIsProcessingTask(status === 'processing');
      if (status === 'completed') {
        setCommandCompleted(true);
        setFeedbackMessage(message || 'Task added successfully!');
        setFeedbackType('success');
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2000);
      } else if (status === 'error') {
        setFeedbackMessage(message || 'Failed to add task');
        setFeedbackType('error');
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 3000);
      }
    },
    onListeningStateChange: (state) => {
      console.log('🎤 Listening state changed to:', state);
      if (state === 'wake-word') {
        setCommandCompleted(false);
        setFeedbackMessage('Listening for "Hey Lara"...');
        setFeedbackType('info');
        setShowFeedback(true);
      } else if (state === 'command') {
        setCommandCompleted(false);
        setFeedbackMessage('Wake word detected! Listening for command...');
        setFeedbackType('info');
        setShowFeedback(true);
      } else if (state === 'processing') {
        setFeedbackMessage('Processing your command...');
        setFeedbackType('info');
        setShowFeedback(true);
      } else if (state === 'idle') {
        setShowFeedback(false);
      }
    },
  });

  // DO NOT auto-start Lara - user must click the button
  // This useEffect is intentionally empty to prevent auto-start
  useEffect(() => {
    // Lara should only start when user clicks the microphone button
    // Not on component mount
  }, []);

  // Handle page visibility changes - restart assistant if it was running
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning) {
        // Page became visible and assistant was running
        console.log('📱 Page became visible, restarting assistant...');
        // Stop and restart to reset state
        stop();
        setTimeout(() => {
          start();
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, start, stop]);

  // Auto-stop after one command completes (one-shot mode)
  useEffect(() => {
    if (isRunning && commandCompleted && isProcessingTask === false && feedbackType === 'success' && showFeedback) {
      const timer = setTimeout(() => {
        console.log('🛑 One-shot mode: stopping after command');
        stop();
      }, 500); // Reduced from 2000ms to 500ms
      return () => clearTimeout(timer);
    }
  }, [isRunning, commandCompleted, isProcessingTask, feedbackType, showFeedback, stop]);
  // Handle button toggle
  const handleToggle = () => {
    if (isRunning) {
      console.log('🎤 FORCE STOP: User clicked button to stop');

      // Show immediate feedback that we're stopping
      const stopMessage = isProcessingTask ? 'Stopping task processing...' : 'Stopping...';
      setFeedbackMessage(stopMessage);
      setFeedbackType('info');
      setShowFeedback(true);

      // Force stop immediately
      setIsProcessingTask(false);

      // Cancel any ongoing speech FIRST
      if (window.speechSynthesis) {
        try {
          console.log('🎤 FORCE STOP: Canceling speech synthesis');
          window.speechSynthesis.cancel();
        } catch (error) {
          console.warn('⚠️ Error canceling speech synthesis:', error);
        }
      }

      // Try to abort any active recognition
      try {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.abort();
        console.log('🎤 FORCE STOP: Aborted recognition instance');
      } catch (error) {
        console.warn('⚠️ Error aborting recognition:', error);
      }

      // Call stop hook
      console.log('🎤 FORCE STOP: Calling stop hook');
      stop();

      // Keep feedback visible longer so user sees the stop message
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
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
        disabled={false} // Remove disabled state so button always works
        className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transform transition-all duration-300 ${
          isProcessingTask
            ? 'bg-yellow-500 hover:bg-yellow-600 scale-110 animate-pulse'
            : isRunning
            ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
            : 'bg-primary hover:bg-primary/90 hover:scale-110'
        } text-white`}
        title={
          isProcessingTask
            ? 'Click to stop processing'
            : isRunning
            ? 'Stop listening'
            : 'Start voice command'
        }
      >
        <span className="material-symbols-outlined text-4xl">
          {isProcessingTask ? 'hourglass_empty' : isRunning ? 'mic' : 'mic_none'}
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






