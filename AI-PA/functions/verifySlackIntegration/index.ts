/**
 * Supabase Edge Function: Verify Slack Integration
 *
 * Verifies the Slack Bot Token connection and returns workspace information.
 *
 * @endpoint POST /verifySlackIntegration
 * @returns {ok: boolean, team: string, user_id: string, bot_user: string, error?: string}
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { WebClient } from 'npm:@slack/web-api@6.12.0';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlackAuthResponse {
  ok: boolean;
  team?: string;
  user_id?: string;
  bot_user?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Slack Bot Token from environment variables
    const slackBotToken = Deno.env.get('SLACK_BOT_TOKEN');

    if (!slackBotToken) {
      console.error('❌ SLACK_BOT_TOKEN not found in environment variables');
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'SLACK_BOT_TOKEN not configured in environment variables',
        } as SlackAuthResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Slack Web API client
    const slack = new WebClient(slackBotToken);

    console.log('🔍 Verifying Slack connection...');

    // Call auth.test to verify the token
    const authResult = await slack.auth.test();

    if (!authResult.ok) {
      console.error('❌ Slack connection failed:', authResult.error);
      return new Response(
        JSON.stringify({
          ok: false,
          error: authResult.error || 'Unknown authentication error',
        } as SlackAuthResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract workspace and bot information
    const team = authResult.team as string;
    const userId = authResult.user_id as string;
    const botUser = authResult.user as string;

    console.log(`✅ Slack connected as ${botUser} in workspace ${team}`);
    console.log(`📋 Bot User ID: ${userId}`);

    // Return success response
    const response: SlackAuthResponse = {
      ok: true,
      team,
      user_id: userId,
      bot_user: botUser,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Slack connection failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({
        ok: false,
        error: errorMessage,
      } as SlackAuthResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});