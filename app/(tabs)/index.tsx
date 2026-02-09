import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Link, Handshake, Users, TrendingUp, Calendar, ChevronRight } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import GradientText from '@/components/shared/GradientText';
import FloatingLogo from '@/components/shared/FloatingLogo';
import AIInputBar from '@/components/ai/AIInputBar';
import FloatingVoiceButton from '@/components/ai/FloatingVoiceButton';
import SmartPromptChips from '@/components/ai/SmartPromptChips';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/contexts/AIContext';
import { AIService } from '@/services/aiService';

export default function Home() {
  const { profile } = useAuth();
  const { processIntent } = useAI();
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'responding'>('idle');

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
    setOrbState('listening');
    setTimeout(() => setOrbState('thinking'), 500);

    const intent = await AIService.processPrompt(prompt);

    setTimeout(() => {
      setOrbState('responding');
      processIntent(intent);
    }, 1500);

    setTimeout(() => setOrbState('idle'), 3000);
  };

  const handleMicPress = async () => {
    setOrbState('listening');
    setTimeout(() => setOrbState('thinking'), 500);

    const intent = await AIService.processVoiceInput(null);

    setTimeout(() => {
      setOrbState('responding');
      processIntent(intent);
    }, 1500);

    setTimeout(() => setOrbState('idle'), 3000);
  };

  const handleTextSubmit = async (text: string) => {
    setOrbState('thinking');

    const intent = await AIService.processTextInput(text);

    setTimeout(() => {
      setOrbState('responding');
      processIntent(intent);
    }, 1000);

    setTimeout(() => setOrbState('idle'), 2500);
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
              <TrendingUp size={20} color={colors.accent_green_bright} />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Active Links</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Handshake size={20} color={colors.accent_green_bright} />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Closed Deals</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Calendar size={20} color={colors.accent_green_bright} />
            </View>
            <Text style={styles.statValue}>0</Text>
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
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
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
