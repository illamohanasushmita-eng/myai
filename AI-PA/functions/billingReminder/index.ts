/**
 * Supabase Edge Function: Billing Reminder
 *
 * Runs daily via cron job to check for upcoming bills and send voice reminders.
 *
 * @endpoint POST /billingReminder
 * @cron 0 9 * * * (Daily at 9 AM)
 * @description Checks for bills due within reminder window and broadcasts to users via Realtime
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BillingReminder {
  id: string;
  user_id: string;
  bill_name: string;
  category: string;
  amount: number;
  currency: string;
  due_date: string;
  frequency: string;
  status: string;
  reminder_days: number;
  reminder_enabled: boolean;
  last_notified_at: string | null;
}

interface ReminderNotification {
  bill_id: string;
  bill_name: string;
  amount: number;
  currency: string;
  due_date: string;
  days_until_due: number;
  urgency_level: 'overdue' | 'urgent' | 'soon' | 'upcoming';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔔 Billing Reminder Edge Function started');

    const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    console.log(`📅 Checking bills for date: ${todayStr}`);

    // Query bills that need reminders
    // 1. Status is 'pending' or 'overdue'
    // 2. Reminder is enabled
    // 3. Due date is within the reminder window
    // 4. Not notified today (or never notified)
    const { data: bills, error: queryError } = await supabase
      .from('billing_reminders')
      .select('*')
      .in('status', ['pending', 'overdue'])
      .eq('reminder_enabled', true)
      .or(`last_notified_at.is.null,last_notified_at.lt.${todayStr}`);

    if (queryError) {
      console.error('❌ Error querying bills:', queryError);
      return new Response(
        JSON.stringify({ error: 'Failed to query bills', details: queryError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${bills?.length || 0} bills with reminders enabled`);

    if (!bills || bills.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No bills need reminders today', count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter bills that are within their reminder window
    const billsToNotify: BillingReminder[] = [];
    const notifications: Map<string, ReminderNotification[]> = new Map();

    for (const bill of bills) {
      const dueDate = new Date(bill.due_date);
      const diffTime = dueDate.getTime() - today.getTime();
      const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Check if bill is within reminder window
      if (daysUntilDue <= bill.reminder_days) {
        billsToNotify.push(bill);

        // Determine urgency level
        let urgencyLevel: 'overdue' | 'urgent' | 'soon' | 'upcoming';
        if (daysUntilDue < 0) {
          urgencyLevel = 'overdue';
        } else if (daysUntilDue <= 3) {
          urgencyLevel = 'urgent';
        } else if (daysUntilDue <= 7) {
          urgencyLevel = 'soon';
        } else {
          urgencyLevel = 'upcoming';
        }

        // Group notifications by user
        const userNotifications = notifications.get(bill.user_id) || [];
        userNotifications.push({
          bill_id: bill.id,
          bill_name: bill.bill_name,
          amount: bill.amount,
          currency: bill.currency,
          due_date: bill.due_date,
          days_until_due: daysUntilDue,
          urgency_level: urgencyLevel,
        });
        notifications.set(bill.user_id, userNotifications);

        console.log(
          `🔔 Bill "${bill.bill_name}" for user ${bill.user_id}: ${daysUntilDue} days until due (${urgencyLevel})`
        );
      }
    }

    console.log(`📢 Sending reminders for ${billsToNotify.length} bills to ${notifications.size} users`);

    // Send notifications via Supabase Realtime
    let notificationsSent = 0;
    for (const [userId, userBills] of notifications.entries()) {
      try {
        // Broadcast to user's billing channel
        const channel = supabase.channel(`billing_reminders:${userId}`);

        await channel.send({
          type: 'broadcast',
          event: 'billing_reminder',
          payload: {
            timestamp: new Date().toISOString(),
            bills: userBills,
            total_bills: userBills.length,
            total_amount: userBills.reduce((sum, b) => sum + b.amount, 0),
          },
        });

        console.log(`✅ Sent ${userBills.length} bill reminders to user ${userId}`);
        notificationsSent++;
      } catch (broadcastError) {
        console.error(`❌ Error broadcasting to user ${userId}:`, broadcastError);
      }
    }

    // Update last_notified_at for all notified bills
    const billIds = billsToNotify.map((b) => b.id);
    if (billIds.length > 0) {
      const { error: updateError } = await supabase
        .from('billing_reminders')
        .update({ last_notified_at: todayStr })
        .in('id', billIds);

      if (updateError) {
        console.error('❌ Error updating last_notified_at:', updateError);
      } else {
        console.log(`✅ Updated last_notified_at for ${billIds.length} bills`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Billing reminders sent successfully',
        stats: {
          total_bills_checked: bills.length,
          bills_notified: billsToNotify.length,
          users_notified: notificationsSent,
          notifications_sent: Array.from(notifications.values()).flat().length,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Unexpected error in billing reminder function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

