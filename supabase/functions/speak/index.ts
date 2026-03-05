// Supabase Edge Function for secure Deepgram Text-to-Speech (Aura)
// Deploy with: supabase functions deploy speak
// Environment variables needed: DEEPGRAM_API_KEY

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY');

if (!deepgramApiKey) {
  throw new Error('Missing DEEPGRAM_API_KEY environment variable');
}

// CORS headers for browser clients
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    const { text, model = 'aura-asteria-en' } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: text field is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Call Deepgram Aura Text-to-Speech API
    const deepgramResponse = await fetch(`https://api.deepgram.com/v1/speak?model=${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text();
      let errorMessage = `Deepgram TTS API error: ${deepgramResponse.status} - ${errorText}`;

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: deepgramResponse.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Stream the audio blob back to the client
    const audioBlob = await deepgramResponse.blob();

    return new Response(audioBlob, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="response.mp3"'
      },
    });
  } catch (error) {
    console.error('Speak function error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
