// Supabase Edge Function for secure OpenAI Embedding API access
// Deploy with: supabase functions deploy embeddings
// Environment variables needed: OPENAI_API_KEY

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    // Parse request body
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

    // Sanitize input (basic protection against prompt injection)
    if (text.length > 8000) {
      return new Response(
        JSON.stringify({ error: 'Text too long (max 8000 characters)' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Call OpenAI Embeddings API
    const openaiResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      const errorMessage = `OpenAI API error: ${openaiResponse.status} - ${errorText}`;
      
      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: openaiResponse.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const data = await openaiResponse.json();
    
    // Defensive check for embedding response structure
    if (
      !data ||
      !Array.isArray(data.data) ||
      data.data.length === 0 ||
      typeof data.data[0].embedding === 'undefined'
    ) {
      console.error('Invalid OpenAI response structure:', data);
      return new Response(
        JSON.stringify({
          error: 'Invalid response from OpenAI: missing embedding data',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const embedding = data.data[0].embedding;

    // Return only the embedding (cleaner API response)
    return new Response(
      JSON.stringify({
        embedding,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Embeddings function error:', error);
    
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
