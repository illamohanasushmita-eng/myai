/**
 * useBillingReminders Hook
 * Real-time billing reminders with voice notifications
 *
 * Subscribes to Supabase Realtime channel for billing reminders
 * and triggers voice notifications when bills are due.
 *
 * Usage:
 * const { reminders, isConnected } = useBillingReminders({ userId, enabled: true });
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

interface BillingReminderNotification {
  bill_id: string;
  bill_name: string;
  amount: number;
  currency: string;
  due_date: string;
  days_until_due: number;
  urgency_level: 'overdue' | 'urgent' | 'soon' | 'upcoming';
}

interface BillingReminderPayload {
  timestamp: string;
  bills: BillingReminderNotification[];
  total_bills: number;
  total_amount: number;
}

export interface UseBillingRemindersOptions {
  userId: string;
  enabled?: boolean;
  onReminder?: (payload: BillingReminderPayload) => void;
}

export interface UseBillingRemindersReturn {
  reminders: BillingReminderPayload | null;
  isConnected: boolean;
  error: string | null;
}

export function useBillingReminders(
  options: UseBillingRemindersOptions
): UseBillingRemindersReturn {
  const { userId, enabled = true, onReminder } = options;

  const [reminders, setReminders] = useState<BillingReminderPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const hasSpokenRef = useRef<Set<string>>(new Set());

  // Speak reminder using Web Speech API
  const speakReminder = useCallback((payload: BillingReminderPayload) => {
    if (!('speechSynthesis' in window)) {
      console.warn('⚠️ Speech synthesis not supported');
      return;
    }

    // Create a unique key for this reminder batch
    const reminderKey = `${payload.timestamp}-${payload.total_bills}`;

    // Don't speak if we've already spoken this batch
    if (hasSpokenRef.current.has(reminderKey)) {
      console.log('⏭️ Already spoke this reminder batch, skipping');
      return;
    }

    hasSpokenRef.current.add(reminderKey);

    // Build the message
    let message = '';

    if (payload.total_bills === 1) {
      const bill = payload.bills[0];
      const currencySymbol = bill.currency === 'INR' ? 'rupees' : bill.currency;

      if (bill.urgency_level === 'overdue') {
        message = `Hey! Your ${bill.bill_name} of ${bill.amount} ${currencySymbol} is overdue by ${Math.abs(bill.days_until_due)} days. Please pay it as soon as possible.`;
      } else if (bill.urgency_level === 'urgent') {
        message = `Reminder: Your ${bill.bill_name} of ${bill.amount} ${currencySymbol} is due in ${bill.days_until_due} days.`;
      } else {
        message = `Just a heads up, your ${bill.bill_name} of ${bill.amount} ${currencySymbol} is due in ${bill.days_until_due} days.`;
      }
    } else {
      // Multiple bills
      const overdueCount = payload.bills.filter((b) => b.urgency_level === 'overdue').length;
      const urgentCount = payload.bills.filter((b) => b.urgency_level === 'urgent').length;

      if (overdueCount > 0) {
        message = `You have ${overdueCount} overdue bill${overdueCount > 1 ? 's' : ''} and ${payload.total_bills - overdueCount} upcoming bill${payload.total_bills - overdueCount > 1 ? 's' : ''}. Total amount: ${payload.total_amount} rupees. Please check your billing page.`;
      } else if (urgentCount > 0) {
        message = `You have ${urgentCount} bill${urgentCount > 1 ? 's' : ''} due within 3 days. Total amount: ${payload.total_amount} rupees.`;
      } else {
        message = `You have ${payload.total_bills} upcoming bills. Total amount: ${payload.total_amount} rupees.`;
      }
    }

    console.log('🔔 Speaking billing reminder:', message);

    // Speak the message
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Use a pleasant voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes('Google') ||
        voice.name.includes('Female') ||
        voice.name.includes('Samantha')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (!enabled || !userId) {
      console.log('🔕 Billing reminders disabled or no userId');
      return;
    }

    console.log('🔔 Setting up billing reminders for user:', userId);

    // Create channel for this user's billing reminders
    const channel = supabase.channel(`billing_reminders:${userId}`);

    // Subscribe to broadcast events
    channel
      .on('broadcast', { event: 'billing_reminder' }, (payload) => {
        console.log('🔔 Received billing reminder:', payload);

        const reminderPayload = payload.payload as BillingReminderPayload;
        setReminders(reminderPayload);

        // Speak the reminder
        speakReminder(reminderPayload);

        // Call custom callback if provided
        if (onReminder) {
          onReminder(reminderPayload);
        }
      })
      .subscribe((status) => {
        console.log('🔔 Billing reminders channel status:', status);

        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
          console.log('✅ Successfully subscribed to billing reminders');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError('Failed to connect to billing reminders channel');
          console.error('❌ Error subscribing to billing reminders');
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          setError('Connection to billing reminders timed out');
          console.error('⏱️ Billing reminders subscription timed out');
        } else if (status === 'CLOSED') {
          setIsConnected(false);
          console.log('🔌 Billing reminders channel closed');
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up billing reminders subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [userId, enabled, speakReminder, onReminder]);

  // Load voices when component mounts (for Web Speech API)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      window.speechSynthesis.getVoices();

      // Some browsers need this event to load voices
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  return {
    reminders,
    isConnected,
    error,
  };
}

