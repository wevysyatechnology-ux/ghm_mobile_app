import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Link, Handshake, Users, Grid } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import DiscoverSection from '@/components/discover/DiscoverSection';
import FloatingLogo from '@/components/shared/FloatingLogo';

export default function Discover() {
  const quickChannels = [
    {
      slug: 'links',
      icon: Link,
      title: 'Links',
      subtitle: 'Send and receive business referrals',
      color: colors.accent_green_bright,
    },
    {
      slug: 'deals',
      icon: Handshake,
      title: 'Deals',
      subtitle: 'Share and close transactions',
      color: colors.accent_green_bright,
    },
    {
      slug: '12we-meetings',
      icon: Users,
      title: '12we Meetings',
      subtitle: 'Connect with house members',
      color: colors.accent_green_bright,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <FloatingLogo size="medium" />
          <Text style={styles.header}>Discover</Text>
        </View>

        <View style={styles.quickChannelsContainer}>
          {quickChannels.map((channel) => {
            const IconComponent = channel.icon;
            return (
              <TouchableOpacity
                key={channel.slug}
                style={styles.quickChannelCard}
                onPress={() => router.push({
                  pathname: '/channel-detail',
                  params: { channelSlug: channel.slug }
                })}
                activeOpacity={0.8}
              >
                <View style={styles.quickChannelIconContainer}>
                  <IconComponent size={24} color={channel.color} strokeWidth={2.5} />
                </View>
                <Text style={styles.quickChannelTitle}>{channel.title}</Text>
                <Text style={styles.quickChannelSubtitle}>{channel.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.channelsButton}
          onPress={() => router.push('/channels')}
          activeOpacity={0.7}
        >
          <View style={styles.channelsBadge}>
            <Grid size={24} color="#fff" />
          </View>
          <View style={styles.channelsContent}>
            <Text style={styles.channelsTitle}>All Channels</Text>
            <Text style={styles.channelsSubtitle}>
              Browse all collaboration channels
            </Text>
          </View>
        </TouchableOpacity>

        <DiscoverSection title="Members Near You" />
        <DiscoverSection title="Top Professionals" />
        <DiscoverSection title="Recommended for You" />
      </ScrollView>
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
    paddingBottom: 160,
  },
  headerContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  header: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.text_primary,
    letterSpacing: -1,
    marginTop: spacing.lg,
  },
  quickChannelsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  quickChannelCard: {
    flex: 1,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    alignItems: 'center',
  },
  quickChannelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickChannelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text_primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  quickChannelSubtitle: {
    fontSize: 11,
    color: colors.text_muted,
    textAlign: 'center',
    lineHeight: 14,
  },
  channelsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg_secondary,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border_secondary,
  },
  channelsBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  channelsContent: {
    flex: 1,
  },
  channelsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text_primary,
    marginBottom: 4,
  },
  channelsSubtitle: {
    fontSize: 14,
    color: colors.text_secondary,
    lineHeight: 18,
  },
});
