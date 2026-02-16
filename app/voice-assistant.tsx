import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Mic, MicOff, Volume2, Copy, RotateCw } from 'lucide-react-native';

import { voiceOS } from '@/services/voiceOSService';
import { actionEngine } from '@/services/actionEngine';
import { knowledgeService } from '@/services/knowledgeService';
import { loadKnowledgeBase } from '@/utils/knowledgeLoader';

interface VoiceState {
  status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  transcript: string;
  response: string;
  intent: string;
  confidence: number;
}

/**
 * 🎤 WeVysya Voice Assistant Screen
 * 
 * Complete voice interaction UI showcasing all 5 pillars:
 * 1️⃣ Wake Word Detection
 * 2️⃣ Speech → Text (Whisper)
 * 3️⃣ Knowledge Brain (RAG)
 * 4️⃣ Action Engine
 * 5️⃣ Text → Speech
 */
export default function VoiceAssistantScreen() {
  const router = useRouter();
  const [state, setState] = useState<VoiceState>({
    status: 'idle',
    transcript: '',
    response: '',
    intent: '',
    confidence: 0,
  });

  const [initialized, setInitialized] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Initialize voice OS and knowledge base
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 Initializing WeVysya Voice OS...');
        
        // Load knowledge base
        await loadKnowledgeBase();
        console.log('✅ Knowledge base loaded');
        
        // Initialize voice OS
        voiceOS.activateWakeWord();
        
        setInitialized(true);
      } catch (error) {
        console.error('❌ Initialization error:', error);
        setState(prev => ({
          ...prev,
          status: 'error',
          response: 'Failed to initialize Voice OS. Please check your API keys.',
        }));
      }
    };

    initialize();
  }, []);

  // Pulse animation when listening
  useEffect(() => {
    if (state.status === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state.status]);

  /**
   * Handle mic press
   * Tap to activate listening
   */
  const handleMicPress = async () => {
    try {
      if (state.status === 'listening') {
        // Stop recording and process
        await handleStopListening();
        return;
      }

      setState(prev => ({
        ...prev,
        status: 'listening',
        transcript: '',
        response: '',
      }));

      // Start recording
      await voiceOS.startRecording();
      console.log('🎤 Recording started');
    } catch (error) {
      console.error('❌ Microphone error:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        response: 'Microphone error. Please check permissions.',
      }));
    }
  };

  /**
   * Stop listening and process command
   */
  const handleStopListening = async () => {
    try {
      setState(prev => ({ ...prev, status: 'processing' }));

      // Transcribe audio
      const transcript = await voiceOS.stopRecordingAndTranscribe();
      setState(prev => ({ ...prev, transcript }));

      // Process command
      const command = await voiceOS.processCommand(transcript);

      // Get relevant context
      const context = await knowledgeService.searchKnowledge(transcript);

      // Classify intent
      const intent = await actionEngine.classifyIntent(transcript, context);

      // Update state
      setState(prev => ({
        ...prev,
        status: 'speaking',
        response: intent.response,
        intent: intent.type,
        confidence: intent.confidence,
      }));

      // Speak response
      await voiceOS.speak(intent.response);

      // Execute action if needed
      if (intent.type === 'action' && intent.action) {
        // Navigate to appropriate screen
        if (intent.action.screen) {
          router.push(intent.action.screen as any);
        }
      }

      setState(prev => ({ ...prev, status: 'idle' }));
    } catch (error) {
      console.error('❌ Processing error:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        response: 'Processing failed. Please try again.',
      }));
    }
  };

  /**
   * Copy transcript to clipboard
   */
  const handleCopyTranscript = () => {
    if (state.transcript) {
      Alert.alert('Copied', state.transcript);
    }
  };

  /**
   * Test mode - process text directly
   */
  const handleTestMode = async (text: string) => {
    try {
      setState(prev => ({ ...prev, status: 'processing' }));

      const command = await voiceOS.processCommand(text);
      const context = await knowledgeService.searchKnowledge(text);
      const intent = await actionEngine.classifyIntent(text, context);

      setState(prev => ({
        ...prev,
        status: 'speaking',
        response: intent.response,
        transcript: text,
        intent: intent.type,
        confidence: intent.confidence,
      }));

      await voiceOS.speak(intent.response);

      if (intent.type === 'action' && intent.action?.screen) {
        router.push(intent.action.screen as any);
      }

      setState(prev => ({ ...prev, status: 'idle' }));
    } catch (error) {
      console.error('❌ Test error:', error);
    }
  };

  const isListening = state.status === 'listening';
  const isProcessing = state.status === 'processing';
  const isSpeaking = state.status === 'speaking';

  return (
    <ScrollView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="p-6 pt-12">
        <Text className="text-3xl font-bold text-white mb-2">🎤 WeVysya Voice OS</Text>
        <Text className="text-gray-400">
          Wake word activated • Full knowledge assistant • Action capable
        </Text>
      </View>

      {/* Main Mic Button */}
      <View className="flex-1 items-center justify-center py-8">
        {isListening ? (
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
            className="w-32 h-32 rounded-full bg-red-500 items-center justify-center mb-4"
          >
            <MicOff size={64} color="white" />
          </Animated.View>
        ) : (
          <View className="w-32 h-32 rounded-full bg-blue-600 items-center justify-center mb-4">
            <Mic size={64} color="white" />
          </View>
        )}

        <Pressable
          onPress={handleMicPress}
          disabled={!initialized}
          className={`px-8 py-4 rounded-full mb-4 ${
            isListening ? 'bg-red-500' : 'bg-blue-600'
          } ${!initialized ? 'opacity-50' : ''}`}
        >
          <Text className="text-white font-bold text-lg">
            {isListening ? '🛑 Stop' : '🎤 Start Listening'}
          </Text>
        </Pressable>

        <Text className="text-gray-400 text-center mb-8">
          {state.status === 'idle' && 'Tap to start listening'}
          {state.status === 'listening' && 'Listening... Speak now'}
          {state.status === 'processing' && 'Processing...'}
          {state.status === 'speaking' && 'Speaking response...'}
          {state.status === 'error' && 'Error occurred'}
        </Text>
      </View>

      {/* Status Display */}
      <View className="px-6 py-4">
        {/* Transcript */}
        {state.transcript && (
          <View className="bg-gray-800 rounded-lg p-4 mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-gray-400 text-sm">📝 You said:</Text>
              <Pressable onPress={handleCopyTranscript} className="p-2">
                <Copy size={16} color="#9CA3AF" />
              </Pressable>
            </View>
            <Text className="text-white text-base">{state.transcript}</Text>
          </View>
        )}

        {/* Intent Classification */}
        {state.intent && (
          <View className="bg-gray-800 rounded-lg p-4 mb-4">
            <Text className="text-gray-400 text-sm mb-2">🎯 Intent Classification:</Text>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-bold">
                {state.intent === 'knowledge' ? '📚' : '⚡'} {state.intent}
              </Text>
              <Text className="text-blue-400 text-sm">
                {Math.round(state.confidence * 100)}% confidence
              </Text>
            </View>
          </View>
        )}

        {/* Response */}
        {state.response && (
          <View className="bg-gradient-to-b from-green-900 to-gray-800 rounded-lg p-4">
            <View className="flex-row items-center mb-2">
              <Volume2 size={16} color="#4ade80" />
              <Text className="text-gray-400 text-sm ml-2">🤖 Assistant:</Text>
            </View>
            <Text className="text-white text-base leading-6">{state.response}</Text>
          </View>
        )}
      </View>

      {/* Test Mode - Quick Commands */}
      <View className="px-6 py-6">
        <Text className="text-gray-400 text-sm mb-3">💡 Quick Test Commands:</Text>
        <View className="gap-2">
          <Pressable
            onPress={() => handleTestMode('Find a CA in Bengaluru')}
            className="bg-purple-700 px-4 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Find CA in Bengaluru</Text>
          </Pressable>

          <Pressable
            onPress={() => handleTestMode('What is WeVysya?')}
            className="bg-blue-700 px-4 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">What is WeVysya?</Text>
          </Pressable>

          <Pressable
            onPress={() => handleTestMode('Post a deal')}
            className="bg-green-700 px-4 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Post a deal</Text>
          </Pressable>

          <Pressable
            onPress={() => handleTestMode('Create i2we connection')}
            className="bg-orange-700 px-4 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Create i2we</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setState({
                status: 'idle',
                transcript: '',
                response: '',
                intent: '',
                confidence: 0,
              });
            }}
            className="bg-gray-700 px-4 py-3 rounded-lg flex-row items-center justify-center"
          >
            <RotateCw size={16} color="#fff" />
            <Text className="text-white font-medium ml-2">Clear</Text>
          </Pressable>
        </View>
      </View>

      {/* Architecture Info */}
      <View className="px-6 pb-8">
        <Text className="text-gray-400 text-xs mb-3">🏗️ Architecture:</Text>
        <View className="bg-gray-800 rounded-lg p-4 gap-3">
          <View className="flex-row items-start">
            <Text className="text-blue-400 font-bold mr-2 mt-1">1️⃣</Text>
            <View className="flex-1">
              <Text className="text-gray-300 font-bold">Wake Word Detection</Text>
              <Text className="text-gray-500 text-xs">Tap mic to activate listening</Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="text-blue-400 font-bold mr-2 mt-1">2️⃣</Text>
            <View className="flex-1">
              <Text className="text-gray-300 font-bold">Speech → Text (Whisper)</Text>
              <Text className="text-gray-500 text-xs">Records and transcribes voice</Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="text-blue-400 font-bold mr-2 mt-1">3️⃣</Text>
            <View className="flex-1">
              <Text className="text-gray-300 font-bold">Knowledge Brain (RAG)</Text>
              <Text className="text-gray-500 text-xs">Searches relevant context with embeddings</Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="text-blue-400 font-bold mr-2 mt-1">4️⃣</Text>
            <View className="flex-1">
              <Text className="text-gray-300 font-bold">Action Engine</Text>
              <Text className="text-gray-500 text-xs">Classifies intent and parameters</Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="text-blue-400 font-bold mr-2 mt-1">5️⃣</Text>
            <View className="flex-1">
              <Text className="text-gray-300 font-bold">Text → Speech</Text>
              <Text className="text-gray-500 text-xs">Speaks back the response</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
