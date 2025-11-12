import { WebClient } from '@slack/web-api';
import { createClient } from '@supabase/supabase-js';

// Initialize Slack Web API client
const slackClient = new WebClient(Deno.env.get('SLACK_BOT_TOKEN'));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

export async function slackHandler(req: Request): Promise<Response> {
  try {
    const body = await req.json();

    // Verify Slack event type
    if (body.type === 'url_verification') {
      return new Response(JSON.stringify({ challenge: body.challenge }), { status: 200 });
    }

    if (body.event && body.event.type === 'message' && !body.event.bot_id) {
      const { user, text, channel } = body.event;

      // Store message in Supabase
      const { error } = await supabase.from('slack_messages').insert({
        sender: user,
        text,
        channel,
      });

      if (error) {
        console.error('Error storing Slack message in Supabase:', error);
        return new Response(JSON.stringify({ error: 'Failed to store message' }), { status: 500 });
      }

      // Call OpenAI TTS to speak the message
      const ttsResponse = await fetch(Deno.env.get('TTS_API_URL')!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `New message from ${user}: ${text}` }),
      });

      if (!ttsResponse.ok) {
        console.error('Error calling TTS API:', await ttsResponse.text());
        return new Response(JSON.stringify({ error: 'Failed to call TTS API' }), { status: 500 });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Invalid event type' }), { status: 400 });
  } catch (error) {
    console.error('Error handling Slack event:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}