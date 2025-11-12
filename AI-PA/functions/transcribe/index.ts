import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export async function transcribe(req: Request): Promise<Response> {
  try {
    const { audio } = await req.json();

    if (!audio) {
      return new Response(JSON.stringify({ error: 'Missing audio data' }), { status: 400 });
    }

    // Call Whisper API for transcription
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audio }),
    });

    if (!whisperResponse.ok) {
      console.error('Error calling Whisper API:', await whisperResponse.text());
      return new Response(JSON.stringify({ error: 'Failed to transcribe audio' }), { status: 500 });
    }

    const transcription = await whisperResponse.json();

    // Store transcription in Supabase
    const { error } = await supabase.from('assistant_memory').insert({
      message: transcription.text,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error storing transcription in Supabase:', error);
      return new Response(JSON.stringify({ error: 'Failed to store transcription' }), { status: 500 });
    }

    return new Response(JSON.stringify({ transcription: transcription.text }), { status: 200 });
  } catch (error) {
    console.error('Error handling transcription request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}