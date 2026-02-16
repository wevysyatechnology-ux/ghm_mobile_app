// Backend Setup Guide: Securing OpenAI API Calls

This guide explains how to set up secure backend proxies for OpenAI API calls that protect your API keys.

## Overview

The mobile app client-side code now calls these backend endpoints instead of directly calling OpenAI:
- `POST /rest/v1/functions/embeddings` - Generate embeddings
- `POST /rest/v1/functions/transcribe` - Transcribe audio

These are Supabase Edge Functions that securely proxy OpenAI API calls using a server-side API key.

## Setup Instructions

### 1. Environment Variables

Add your OpenAI API key as a Supabase secret:

```bash
supabase secrets set OPENAI_API_KEY "sk-...your-key..."
```

### 2. Deploy Edge Functions

Deploy the edge functions:

```bash
# Deploy embeddings function
supabase functions deploy embeddings

# Deploy transcribe function
supabase functions deploy transcribe
```

Verify deployment:
```bash
supabase functions list
```

### 3. Update Client Configuration

The client code is already configured to call these endpoints. They use the pattern:
- Local development: `http://localhost:54321/functions/v1/{function_name}`
- Production: `https://{project_id}.supabase.co/functions/v1/{function_name}`

The endpoints are called from:
- `services/knowledgeService.ts` - POST `/api/embeddings`
- `services/voiceOSService.ts` - POST `/api/transcribe`

### 4. Update Fetch Calls

If you need to route to Supabase functions instead of `/api/*` endpoints, update the fetch URLs:

**For local development (Supabase local setup):**
```typescript
const response = await fetch('http://localhost:54321/functions/v1/embeddings', {
  // ... request options
});
```

**For production:**
```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL; // e.g., https://xxx.supabase.co
const functionUrl = `${supabaseUrl}/functions/v1/embeddings`;
const response = await fetch(functionUrl, {
  // ... request options
});
```

### 5. Security Best Practices

✅ **What we're doing right:**
- API key is stored server-side (in Supabase secrets)
- Client only sends data, not credentials
- Edge functions validate all inputs
- Error messages don't expose sensitive info

🔒 **Additional improvements (optional):**
- Add rate limiting: Supabase offers built-in rate limiting
- Add authentication: Require user JWT token in requests
- Add session tracking: Log embeddings/transcriptions for billing
- Add request validation: Stricter input sanitization

### 6. Testing

Test the embeddings function:
```bash
curl -X POST http://localhost:54321/functions/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'
```

Test the transcribe function:
```bash
curl -X POST http://localhost:54321/functions/v1/transcribe \
  -F "file=@audio.m4a" \
  -F "language=en"
```

### 7. Updating Routes in Client Code

Current client code calls:
- `/api/embeddings` 
- `/api/transcribe`

If using Supabase functions, update these URLs to match your deployment:

**In `services/knowledgeService.ts`:**
```typescript
// Change from:
const response = await fetch('/api/embeddings', {

// To:
const response = await fetch(`${SUPABASE_URL}/functions/v1/embeddings`, {
```

**In `services/voiceOSService.ts`:**
```typescript
// Change from:
const response = await fetch('/api/transcribe', {

// To:
const response = await fetch(`${SUPABASE_URL}/functions/v1/transcribe`, {
```

### 8. Alternative: Express Backend

If you prefer a traditional Node.js backend instead of Supabase:

```typescript
// Express route example
app.post('/api/embeddings', async (req, res) => {
  const { text } = req.body;
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Server-side only!
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });
  // ... handle response
});
```

## Troubleshooting

**401 Unauthorized**
- Check that OPENAI_API_KEY is set correctly in Supabase secrets
- Verify the API key is valid

**404 Not Found**
- Ensure functions are deployed: `supabase functions list`
- Check the function name matches the endpoint URL

**Connection Refused**
- For local development, ensure Supabase local is running: `supabase start`
- Check the localhost:54321 port is accessible

**CORS Issues**
- Edge functions handle CORS automatically
- If using Express backend, add CORS middleware

## Security Considerations

1. **Never expose OPENAI_API_KEY in client code** ✅ Fixed
2. **Always validate/sanitize user input** ✅ Both functions validate
3. **Implement rate limiting** ⏳ Consider adding
4. **Monitor API usage** ⏳ Check OpenAI dashboard regularly
5. **Use HTTPS only** ✅ Supabase enforces this

