/**
 * Supabase Edge Function: Listen for Slack Messages
 *
 * Receives Slack Events API webhooks and pushes messages to mobile via Supabase Realtime.
 *
 * @endpoint POST /listenForSlackMessages
 * @description Handles incoming Slack messages and broadcasts them to the mobile app
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { WebClient } from 'npm:@slack/web-api@6.12.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlackMessagePayload {
  sender: string;
  text: string;
  channel: string;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const slackBotToken = Deno.env.get('SLACK_BOT_TOKEN');
    const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!slackBotToken || !supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize clients
    const slack = new WebClient(slackBotToken);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();

    // Handle Slack URL verification challenge
    if (body.type === 'url_verification') {
      console.log('🔐 Slack URL verification challenge received');
      return new Response(
        JSON.stringify({ challenge: body.challenge }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle message events
    if (body.event && body.event.type === 'message') {
      const event = body.event;

      // Filter out bot messages and message edits
      if (event.bot_id || event.subtype === 'message_changed') {
        console.log('⏭️ Skipping bot message or edit');
        return new Response(
          JSON.stringify({ success: true, skipped: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { user, text, channel, ts } = event;

      // Fetch sender's real name
      let senderName = 'Unknown User';
      try {
        const userInfo = await slack.users.info({ user });
        senderName = userInfo.user?.real_name || userInfo.user?.name || 'Unknown User';
        console.log(`📩 New Slack message from ${senderName}: ${text}`);
      } catch (error) {
        console.error(`⚠️ Failed to fetch user info for ${user}:`, error);
      }

      // Prepare message payload
      const messagePayload: SlackMessagePayload = {
        sender: senderName,
        text: text || '',
        channel,
        timestamp: ts,
      };

      // Broadcast to Supabase Realtime channel
      const channel_name = supabase.channel('slack_messages');

      await channel_name.send({
        type: 'broadcast',
        event: 'new_message',
        payload: messagePayload,
      });

      console.log(`✅ Message broadcasted to mobile app: ${senderName} - ${text}`);

      // Optionally store in database for history
      const { error: dbError } = await supabase
        .from('slack_messages')
        .insert({
          sender: senderName,
          text: text || '',
          channel,
          timestamp: ts,
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error('⚠️ Failed to store message in database:', dbError);
        // Don't fail the request if DB insert fails
      }

      return new Response(
        JSON.stringify({ success: true, sender: senderName }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle other event types
    console.log('⏭️ Unhandled event type:', body.event?.type);
    return new Response(
      JSON.stringify({ success: true, message: 'Event received but not processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error handling Slack event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});