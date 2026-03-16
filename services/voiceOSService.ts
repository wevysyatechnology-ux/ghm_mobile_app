import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { knowledgeService } from './knowledgeService';
import { actionEngine } from './actionEngine';
import { getTranscribeEndpoint, getSpeakEndpoint, getAnalyzeTextEndpoint, fetchWithErrorHandling } from '@/lib/apiConfig';

export interface VoiceCommand {
  transcript: string;
  intent: string;
  action?: any;
  response: string;
  shouldExecute: boolean;
}

/**
 * 🧠🎤 WeVysya Voice OS
 * Complete voice-activated AI assistant system
 */
class VoiceOSService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private isListening = false;
  private wakeWordActive = false;

  /**
   * 1️⃣ Wake Word Detection (Tap to Activate)
   * User taps mic → Listening mode activated
   */
  async activateWakeWord(): Promise<void> {
    this.wakeWordActive = true;
    console.log('🎤 Wake word mode activated: Listening for "Hey WeVysya"');
  }

  deactivateWakeWord(): void {
    this.wakeWordActive = false;
    console.log('🎤 Wake word mode deactivated');
  }

  /**
   * 2️⃣ Speech → Text (Deepgram)
   * Records audio and converts to text using Deepgram STT
   */
  async startRecording(): Promise<void> {
    try {
      // Check platform - audio recording has limited support on web
      if (Platform.OS === 'web') {
        console.warn('⚠️ Audio recording on web has limited support');
        // Continue anyway, but user should be aware
      }

      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Audio recording permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isListening = true;
      console.log('🎤 Recording started...');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecordingAndTranscribe(): Promise<string> {
    try {
      if (!this.recording) {
        throw new Error('No active recording');
      }

      console.log('🛑 Stopping recording...');
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isListening = false;
      this.recording = null;

      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Convert to text using Deepgram
      const transcript = await this.transcribeAudio(uri);
      console.log('📝 Transcript:', transcript);

      return transcript;
    } catch (error) {
      console.error('❌ Failed to transcribe:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio using backend proxy endpoint
   * The actual OpenAI Whisper API call is made server-side for security
   */
  private async transcribeAudio(audioUri: string): Promise<string> {
    try {
      console.log('🎙️ Preparing audio file for transcription...');

      // Create FormData for multipart upload
      const formData = new FormData();

      // For React Native, we need to use the URI-based format
      // The fetch API on React Native handles this specially
      const fileData: any = {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      };

      // On web, we need to convert to blob
      if (Platform.OS === 'web') {
        const response = await fetch(audioUri);
        const blob = await response.blob();
        formData.append('file', blob, 'audio.m4a');
      } else {
        // On mobile, use URI format
        formData.append('file', fileData as any);
      }

      formData.append('language', 'en');

      // Call backend proxy endpoint via Supabase Edge Function
      const endpoint = getTranscribeEndpoint();

      // Get Supabase anon key for authorization
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

      console.log('📡 Calling Deepgram transcribe endpoint...');
      const transcribeResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: formData,
      });

      if (!transcribeResponse.ok) {
        let errorMessage = 'Unknown error';

        // Try to parse JSON error first
        try {
          const errorData = await transcribeResponse.json();
          console.error('❌ Transcribe error response:', errorData);
          errorMessage = errorData.error?.message || errorData.error || errorData.message || 'Unknown error';
        } catch {
          // Fall back to text response
          try {
            const textError = await transcribeResponse.text();
            console.error('❌ Transcribe text error:', textError);
            errorMessage = textError || `HTTP ${transcribeResponse.status}`;
          } catch {
            errorMessage = `HTTP ${transcribeResponse.status}: Failed to transcribe`;
          }
        }

        throw new Error(`Deepgram transcription failed: ${errorMessage}`);
      }

      const data = await transcribeResponse.json();
      console.log('✅ Transcription successful:', data.text);
      return data.text;
    } catch (error) {
      console.error('❌ Deepgram transcription failed:', error);
      throw error;
    }
  }

  /**
   * 3️⃣ + 4️⃣ Knowledge Brain + Action Engine
   * Process the voice command through RAG and intent classification
   */
  async processCommand(transcript: string): Promise<VoiceCommand> {
    try {
      console.log('🧠 Processing command:', transcript);

      // Check if it's a wake word
      if (this.isWakeWord(transcript)) {
        return {
          transcript,
          intent: 'wake_word',
          response: 'Yes, I\'m listening. How can I help you?',
          shouldExecute: false,
        };
      }

      // Check local intent classification first for ultra-fast response
      let intent = actionEngine.fastLocalClassification(transcript);
      let relevantContext = '';

      // If local regex didn't catch it, hit the backend OpenAI
      if (!intent) {
        // Step 1: Classify bare intent to see if it even NEEDS a long RAG lookup
        // By passing empty context, we save the first DB hit if it's just an action
        intent = await actionEngine.classifyIntent(transcript, '');

        // If GPT says it's a knowledge query, THEN we do the slow RAG search
        if (intent.type === 'knowledge') {
          console.log('📚 Fetching RAG context for knowledge query...');
          relevantContext = await knowledgeService.searchKnowledge(transcript);
        }
      }

      console.log('🎯 Final Intent:', intent.type, intent.category);

      let response: string;

      if (intent.type === 'knowledge') {
        // Knowledge question - generate GPT response with context
        response = await this.generateKnowledgeResponse(transcript, relevantContext);
      } else {
        // Action command
        response = intent.response || 'I\'ll help you with that.';

        // --- LATENCY REDUCTION: EXECUTE DATA QUERIES IMMEDIATELY ---
        // If the action is a database query (e.g. how many members in my house),
        // we execute the query RIGHT NOW before we trigger the TTS, 
        // and we overwrite the generic "I'll do that" text with the actual DB result.
        if (intent.action?.name.startsWith('query_')) {
          try {
            console.log('⚡ Executing dynamic data query before speaking...');
            const result = await actionEngine.executeAction(intent);

            if (result && result.spokenResponse) {
              response = result.spokenResponse;
              console.log('🗣️ Overriding response with dynamically generated DB text:', response);
            }

            // Prevent it from trying to navigate or re-execute later since we just did it
            intent.action.name = 'resolved_query';
          } catch (e) {
            console.error('Data query execution failed:', e);
          }
        }
      }

      return {
        transcript,
        intent: intent.type,
        action: intent.action,
        response,
        shouldExecute: intent.type === 'action' && intent.action?.name !== 'resolved_query',
      };
    } catch (error) {
      console.error('❌ Command processing failed:', error);
      return {
        transcript,
        intent: 'error',
        response: 'I\'m sorry, I couldn\'t process that command. Please try again.',
        shouldExecute: false,
      };
    }
  }

  /**
   * Generate response using GPT with RAG context
   */
  private async generateKnowledgeResponse(query: string, context: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `You are WeVysya Assistant, a helpful AI for the WeVysya community network.
            
Context from knowledge base:
${context}

Answer questions based on this context. Be friendly, concise, and helpful.
If the context doesn't contain the answer, say so politely and suggest what you can help with.`,
            },
            {
              role: 'user',
              content: query,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`GPT API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content || 'I\'m not sure how to answer that.';
    } catch (error) {
      console.error('❌ GPT response generation failed:', error);
      throw error;
    }
  }

  /**
   * 5️⃣ Text → Speech
   * Speak the AI response using Deepgram Aura TTS via Edge Function
   */
  async speak(text: string): Promise<void> {
    try {
      console.log('🔊 Speaking:', text);

      // Stop any currently playing sound
      await this.stopSpeaking();

      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const endpoint = getSpeakEndpoint();
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, model: 'aura-asteria-en' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch TTS audio: ${response.status}`);
      }

      // Convert response stream to blob
      const audioBlob = await response.blob();

      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64data = reader.result as string;

            // Create and load the sound
            const { sound } = await Audio.Sound.createAsync(
              { uri: base64data },
              { shouldPlay: true }
            );

            this.sound = sound;

            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) {
                console.log('✅ Finished speaking');
                sound.unloadAsync();
                this.sound = null;
                resolve();
              }
            });

          } catch (error) {
            console.error('❌ Audio Playback failed:', error);
            reject(error);
          }
        };
        reader.onerror = (error) => {
          console.error('❌ FileReader error:', error);
          reject(error);
        };
        reader.readAsDataURL(audioBlob);
      });

    } catch (error) {
      console.error('❌ Text-to-speech failed:', error);
      throw error;
    }
  }

  async stopSpeaking(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.error('Error stopping speech:', error);
      }
    }
  }

  /**
   * 🎯 Complete Voice Flow
   * Full end-to-end voice interaction
   */
  async executeVoiceFlow(): Promise<VoiceCommand> {
    try {
      // Step 1: Record audio
      await this.startRecording();
      console.log('🎤 Listening... (Speak now)');

      // Wait for user to speak (in real implementation, use voice activity detection)
      // For now, caller controls when to stop

      return {
        transcript: '',
        intent: 'recording',
        response: 'Recording...',
        shouldExecute: false,
      };
    } catch (error) {
      console.error('❌ Voice flow failed:', error);
      throw error;
    }
  }

  /**
   * Check if transcript contains wake word
   */
  private isWakeWord(transcript: string): boolean {
    const wakeWords = ['hey wevysya', 'hi wevysya', 'hello wevysya', 'wevysya'];
    const lowerTranscript = transcript.toLowerCase().trim();
    return wakeWords.some(word => lowerTranscript.includes(word));
  }

  /**
   * Get listening status
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  isWakeWordActive(): boolean {
    return this.wakeWordActive;
  }
}

export const voiceOS = new VoiceOSService();
