# Deploy classify-intent Edge Function

## Quick Deploy via Supabase Dashboard

**Status**: ⚠️ Function code ready, needs deployment

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/vlwppdpodavowfnyhtkh/functions
   - (Your project ID: `vlwppdpodavowfnyhtkh`)

2. **Create New Function**
   - Click "Deploy a new function"
   - Select "Via Editor" (not CLI)

3. **Configure Function**
   - **Name**: `classify-intent`
   - **HTTP Method**: Allow all methods (handles OPTIONS, POST)
   - **Code**: Copy entire contents from `supabase/functions/classify-intent/index.ts`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (~30 seconds)

5. **Verify Deployment**
   ```bash
   node test-classify-intent.js
   ```
   
   **Expected Output**:
   ```
   📡 Endpoint: https://vlwppdpodavowfnyhtkh.supabase.co/functions/v1/classify-intent
   📊 Response Status: 200
   ✅ SUCCESS! classify-intent function deployed
   {
     "type": "knowledge",
     "category": "general",
     "parameters": {},
     "response": "WeVysya is...",
     "confidence": 0.9
   }
   ```

## Environment Variables

The function requires `OPENAI_API_KEY` in Supabase secrets:
- ✅ Already configured in your project

## What This Function Does

- **Input**: User's voice query (text from Whisper)
- **Process**: 
  1. Sends query to OpenAI GPT-4
  2. Classifies as "knowledge" question or "action" command
  3. Extracts intent parameters (e.g., profession, location)
- **Output**: Structured intent object with type, category, parameters

## Critical for Voice OS

Without this function deployed, the Voice OS cannot:
- ❌ Distinguish knowledge questions from action commands
- ❌ Route queries correctly (RAG vs Action Engine)
- ❌ Extract structured parameters from voice commands

**This is the final 20% needed for complete Voice OS functionality.**

---

## Alternative: CLI Deployment (Advanced)

If you have Supabase CLI configured with access token:

```bash
# Login to Supabase
npx supabase login

# Link project
npx supabase link --project-ref vlwppdpodavowfnyhtkh

# Deploy function
npx supabase functions deploy classify-intent

# Test
node test-classify-intent.js
```

**Note**: Dashboard deployment is faster and already proven working with the `transcribe` function.
