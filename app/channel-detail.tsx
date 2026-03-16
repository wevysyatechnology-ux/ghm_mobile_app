import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { channelsService } from '@/services/channelsService';
import { DealsService } from '@/services/dealsService';
import { I2WEService } from '@/services/i2weService';
import { LinksService } from '@/services/linksService';
import { EventsService, EventMeeting } from '@/services/eventsService';
import { Channel, ChannelPost, CoreDeal, CoreI2WE, CoreLink } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { format, isToday, isTomorrow } from 'date-fns';

export default function ChannelDetailScreen() {
  const { channelId, channelSlug } = useLocalSearchParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [posts, setPosts] = useState<ChannelPost[]>([]);
  const [links, setLinks] = useState<CoreLink[]>([]);
  const [deals, setDeals] = useState<CoreDeal[]>([]);
  const [meetings, setMeetings] = useState<CoreI2WE[]>([]);
  const [events, setEvents] = useState<EventMeeting[]>([]);
  const [eventsTab, setEventsTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [linksFilter, setLinksFilter] = useState<'all' | 'received' | 'given'>('all');

  const filteredLinks = useMemo(() => {
    if (!user?.id) return links;

    if (linksFilter === 'received') {
      return links.filter((link) => link.to_user_id === user.id);
    }

    if (linksFilter === 'given') {
      return links.filter((link) => link.from_user_id === user.id);
    }

    return links;
  }, [links, linksFilter, user?.id]);

  useEffect(() => {
    loadChannelData();
  }, [channelSlug]);

  const getChannelType = (slug: string | null | undefined) => {
    const normalizedSlug = (slug || '').toLowerCase();

    if (normalizedSlug.includes('link')) return 'links';
    if (normalizedSlug.includes('deal')) return 'deals';
    if (
      normalizedSlug.includes('i2we') ||
      normalizedSlug.includes('12we') ||
      normalizedSlug.includes('meeting')
    ) {
      return 'meetings';
    }
    if (normalizedSlug.includes('event')) return 'events';

    return 'posts';
  };

  const loadStructuredChannelData = async (slug: string) => {
    const channelType = getChannelType(slug);

    if (channelType === 'links') {
      const linksData = await LinksService.getMyLinks().catch(() => []);
      setLinks(linksData);
      setDeals([]);
      setMeetings([]);
      setPosts([]);
      return;
    }

    if (channelType === 'deals') {
      const dealsData = await DealsService.getMyDeals().catch(() => []);
      setDeals(dealsData);
      setLinks([]);
      setMeetings([]);
      setPosts([]);
      return;
    }

    if (channelType === 'meetings') {
      const meetingsData = await I2WEService.getMyMeetings().catch(() => []);
      setMeetings(meetingsData);
      setLinks([]);
      setDeals([]);
      setPosts([]);
      return;
    }

    if (channelType === 'events') {
      const [upcoming, completed] = await Promise.all([
        EventsService.getUpcomingEvents().catch(() => []),
        EventsService.getCompletedEvents().catch(() => []),
      ]);
      setEvents([...upcoming, ...completed]);
      setLinks([]);
      setDeals([]);
      setMeetings([]);
      setPosts([]);
      return;
    }

    const postsData = await channelsService.getChannelPosts(channelId as string);
    setPosts(postsData);
    setLinks([]);
    setDeals([]);
    setMeetings([]);
  };

  const getDisplayDescription = (targetChannel: Channel) => {
    const normalizedSlug = (targetChannel.slug || '').toLowerCase();
    const normalizedName = (targetChannel.name || '').toLowerCase();
    const isI2WEChannel =
      normalizedSlug.includes('i2we') ||
      normalizedSlug.includes('12we') ||
      normalizedSlug.includes('meeting') ||
      normalizedName.includes('i2we') ||
      normalizedName.includes('meeting');

    return isI2WEChannel ? 'Track one-on-one meetings' : targetChannel.description;
  };

  useEffect(() => {
    if (!channel?.id || getChannelType(channel.slug) !== 'posts') return;

    const subscription = supabase
      .channel(`channel-posts-${channel.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_posts',
          filter: `channel_id=eq.${channel.id}`,
        },
        async () => {
          const postsData = await channelsService.getChannelPosts(channel.id);
          setPosts(postsData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channel?.id]);

  const loadChannelData = async () => {
    try {
      setLoading(true);
      const channelData = await channelsService.getChannelBySlug(channelSlug as string);
      if (channelData) {
        setChannel(channelData);
        await loadStructuredChannelData(channelData.slug);
      }
    } catch (error) {
      console.error('Error loading channel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !channel || !newPostTitle.trim()) {
      Alert.alert('Error', 'Please fill in the title');
      return;
    }

    try {
      setCreating(true);
      const post = await channelsService.createPost(user.id, {
        channel_id: channel.id,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        post_type: channel.slug,
      });

      if (post) {
        setPosts([post, ...posts]);
        setNewPostTitle('');
        setNewPostContent('');
        setShowCreatePost(false);
        Alert.alert('Success', 'Post created successfully');
      } else {
        Alert.alert('Error', 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const handleHeaderAction = () => {
    if (!channel) return;

    const channelType = getChannelType(channel.slug);

    if (channelType === 'links') {
      router.push('/links-form');
      return;
    }

    if (channelType === 'deals') {
      router.push('/deals-form');
      return;
    }

    if (channelType === 'meetings') {
      router.push('/i2we-form');
      return;
    }

    if (channelType === 'events') {
      router.push('/event-meetings');
      return;
    }

    setShowCreatePost(!showCreatePost);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Channel not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>{channel.icon}</Text>
          <Text style={styles.headerTitle}>{channel.name}</Text>
        </View>
        <TouchableOpacity
          onPress={handleHeaderAction}
          style={styles.iconButton}
        >
          <Plus size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>{getDisplayDescription(channel)}</Text>
        </View>

        {showCreatePost && getChannelType(channel.slug) === 'posts' && (
          <View style={styles.createPostCard}>
            <Text style={styles.createPostTitle}>Create New Post</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={COLORS.textSecondary}
              value={newPostTitle}
              onChangeText={setNewPostTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor={COLORS.textSecondary}
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={4}
            />
            <View style={styles.createPostButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => {
                  setShowCreatePost(false);
                  setNewPostTitle('');
                  setNewPostContent('');
                }}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleCreatePost}
                disabled={creating}
              >
                <Text style={styles.buttonPrimaryText}>
                  {creating ? 'Creating...' : 'Create Post'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.postsSection}>
          {getChannelType(channel.slug) === 'links' && (
            <>
              <Text style={styles.sectionTitle}>Links ({filteredLinks.length})</Text>

              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[styles.filterChip, linksFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setLinksFilter('all')}>
                  <Text
                    style={[
                      styles.filterChipText,
                      linksFilter === 'all' && styles.filterChipTextActive,
                    ]}>
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    linksFilter === 'received' && styles.filterChipActive,
                  ]}
                  onPress={() => setLinksFilter('received')}>
                  <Text
                    style={[
                      styles.filterChipText,
                      linksFilter === 'received' && styles.filterChipTextActive,
                    ]}>
                    Received
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, linksFilter === 'given' && styles.filterChipActive]}
                  onPress={() => setLinksFilter('given')}>
                  <Text
                    style={[
                      styles.filterChipText,
                      linksFilter === 'given' && styles.filterChipTextActive,
                    ]}>
                    Given
                  </Text>
                </TouchableOpacity>
              </View>

              {filteredLinks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No links yet</Text>
                  <Text style={styles.emptyStateSubtext}>Create a new link using +</Text>
                </View>
              ) : (
                filteredLinks.map((link) => (
                  <View key={link.id} style={styles.postCard}>
                    <View style={styles.linkHeaderRow}>
                      <Text style={styles.postTitle}>{link.title}</Text>
                      <View style={styles.linkTag}>
                        <Text style={styles.linkTagText}>
                          {link.to_user_id === user?.id ? 'Received' : 'Given'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.postContent}>Contact: {link.contact_name}</Text>
                    <Text style={styles.postContent}>Status: {link.status}</Text>
                    <Text style={styles.postDate}>
                      {new Date(link.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </>
          )}

          {getChannelType(channel.slug) === 'deals' && (
            <>
              <Text style={styles.sectionTitle}>Deals ({deals.length})</Text>
              {deals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No deals yet</Text>
                  <Text style={styles.emptyStateSubtext}>Create a new deal using +</Text>
                </View>
              ) : (
                deals.map((deal) => (
                  <View key={deal.id} style={styles.postCard}>
                    <Text style={styles.postTitle}>{deal.title}</Text>
                    <Text style={styles.postContent}>Amount: ₹{deal.amount}</Text>
                    <Text style={styles.postDate}>
                      {new Date(deal.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </>
          )}

          {getChannelType(channel.slug) === 'meetings' && (
            <>
              <Text style={styles.sectionTitle}>Meetings ({meetings.length})</Text>
              {meetings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No meetings yet</Text>
                  <Text style={styles.emptyStateSubtext}>Schedule a meeting using +</Text>
                </View>
              ) : (
                meetings.map((meeting) => (
                  <View key={meeting.id} style={styles.postCard}>
                    <Text style={styles.postTitle}>I2WE Meeting</Text>
                    <Text style={styles.postContent}>Status: {meeting.status}</Text>
                    <Text style={styles.postContent}>
                      Date: {new Date(meeting.meeting_date).toLocaleDateString()}
                    </Text>
                    {meeting.notes && <Text style={styles.postContent}>Notes: {meeting.notes}</Text>}
                    <Text style={styles.postDate}>
                      {new Date(meeting.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </>
          )}

          {getChannelType(channel.slug) === 'events' && (
            <>
              <View style={styles.eventsTabRow}>
                <TouchableOpacity
                  style={[
                    styles.eventsTab,
                    eventsTab === 'upcoming' && styles.eventsTabActive,
                  ]}
                  onPress={() => setEventsTab('upcoming')}>
                  <Text
                    style={[
                      styles.eventsTabText,
                      eventsTab === 'upcoming' && styles.eventsTabTextActive,
                    ]}>
                    Upcoming ({events.filter((e) => e.event_date >= new Date().toISOString().split('T')[0]).length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.eventsTab,
                    eventsTab === 'completed' && styles.eventsTabActive,
                  ]}
                  onPress={() => setEventsTab('completed')}>
                  <Text
                    style={[
                      styles.eventsTabText,
                      eventsTab === 'completed' && styles.eventsTabTextActive,
                    ]}>
                    Completed ({events.filter((e) => e.event_date < new Date().toISOString().split('T')[0]).length})
                  </Text>
                </TouchableOpacity>
              </View>

              {(() => {
                const today = new Date().toISOString().split('T')[0];
                const filtered = eventsTab === 'upcoming'
                  ? events.filter((e) => e.event_date >= today)
                  : events.filter((e) => e.event_date < today);

                if (filtered.length === 0) {
                  return (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>
                        No {eventsTab} events
                      </Text>
                      <Text style={styles.emptyStateSubtext}>
                        {eventsTab === 'upcoming'
                          ? 'New events will appear here once scheduled.'
                          : 'Past events will appear here.'}
                      </Text>
                    </View>
                  );
                }

                return filtered.map((event) => {
                  const dateObj = new Date(event.event_date + 'T00:00:00');
                  const dateLabel = isToday(dateObj)
                    ? 'Today'
                    : isTomorrow(dateObj)
                    ? 'Tomorrow'
                    : format(dateObj, 'EEE, MMM d, yyyy');

                  let timeLabel = 'Time TBD';
                  if (event.event_time) {
                    const [h, m] = event.event_time.split(':').map(Number);
                    const t = new Date(); t.setHours(h, m, 0, 0);
                    timeLabel = format(t, 'h:mm a');
                  }

                  const isCompleted = eventsTab === 'completed';

                  return (
                    <View
                      key={event.id}
                      style={[
                        styles.postCard,
                        styles.eventCard,
                        isCompleted && styles.eventCardCompleted,
                      ]}>
                      <View style={styles.eventCardHeader}>
                        <View style={[
                          styles.eventLevelBadge,
                          isCompleted && styles.eventLevelBadgeDim,
                        ]}>
                          <Text style={styles.eventLevelText}>
                            {event.event_level
                              ? event.event_level.charAt(0).toUpperCase() +
                                event.event_level.slice(1)
                              : 'Event'}
                          </Text>
                        </View>
                        {isCompleted && (
                          <View style={styles.doneBadge}>
                            <Text style={styles.doneBadgeText}>✓ Done</Text>
                          </View>
                        )}
                      </View>

                      {event.title ? (
                        <Text style={styles.postTitle}>{event.title}</Text>
                      ) : null}

                      {event.description ? (
                        <Text style={styles.postContent} numberOfLines={2}>
                          {event.description}
                        </Text>
                      ) : null}

                      <Text style={styles.eventMeta}>📅 {dateLabel}</Text>
                      <Text style={styles.eventMeta}>🕐 {timeLabel}</Text>
                      <Text style={styles.eventMeta} numberOfLines={1}>
                        📍 {event.location || 'Location TBD'}
                      </Text>

                      {!isCompleted && event.meeting_link ? (
                        <TouchableOpacity
                          style={styles.joinBtn}
                          onPress={() => {
                            const link = event.meeting_link!;
                            if (link.startsWith('http://') || link.startsWith('https://')) {
                              require('react-native').Linking.openURL(link);
                            }
                          }}>
                          <Text style={styles.joinBtnText}>🎥 Join Meeting</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  );
                });
              })()}
            </>
          )}

          {getChannelType(channel.slug) === 'posts' && (
            <>
              <Text style={styles.sectionTitle}>Posts ({posts.length})</Text>
              {posts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No posts yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Be the first to create a post in this channel
                  </Text>
                </View>
              ) : (
                posts.map((post) => (
                  <View key={post.id} style={styles.postCard}>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    {post.content && <Text style={styles.postContent}>{post.content}</Text>}
                    <Text style={styles.postDate}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textSecondary,
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
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
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
  descriptionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  createPostCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  createPostTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createPostButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonPrimaryText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.onPrimary,
  },
  buttonSecondaryText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  postsSection: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.onPrimary,
  },
  emptyState: {
    padding: SPACING.xl * 2,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  postTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  linkHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  linkTag: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    borderRadius: RADIUS.md,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
  },
  linkTagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  postContent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  postDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
  },
  // Events
  eventsTabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventsTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  eventsTabActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  eventsTabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  eventsTabTextActive: {
    color: COLORS.primary,
  },
  eventCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  eventCardCompleted: {
    borderLeftColor: COLORS.textSecondary,
    opacity: 0.85,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  eventLevelBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  eventLevelBadgeDim: {
    backgroundColor: 'rgba(156,163,175,0.15)',
  },
  eventLevelText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  doneBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  doneBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  eventMeta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  joinBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  joinBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: COLORS.onPrimary || '#000',
  },
});
