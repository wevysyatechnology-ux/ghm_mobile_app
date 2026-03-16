// Supabase Edge Function for Deepgram Text Intelligence
// Deploy with: supabase functions deploy analyze-text
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
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: text field is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Call Deepgram Intelligence API for Intents and Sentiment
    const deepgramResponse = await fetch('https://api.deepgram.com/v1/read?intents=true&sentiment=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text();
      let errorMessage = `Deepgram Intelligence API error: ${deepgramResponse.status} - ${errorText}`;

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: deepgramResponse.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const data = await deepgramResponse.json();

    // Extract intents and sentiment from Deepgram response
    // Response shape usually: data.results.intents[0].segments[0].intents
    const intents = data.results?.intents?.[0]?.segments?.[0]?.intents || [];
    const sentimentResult = data.results?.sentiments?.[0]?.segments?.[0] || { sentiment: 'neutral', sentiment_score: 0 };

    return new Response(JSON.stringify({
      intents,
      sentiment: sentimentResult.sentiment,
      sentiment_score: sentimentResult.sentiment_score
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
    });
  } catch (error) {
    console.error('analyze-text function error:', error);

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
