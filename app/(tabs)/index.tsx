import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Link, Handshake, Users, TrendingUp, Calendar, ChevronRight, Send, Inbox } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import GradientText from '@/components/shared/GradientText';
import FloatingLogo from '@/components/shared/FloatingLogo';
import SmartPromptChips from '@/components/ai/SmartPromptChips';
import AIResponseToast from '@/components/ai/AIResponseToast';
import AIInputBar from '@/components/ai/AIInputBar';
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
import { ActivityService } from '@/services/activityService';
import ActivityFeedItem from '@/components/activity/ActivityFeedItem';
import { Activity } from '@/types';

export default function Home() {
  const { profile } = useAuth();
  const { processIntent } = useAI();
  const [linksGivenCount, setLinksGivenCount] = useState(0);
  const [linksReceivedCount, setLinksReceivedCount] = useState(0);
  const [closedDealsCount, setClosedDealsCount] = useState(0);
  const [meetingsCount, setMeetingsCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [linksGiven, linksReceived, closedDeals, meetings, activities] = await Promise.all([
        LinksService.getLinksGivenCount(),
        LinksService.getLinksReceivedCount(),
        DealsService.getClosedDealsCount(),
        I2WEService.getMeetingsCount(),
        ActivityService.getRecentActivities(3),
      ]);

      setLinksGivenCount(linksGiven);
      setLinksReceivedCount(linksReceived);
      setClosedDealsCount(closedDeals);
      setMeetingsCount(meetings);
      setRecentActivities(activities);
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
    } catch (error) {
      console.error('❌ Prompt processing error:', error);
    }
  };

  const handleTextSubmit = async (text: string) => {
    try {
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
    } catch (error) {
      console.error('❌ Text processing error:', error);
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
          <AIInputBar onMicPress={() => { }} onTextSubmit={handleTextSubmit} />
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

          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <ActivityFeedItem key={activity.id} activity={activity} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent activity yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start sending links and making deals
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.discoverButton}
          onPress={() => router.push('/channels')}
          activeOpacity={0.7}>
          <Text style={styles.discoverButtonText}>Explore All Channels</Text>
          <ChevronRight size={20} color={colors.accent_green_bright} />
        </TouchableOpacity>

      </ScrollView>
    </View >
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
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: colors.text_primary,
    marginBottom: spacing.sm,
    lineHeight: 40,
    marginTop: spacing.md,
  },
  name: {
    fontFamily: 'Poppins-Bold',
    fontSize: 40,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
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
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: colors.text_primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: colors.text_primary,
  },
  seeAll: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
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
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.text_secondary,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.accent_green_bright,
    marginRight: spacing.xs,
  },
  aiSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  aiSectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: colors.text_primary,
    marginBottom: spacing.md,
  },
});
