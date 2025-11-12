import { WebClient } from '@slack/web-api';

// Initialize Slack Web API client
const slackClient = new WebClient(Deno.env.get('SLACK_BOT_TOKEN'));

export async function sendSlackMessage(req: Request): Promise<Response> {
  try {
    const { channel, text } = await req.json();

    if (!channel || !text) {
      return new Response(JSON.stringify({ error: 'Missing channel or text' }), { status: 400 });
    }

    // Send message to Slack
    const result = await slackClient.chat.postMessage({
      channel,
      text,
    });

    return new Response(JSON.stringify({ success: true, result }), { status: 200 });
  } catch (error) {
    console.error('Error sending Slack message:', error);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), { status: 500 });
  }
}