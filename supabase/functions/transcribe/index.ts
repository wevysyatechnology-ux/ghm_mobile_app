// Supabase Edge Function for secure OpenAI Whisper transcription
// Deploy with: supabase functions deploy transcribe
// Environment variables needed: OPENAI_API_KEY

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

if (!openaiApiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
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
    return new Response('ok', {
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
    // Get multipart form data
    const formData = await req.formData();
    const audioFile = formData.get('file');
    const language = (formData.get('language') || 'en') as string;

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: file field is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Validate language (basic validation)
    if (language.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid language parameter' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create new FormData for OpenAI API
    const openaiFormData = new FormData();
    
    // The audioFile is already a File/Blob from the client
    openaiFormData.append('file', audioFile, 'audio.m4a');
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('language', language);

    // Call OpenAI Whisper API
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: openaiFormData,
    });

    if (!openaiResponse.ok) {
      let errorMessage = `OpenAI API error: ${openaiResponse.status}`;
      
      try {
        const errorData = await openaiResponse.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        try {
          const errorText = await openaiResponse.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // Use default message
        }
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: openaiResponse.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const data = await openaiResponse.json();

    // Return transcription
    return new Response(
      JSON.stringify({
        text: data.text,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Transcribe function error:', error);
    
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
