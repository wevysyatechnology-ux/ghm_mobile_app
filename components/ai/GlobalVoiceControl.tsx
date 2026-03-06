import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { voiceOS } from '@/services/voiceOSService';
import { actionEngine } from '@/services/actionEngine';
import { knowledgeService } from '@/services/knowledgeService';
import FloatingVoiceButton from './FloatingVoiceButton';
import AIResponseToast from './AIResponseToast';

export default function GlobalVoiceControl() {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

    const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'responding'>('idle');
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const recordingTimeout = useRef<NodeJS.Timeout | null>(null);

    // Stop recording/speaking if user navigates away or unmounts component
    useEffect(() => {
        return () => {
            if (recordingTimeout.current) {
                clearTimeout(recordingTimeout.current);
            }
            if (orbState === 'responding') {
                voiceOS.stopSpeaking().catch(console.error);
            }
        };
    }, [pathname]);

    if (isLoading || !isAuthenticated || pathname === '/auth/login') {
        return null;
    }

    // Also hide on the dedicated voice assistant page to avoid duplicate buttons
    if (pathname === '/voice-assistant') {
        return null;
    }

    const handleMicPress = async () => {
        try {
            if (orbState === 'responding') {
                // Stop speaking immediately
                console.log('🛑 Stopping AI voice...');
                await voiceOS.stopSpeaking();
                setOrbState('idle');
                setToastMessage('Voice stopped.');
                setShowToast(true);
                return;
            }

            if (orbState === 'listening') {
                // Stop recording manually
                console.log('🛑 Stopping recording early...');
                if (recordingTimeout.current) {
                    clearTimeout(recordingTimeout.current);
                    recordingTimeout.current = null;
                }
                await processRecording();
                return;
            }

            setOrbState('listening');
            console.log('🎤 Starting voice recording...');

            // Start recording
            await voiceOS.startRecording();
            console.log('✅ Recording started');

            // Auto-stop after 5 seconds
            recordingTimeout.current = setTimeout(async () => {
                await processRecording();
            }, 5000) as any;

        } catch (error) {
            console.error('❌ Microphone error:', error);
            setOrbState('idle');
            setToastMessage('Could not access microphone. Please check permissions and try again.');
            setShowToast(true);
        }
    };

    const processRecording = async () => {
        try {
            setOrbState('thinking');
            console.log('🛑 Transcribing recording...');

            // Transcribe audio using Deepgram
            const transcript = await voiceOS.stopRecordingAndTranscribe();
            console.log('📝 Transcribed:', transcript);

            if (!transcript || transcript.trim().length === 0) {
                throw new Error('No speech detected');
            }

            // Use the optimized VoiceOS pipeline (handles RAG, fast intent classification, and DB queries safely)
            const commandOptions = await voiceOS.processCommand(transcript);

            setOrbState('responding');

            // Show and speak the optimized response
            setToastMessage(commandOptions.response);
            setShowToast(true);

            try {
                // This wait blocks until the audio finishes playing
                await voiceOS.speak(commandOptions.response);
            } catch (speakError) {
                console.log('⚠️ Text-to-speech failed');
            }

            // Execute action if needed
            if (commandOptions.shouldExecute && commandOptions.action?.screen) {
                setTimeout(() => {
                    router.push(commandOptions.action!.screen as any);
                }, 1500);
            }

            // Set idle safely avoiding stale state closures only AFTER audio is done playing
            setOrbState((prev) => (prev === 'responding' ? 'idle' : prev));
        } catch (error) {
            console.error('❌ Voice processing error:', error);
            setOrbState('idle');

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setToastMessage(`Voice processing failed: ${errorMessage}. Please try text input instead.`);
            setShowToast(true);
        }
    };

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <FloatingVoiceButton
                onPress={handleMicPress}
                isListening={orbState === 'listening'}
                isSpeaking={orbState === 'responding'}
            />
            <AIResponseToast
                message={toastMessage}
                visible={showToast}
                onHide={() => setShowToast(false)}
                duration={3000}
            />
        </View>
    );
}
