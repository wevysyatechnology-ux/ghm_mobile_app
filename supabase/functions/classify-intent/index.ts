// Supabase Edge Function for secure OpenAI intent classification
// Deploy with: supabase functions deploy classify-intent
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
    // Parse request body
    const { query, context = '' } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: query field is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Sanitize inputs
    if (query.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Query too long (max 2000 characters)' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (context && context.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Context too long (max 5000 characters)' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Call OpenAI to classify intent
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are WeVysya Assistant's intent classifier.

Analyze the user's query and determine if it's:
1. A KNOWLEDGE question (asking about WeVysya, members, houses, events, etc.)
2. An ACTION command (wants to perform a task)

Available actions:
- search_member: Find members by profession, industry, or location
- post_deal: Create a new business deal
- view_deals: Browse available deals
- send_link: Send a link request
- create_i2we: Create an i2we connection
- view_profile: View user profile
- view_channels: Browse channels
- view_activity: View recent activity

Context from knowledge base:
${context}

Respond with a JSON object:
{
  "type": "knowledge" or "action",
  "category": "for knowledge: members/houses/events/general, for action: the action name",
  "parameters": {},
  "response": "friendly response to user",
  "confidence": 0.0-1.0
}

Examples:
Query: "Find a CA in Bengaluru"
Response: {"type": "action", "category": "search_member", "parameters": {"profession": "CA", "location": "Bengaluru"}, "response": "I'll find CAs in Bengaluru for you!", "confidence": 0.95}

Query: "What is WeVysya?"
Response: {"type": "knowledge", "category": "general", "parameters": {}, "response": "Based on our knowledge base...", "confidence": 0.90}`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      let errorMessage = `OpenAI API error: ${openaiResponse.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = `${openaiResponse.status} - ${errorData.error.message}`;
        } else if (typeof errorData.error === 'string') {
          errorMessage = `${openaiResponse.status} - ${errorData.error}`;
        }
      } catch {
        if (errorText) {
          errorMessage = `${openaiResponse.status} - ${errorText}`;
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

    // Defensive check for response structure
    if (
      !data ||
      !Array.isArray(data.choices) ||
      data.choices.length === 0 ||
      !data.choices[0].message?.content
    ) {
      console.error('Invalid OpenAI response structure:', data);
      return new Response(
        JSON.stringify({
          error: 'Invalid response from OpenAI: missing message content',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Parse the JSON response from GPT
    const intentContent = data.choices[0].message.content;
    let intentData;

    try {
      intentData = JSON.parse(intentContent);
    } catch {
      console.error('Failed to parse JSON response:', intentContent);
      return new Response(
        JSON.stringify({
          error: 'Failed to parse intent classification response',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Return the classified intent
    return new Response(
      JSON.stringify({
        type: intentData.type || 'knowledge',
        category: intentData.category,
        parameters: intentData.parameters || {},
        response: intentData.response || 'I can help you with that.',
        confidence: intentData.confidence || 0.5,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Intent classification error:', error);

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
