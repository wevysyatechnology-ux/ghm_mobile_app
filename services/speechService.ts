import { Platform } from 'react-native';

// Speech recognition interface for cross-platform compatibility
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

class SpeechService {
  private isListening = false;
  private recognition: any = null;

  /**
   * Initialize speech recognition (Web Speech API for web, native for mobile)
   */
  initializeSpeechRecognition() {
    if (Platform.OS === 'web' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  /**
   * Start listening for speech input
   */
  async startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (this.isListening) {
      return;
    }

    if (Platform.OS === 'web') {
      return this.startWebSpeechRecognition(onResult, onError);
    } else {
      // For mobile, we'll use expo-speech or a native module
      // For now, return a simulated result
      onError?.('Speech recognition not yet implemented for mobile. Please use text input.');
    }
  }

  /**
   * Web Speech Recognition
   */
  private startWebSpeechRecognition(
    onResult: (text: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        this.initializeSpeechRecognition();
      }

      if (!this.recognition) {
        const error = 'Speech recognition not supported in this browser';
        onError?.(error);
        reject(error);
        return;
      }

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        this.isListening = false;
        resolve();
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        const errorMessage = `Speech recognition error: ${event.error}`;
        onError?.(errorMessage);
        reject(errorMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        onError?.('Failed to start speech recognition');
        reject(error);
      }
    });
  }

  /**
   * Stop listening for speech input
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Text-to-speech output
   */
  async speak(text: string, options?: { rate?: number; pitch?: number; language?: string }): Promise<void> {
    if (Platform.OS === 'web') {
      return this.speakWeb(text, options);
    } else {
      // For mobile, we can use expo-speech
      try {
        const Speech = require('expo-speech');
        await Speech.speak(text, {
          language: options?.language || 'en-US',
          pitch: options?.pitch || 1.0,
          rate: options?.rate || 1.0,
        });
      } catch (error) {
        console.log('Expo Speech not available, voice output disabled');
      }
    }
  }

  /**
   * Web Speech Synthesis
   */
  private speakWeb(text: string, options?: { rate?: number; pitch?: number; language?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        console.log('Speech synthesis not supported');
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;
      utterance.lang = options?.language || 'en-US';

      utterance.onend = () => resolve();
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        resolve(); // Resolve anyway to not block the flow
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop speaking
   */
  stopSpeaking() {
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    } else {
      try {
        const Speech = require('expo-speech');
        Speech.stop();
      } catch (error) {
        // Speech not available
      }
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
