import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { knowledgeService } from './knowledgeService';
import { actionEngine } from './actionEngine';

/**
 * NOTE: OpenAI API calls are made via fetch directly.
 * For production, implement a backend proxy using server-side environment variables.
 */

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
   * 2️⃣ Speech → Text (Whisper)
   * Records audio and converts to text using OpenAI Whisper
   */
  async startRecording(): Promise<void> {
    try {
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

      // Convert to text using Whisper
      const transcript = await this.transcribeAudio(uri);
      console.log('📝 Transcript:', transcript);
      
      return transcript;
    } catch (error) {
      console.error('❌ Failed to transcribe:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   * Uses FormData for React Native 0.81.5 compatibility
   */
  private async transcribeAudio(audioUri: string): Promise<string> {
    try {
      // Read audio file
      const response = await fetch(audioUri);
      const blob = await response.blob();
      
      // Create FormData for multipart upload (React Native compatible)
      const formData = new FormData();
      formData.append('file', blob, 'audio.m4a');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      // Call Whisper API directly via fetch
      // NOTE: API key is exposed here. For production, use a backend proxy.
      const transcriptionResponse = await fetch(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          },
          body: formData,
        }
      );

      if (!transcriptionResponse.ok) {
        const error = await transcriptionResponse.json();
        throw new Error(`Whisper API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await transcriptionResponse.json();
      return data.text;
    } catch (error) {
      console.error('❌ Whisper transcription failed:', error);
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

      // Step 1: Search knowledge base for relevant context (RAG)
      const relevantContext = await knowledgeService.searchKnowledge(transcript);

      // Step 2: Classify intent and determine action
      const intent = await actionEngine.classifyIntent(transcript, relevantContext);

      // Step 3: Generate response
      let response: string;
      
      if (intent.type === 'knowledge') {
        // Knowledge question - use RAG
        response = await this.generateKnowledgeResponse(transcript, relevantContext);
      } else {
        // Action command - execute and respond
        response = intent.response || 'I\'ll help you with that.';
      }

      return {
        transcript,
        intent: intent.type,
        action: intent.action,
        response,
        shouldExecute: intent.type === 'action',
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
   * Speak the AI response
   * Returns a promise that resolves when speech finishes
   */
  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔊 Speaking:', text);
        
        Speech.speak(text, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
          onDone: () => {
            console.log('✅ Finished speaking');
            resolve();
          },
          onStopped: () => {
            console.log('🛑 Speech stopped');
            resolve();
          },
          onError: (error) => {
            console.error('❌ Speech error:', error);
            reject(error);
          },
        });
      } catch (error) {
        console.error('❌ Text-to-speech failed:', error);
        reject(error);
      }
    });
  }

  stopSpeaking(): void {
    Speech.stop();
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
