# 🎤 OpenAI Whisper Voice Setup Guide

Your app already has OpenAI Whisper integration built in! Follow these steps to activate it.

## Prerequisites
- OpenAI API Key (you have this ✅)
- Supabase Project (already configured ✅)
- Supabase CLI installed

## Setup Steps

### 1. Add OpenAI API Key to Supabase

1. Go to your Supabase Dashboard: https://vlwppdpodavowfnyhtkh.supabase.co
2. Navigate to **Settings** → **Edge Functions** → **Manage secrets**
3. Click **"New secret"**
4. Add:
   - **Secret Name:** `OPENAI_API_KEY`
   - **Value:** `sk-your-actual-api-key-here`
5. Click **Save**

### 2. Install Supabase CLI (if not installed)

```bash
npm install -g supabase
```

### 3. Login to Supabase CLI

```bash
supabase login
```

### 4. Link Your Project

```bash
supabase link --project-ref vlwppdpodavowfnyhtkh
```

### 5. Deploy the Transcribe Function

```bash
supabase functions deploy transcribe
```

You should see:
```
Deploying transcribe (script)
...
Deployed function transcribe ✓
```

### 6. Test Your Voice Agent

The voice agent is already integrated in your app in these places:

1. **Voice Assistant Page** (`app/voice-assistant.tsx`)
   - Tap the microphone button
   - Say something like "Find a CA in Bangalore"
   - It will transcribe using Whisper and process your command

2. **Floating Voice Button** (on most screens)
   - Available via `FloatingVoiceButton` component
   - Tap to activate voice commands anywhere in the app

## How It Works

### Architecture Flow:
```
User speaks → Record Audio → Upload to Supabase Edge Function 
  → Calls OpenAI Whisper API → Returns Transcript 
  → AI processes command → Executes action → Speaks response
```

### Key Components:

1. **VoiceOSService** (`services/voiceOSService.ts`)
   - Handles recording and transcription
   - Integrates with OpenAI Whisper via Supabase function

2. **Transcribe Function** (`supabase/functions/transcribe/index.ts`)
   - Securely calls OpenAI Whisper API
   - Your API key never exposed to client

3. **Action Engine** (`services/actionEngine.ts`)
   - Processes voice commands
   - Executes actions (search members, create deals, etc.)

## Supported Voice Commands

- "Find a CA in Bangalore"
- "Post a deal"
- "Send a link request"
- "Create an i2we connection"
- "Show me lawyers in Mumbai"
- And more...

## Troubleshooting

### Transcription Fails
1. Check if OPENAI_API_KEY is set in Supabase secrets
2. Verify function is deployed: `supabase functions list`
3. Check function logs: `supabase functions logs transcribe`

### Cannot Record Audio
1. Grant microphone permissions in your device settings
2. For iOS: Add `NSMicrophoneUsageDescription` to Info.plist
3. For Android: Add `RECORD_AUDIO` permission to AndroidManifest.xml

### API Rate Limits
- OpenAI Whisper has rate limits based on your plan
- Consider implementing caching or queuing for high usage

## Cost Considerations

OpenAI Whisper API pricing (as of 2024):
- $0.006 per minute of audio
- Average voice command: 5-10 seconds = $0.0005 - $0.001 per command

Example: 1000 voice commands ≈ $0.50 - $1.00

## Next Steps

1. ✅ Set up API key in Supabase
2. ✅ Deploy transcribe function
3. 🎤 Test voice commands in the app
4. 📊 Monitor usage in OpenAI dashboard
5. 🎨 Customize voice responses in `voiceOSService.ts`

## Advanced Configuration

### Change Voice Language
Edit `supabase/functions/transcribe/index.ts`:
```typescript
const language = (formData.get('language') || 'hi') as string; // Change to Hindi
```

### Add Text-to-Speech (TTS)
OpenAI also offers TTS API. You can integrate it by:
1. Creating a new Supabase function for TTS
2. Calling it from `voiceOSService.speak()` method

### Customize Wake Word
Modify `voiceOSService.ts` to detect custom wake words like "Hey WeVysya"

## Resources

- [OpenAI Whisper API Docs](https://platform.openai.com/docs/guides/speech-to-text)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Expo Audio Docs](https://docs.expo.dev/versions/latest/sdk/audio/)
