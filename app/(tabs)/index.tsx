import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Link, Handshake, Users, TrendingUp, Calendar, ChevronRight, Send, Inbox } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import GradientText from '@/components/shared/GradientText';
import FloatingLogo from '@/components/shared/FloatingLogo';
import AIInputBar from '@/components/ai/AIInputBar';
import FloatingVoiceButton from '@/components/ai/FloatingVoiceButton';
import SmartPromptChips from '@/components/ai/SmartPromptChips';
import AIResponseToast from '@/components/ai/AIResponseToast';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/contexts/AIContext';
import { AIService } from '@/services/aiService';
import { speechService } from '@/services/speechService';
import { LinksService } from '@/services/linksService';
import { DealsService } from '@/services/dealsService';
import { I2WEService } from '@/services/i2weService';
import { voiceOS } from '@/services/voiceOSService';
import { actionEngine } from '@/services/actionEngine';
import { knowledgeService } from '@/services/knowledgeService';

export default function Home() {
  const { profile, userId, isLoading } = useAuth();
  const { processIntent } = useAI();
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'responding'>('idle');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [linksGivenCount, setLinksGivenCount] = useState(0);
  const [linksReceivedCount, setLinksReceivedCount] = useState(0);
  const [closedDealsCount, setClosedDealsCount] = useState(0);
  const [meetingsCount, setMeetingsCount] = useState(0);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!userId) {
      setLinksGivenCount(0);
      setLinksReceivedCount(0);
      setClosedDealsCount(0);
      setMeetingsCount(0);
      return;
    }

    loadStats();
  }, [userId, isLoading]);

  const loadStats = async () => {
    try {
      const [linksGiven, linksReceived, closedDeals, meetings] = await Promise.all([
        LinksService.getLinksGivenCount(),
        LinksService.getLinksReceivedCount(),
        DealsService.getClosedDealsCount(),
        I2WEService.getMeetingsCount(),
      ]);

      setLinksGivenCount(linksGiven);
      setLinksReceivedCount(linksReceived);
      setClosedDealsCount(closedDeals);
      setMeetingsCount(meetings);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'links':
        router.push('/links-form');
        break;
      case 'deals':
        router.push('/deals-form');
        break;
      case 'connect':
        router.push('/i2we-form');
        break;
    }
  };

  const handlePromptPress = async (prompt: string) => {
    try {
      setOrbState('thinking');
      console.log('💡 Processing prompt:', prompt);

      // Use Voice OS pipeline for consistent AI processing
      let context = '';
      try {
        context = await knowledgeService.searchKnowledge(prompt);
      } catch (error) {
        console.log('⚠️ Knowledge search failed, continuing without context');
        context = 'WeVysya is a business community network.';
      }

      const intent = await actionEngine.classifyIntent(prompt, context);
      console.log('🎯 Intent:', intent.type, intent.category);

      setOrbState('responding');

      // Show and speak the response
      setToastMessage(intent.response);
      setShowToast(true);
      
      try {
        await voiceOS.speak(intent.response);
      } catch (speakError) {
        console.log('⚠️ Text-to-speech failed');
      }

      // Execute action if needed
      if (intent.type === 'action' && intent.action?.screen) {
        setTimeout(() => {
          router.push(intent.action!.screen as any);
        }, 1500);
      }

      setTimeout(() => setOrbState('idle'), 2000);
    } catch (error) {
      console.error('❌ Prompt processing error:', error);
      setOrbState('idle');
      setToastMessage('Sorry, I couldn\'t process that. Please check your connection.');
      setShowToast(true);
    }
  };

  const handleMicPress = async () => {
    // Check if running on web - voice recording has limited support
    if (Platform.OS === 'web') {
      Alert.alert(
        'Voice Input Not Available on Web',
        'Voice recording works best on mobile devices. Please use the text input instead, or test on a physical device/simulator.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setOrbState('listening');
      console.log('🎤 Starting voice recording...');

      // Start recording
      await voiceOS.startRecording();
      console.log('✅ Recording started');

      // Auto-stop after 5 seconds (or implement manual stop button)
      setTimeout(async () => {
        try {
          setOrbState('thinking');
          console.log('🛑 Stopping recording...');

          // Transcribe audio using Whisper
          const transcript = await voiceOS.stopRecordingAndTranscribe();
          console.log('📝 Transcribed:', transcript);
          
          if (!transcript || transcript.trim().length === 0) {
            throw new Error('No speech detected');
          }

          // Get context and classify intent
          let context = '';
          try {
            context = await knowledgeService.searchKnowledge(transcript);
            console.log('📚 Context retrieved');
          } catch (error) {
            console.log('⚠️ Context search failed, using default');
            context = 'WeVysya is a business community network.';
          }

          const intent = await actionEngine.classifyIntent(transcript, context);
          console.log('🎯 Intent:', intent.type, intent.category);

          setOrbState('responding');

          // Show and speak the response
          setToastMessage(intent.response);
          setShowToast(true);
          
          try {
            await voiceOS.speak(intent.response);
          } catch (speakError) {
            console.log('⚠️ Text-to-speech failed');
          }

          // Execute action if needed
          if (intent.type === 'action' && intent.action?.screen) {
            setTimeout(() => {
              router.push(intent.action!.screen as any);
            }, 1500);
          }

          setTimeout(() => setOrbState('idle'), 2000);
        } catch (error) {
          console.error('❌ Voice processing error:', error);
          setOrbState('idle');
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setToastMessage(`Voice processing failed: ${errorMessage}. Please try text input instead.`);
          setShowToast(true);
        }
      }, 5000); // Stop recording after 5 seconds

    } catch (error) {
      console.error('❌ Microphone error:', error);
      setOrbState('idle');
      setToastMessage('Could not access microphone. Please check permissions and try again.');
      setShowToast(true);
    }
  };

  const handleTextSubmit = async (text: string) => {
    try {
      setOrbState('thinking');
      console.log('💬 Processing text input:', text);

      // Use Voice OS pipeline for proper AI processing
      let context = '';
      try {
        // Step 1: Search knowledge base for context (RAG)
        context = await knowledgeService.searchKnowledge(text);
        console.log('📚 Knowledge context retrieved');
      } catch (error) {
        console.log('⚠️ Knowledge search failed, continuing without context:', error);
        context = 'WeVysya is a business community network.';
      }

      // Step 2: Classify intent using OpenAI via classify-intent function
      const intent = await actionEngine.classifyIntent(text, context);
      console.log('🎯 Intent classified:', intent.type, intent.category);

      setOrbState('responding');

      // Show the response
      setToastMessage(intent.response);
      setShowToast(true);

      // Speak the response
      try {
        await voiceOS.speak(intent.response);
      } catch (speakError) {
        console.log('⚠️ Text-to-speech failed:', speakError);
      }

      // Execute action if needed
      if (intent.type === 'action' && intent.action?.screen) {
        setTimeout(() => {
          router.push(intent.action!.screen as any);
        }, 1500);
      }

      setTimeout(() => setOrbState('idle'), 2000);
    } catch (error) {
      console.error('❌ Text processing error:', error);
      setOrbState('idle');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToastMessage(`Processing failed: ${errorMessage}. Please check your connection and try again.`);
      setShowToast(true);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <FloatingLogo size="medium" />
          <Text style={styles.greeting}>
            Hello,{'\n'}
            <GradientText style={styles.name}>
              {profile?.full_name || 'Member'}
            </GradientText>
          </Text>
          <Text style={styles.subtitle}>Stop Thinking 'i', Start Thinking "WE"</Text>
        </View>

        <View style={styles.aiSection}>
          <Text style={styles.aiSectionTitle}>Ask WeVysya Assistant</Text>
          <AIInputBar onMicPress={handleMicPress} onTextSubmit={handleTextSubmit} />
          <SmartPromptChips onPromptPress={handlePromptPress} />
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => handleQuickAction('links')}
            activeOpacity={0.8}>
            <View style={styles.actionIconBox}>
              <Link size={28} color={colors.accent_green_bright} strokeWidth={2.5} />
            </View>
            <Text style={styles.actionTitle}>Links</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => handleQuickAction('deals')}
            activeOpacity={0.8}>
            <View style={styles.actionIconBox}>
              <Handshake size={28} color={colors.accent_green_bright} strokeWidth={2.5} />
            </View>
            <Text style={styles.actionTitle}>Deals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => handleQuickAction('connect')}
            activeOpacity={0.8}>
            <View style={styles.actionIconBox}>
              <Users size={28} color={colors.accent_green_bright} strokeWidth={2.5} />
            </View>
            <Text style={styles.actionTitle}>i2we</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Send size={20} color={colors.accent_green_bright} />
            </View>
            <Text style={styles.statValue}>{linksGivenCount}</Text>
            <Text style={styles.statLabel}>Links Given</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Inbox size={20} color={colors.accent_green_bright} />
            </View>
            <Text style={styles.statValue}>{linksReceivedCount}</Text>
            <Text style={styles.statLabel}>Links Received</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Handshake size={20} color={colors.accent_green_bright} />
            </View>
            <Text style={styles.statValue}>{closedDealsCount}</Text>
            <Text style={styles.statLabel}>Closed Deals</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Calendar size={20} color={colors.accent_green_bright} />
            </View>
            <Text style={styles.statValue}>{meetingsCount}</Text>
            <Text style={styles.statLabel}>Meetings</Text>
          </View>
        </View>

        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/activity')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent activity yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start sending links and making deals
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.discoverButton}
          onPress={() => router.push('/channels')}
          activeOpacity={0.7}>
          <Text style={styles.discoverButtonText}>Explore All Channels</Text>
          <ChevronRight size={20} color={colors.accent_green_bright} />
        </TouchableOpacity>

      </ScrollView>
      <FloatingVoiceButton
        onPress={handleMicPress}
        isActive={orbState === 'listening'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg_primary,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text_primary,
    marginBottom: spacing.sm,
    lineHeight: 40,
    marginTop: spacing.md,
  },
  name: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text_muted,
    marginTop: spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: 'rgba(22, 33, 28, 0.95)',
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  actionIconBox: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text_primary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.bg_secondary,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border_secondary,
  },
  statIconContainer: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text_primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text_muted,
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text_primary,
  },
  seeAll: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent_green_bright,
  },
  emptyState: {
    backgroundColor: colors.bg_secondary,
    borderRadius: 16,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border_secondary,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text_secondary,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.text_muted,
    textAlign: 'center',
  },
  discoverButton: {
    marginHorizontal: spacing.xl,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  discoverButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent_green_bright,
    marginRight: spacing.xs,
  },
  aiSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  aiSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text_primary,
    marginBottom: spacing.md,
  },
});
