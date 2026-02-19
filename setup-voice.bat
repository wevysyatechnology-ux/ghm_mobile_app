@echo off
echo ================================================
echo Supabase Voice Agent Setup Script
echo ================================================
echo.

REM Check if access token is provided
if "%1"=="" (
    echo ERROR: Please provide your Supabase access token
    echo.
    echo Usage: setup-voice.bat YOUR_ACCESS_TOKEN
    echo.
    echo Get your token from:
    echo https://vlwppdpodavowfnyhtkh.supabase.co/project/vlwppdpodavowfnyhtkh/settings/api
    echo Scroll to "Access Tokens" and click "Generate new token"
    echo.
    exit /b 1
)

echo Setting up environment...
set SUPABASE_ACCESS_TOKEN=%1

echo.
echo Linking to Supabase project...
npx supabase link --project-ref vlwppdpodavowfnyhtkh

echo.
echo Deploying transcribe function...
npx supabase functions deploy transcribe --project-ref vlwppdpodavowfnyhtkh

echo.
echo ✅ Deployment complete!
echo.
echo ================================================
echo NEXT STEPS:
echo ================================================
echo 1. Add OpenAI API Key secret:
echo    - Go to: https://vlwppdpodavowfnyhtkh.supabase.co
echo    - Settings ^> Edge Functions ^> Secrets
echo    - Click "Add a new secret"
echo    - Name: OPENAI_API_KEY
echo    - Value: sk-proj-nTCZ... (from your .env file)
echo.
echo 2. Test in your app:
echo    - Open the app
echo    - Go to Voice Assistant
echo    - Tap the microphone button
echo    - Say something like "Find a CA in Bangalore"
echo.
echo 3. Run test: node test-transcribe.js
echo ================================================
