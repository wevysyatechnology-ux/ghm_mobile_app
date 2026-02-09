import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ChevronLeft, Grid } from 'lucide-react-native';
import { channelsService } from '@/services/channelsService';
import { Channel } from '@/types/database';
import { ChannelCard } from '@/components/channels/ChannelCard';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export default function ChannelsScreen() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const data = await channelsService.getAllChannels();
      setChannels(data);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelPress = (channel: Channel) => {
    router.push({
      pathname: '/channel-detail',
      params: { channelId: channel.id, channelSlug: channel.slug },
    });
  };

  const priorityChannels = channels.filter(c =>
    ['links', 'deals', '12we-meetings'].includes(c.slug)
  );

  const otherChannels = channels.filter(c =>
    !['links', 'deals', '12we-meetings'].includes(c.slug)
  );

  const categories = ['All', ...new Set(channels.map((c) => c.category))];
  const filteredChannels =
    activeCategory === 'All'
      ? channels
      : channels.filter((c) => c.category === activeCategory);

  const channelsByCategory = filteredChannels.reduce(
    (acc, channel) => {
      const category = channel.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(channel);
      return acc;
    },
    {} as Record<string, Channel[]>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Channels</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Grid size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>PRIORITY</Text>
              {priorityChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onPress={handleChannelPress}
                  isPriority
                />
              ))}
            </View>

            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>MORE CHANNELS</Text>
              {otherChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onPress={handleChannelPress}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 3,
  },
  categorySection: {
    marginBottom: SPACING.xl,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
