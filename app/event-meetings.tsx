import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  CalendarClock,
  ExternalLink,
  ScanLine,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, fontFamily } from '@/constants/theme';
import { EventsService, EventMeeting } from '@/services/eventsService';
import { format, isToday, isTomorrow } from 'date-fns';

type Tab = 'upcoming' | 'completed';

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, MMM d, yyyy');
}

function formatEventTime(timeStr: string | null): string {
  if (!timeStr) return 'Time TBD';
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return format(date, 'h:mm a');
}

function formatLevel(level: string): string {
  if (!level) return '';
  return level.charAt(0).toUpperCase() + level.slice(1).replace(/_/g, ' ');
}

export default function EventMeetings() {
  const params = useLocalSearchParams<{ eventId?: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [upcomingEvents, setUpcomingEvents] = useState<EventMeeting[]>([]);
  const [completedEvents, setCompletedEvents] = useState<EventMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(
    params.eventId ?? null
  );

  const loadEvents = useCallback(async () => {
    try {
      const [upcoming, completed] = await Promise.all([
        EventsService.getUpcomingEvents(),
        EventsService.getCompletedEvents(),
      ]);
      setUpcomingEvents(upcoming);
      setCompletedEvents(completed);

      // If deep-linked to a specific event that is in completed, switch tab
      if (params.eventId) {
        const inCompleted = completed.some((e) => e.id === params.eventId);
        if (inCompleted) setActiveTab('completed');
        else setActiveTab('upcoming');
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  }, [params.eventId]);

  useEffect(() => {
    setIsLoading(true);
    loadEvents().finally(() => setIsLoading(false));
  }, [loadEvents]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadEvents();
    setIsRefreshing(false);
  }, [loadEvents]);

  const handleJoinMeeting = (link: string) => {
    if (link.startsWith('http://') || link.startsWith('https://')) {
      Linking.openURL(link);
    }
  };

  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : completedEvents;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.text_primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Meetings</Text>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => router.push('/attendance-scan' as any)}
          activeOpacity={0.85}>
          <ScanLine size={18} color={colors.accent_green_bright} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.8}>
          <CalendarClock
            size={15}
            color={activeTab === 'upcoming' ? colors.accent_green_bright : colors.text_muted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'upcoming' && styles.tabLabelActive,
            ]}>
            Upcoming
          </Text>
          {upcomingEvents.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{upcomingEvents.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.8}>
          <CheckCircle
            size={15}
            color={activeTab === 'completed' ? colors.accent_green_bright : colors.text_muted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'completed' && styles.tabLabelActive,
            ]}>
            Completed
          </Text>
          {completedEvents.length > 0 && (
            <View style={[styles.tabBadge, styles.tabBadgeMuted]}>
              <Text style={styles.tabBadgeText}>{completedEvents.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent_green_bright} />
          <Text style={styles.loadingText}>Loading events…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent_green_bright}
              colors={[colors.accent_green_bright]}
            />
          }>
          {displayedEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Calendar
                size={48}
                color={colors.text_muted}
                style={{ marginBottom: spacing.md }}
              />
              <Text style={styles.emptyTitle}>
                No {activeTab === 'upcoming' ? 'upcoming' : 'completed'} events
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'upcoming'
                  ? 'New events will appear here once scheduled.'
                  : 'Past event records will appear here.'}
              </Text>
            </View>
          ) : (
            displayedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isCompleted={activeTab === 'completed'}
                isHighlighted={highlightedId === event.id}
                onJoin={handleJoinMeeting}
                onRead={() => setHighlightedId(null)}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

interface EventCardProps {
  event: EventMeeting;
  isCompleted: boolean;
  isHighlighted: boolean;
  onJoin: (link: string) => void;
  onRead: () => void;
}

function EventCard({ event, isCompleted, isHighlighted, onJoin, onRead }: EventCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, isHighlighted && styles.cardHighlighted]}
      activeOpacity={0.85}
      onPress={() => {
        onRead();
        router.push({ pathname: '/event-detail', params: { eventId: event.id } } as any);
      }}>
      {/* Status strip */}
      <View style={[styles.statusStrip, isCompleted ? styles.stripCompleted : styles.stripUpcoming]} />

      <View style={styles.cardBody}>
        {/* Level badge + title row */}
        <View style={styles.cardTitleRow}>
          <View style={[styles.levelBadge, isCompleted && styles.levelBadgeDim]}>
            <Text style={styles.levelBadgeText}>{formatLevel(event.event_level)}</Text>
          </View>
          {isCompleted && (
            <View style={styles.doneBadge}>
              <CheckCircle size={12} color={colors.accent_green_bright} />
              <Text style={styles.doneBadgeText}>Done</Text>
            </View>
          )}
        </View>

        {event.title ? (
          <Text style={styles.eventTitle}>{event.title}</Text>
        ) : null}

        {event.description ? (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>
        ) : null}

        {/* Details */}
        <View style={styles.detailRow}>
          <Calendar size={14} color={colors.accent_green_bright} />
          <Text style={styles.detailText}>{formatEventDate(event.event_date)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Clock size={14} color={colors.text_muted} />
          <Text style={styles.detailText}>{formatEventTime(event.event_time)}</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={14} color={colors.text_muted} />
          <Text style={styles.detailText} numberOfLines={1}>
            {event.location || 'Location TBD'}
          </Text>
        </View>

        {/* Join button */}
        {!isCompleted && event.meeting_link ? (
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={() => onJoin(event.meeting_link!)}
            activeOpacity={0.85}>
            <Video size={14} color={colors.bg_primary} />
            <Text style={styles.joinBtnText}>Join Meeting</Text>
            <ExternalLink size={12} color={colors.bg_primary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg_primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52,211,153,0.12)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52,211,153,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: colors.text_primary,
    textAlign: 'center',
  },
  scanBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52,211,153,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.2)',
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.bg_secondary,
    borderRadius: borderRadius.pill,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  tabActive: {
    backgroundColor: 'rgba(52,211,153,0.15)',
  },
  tabLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.text_muted,
  },
  tabLabelActive: {
    color: colors.accent_green_bright,
  },
  tabBadge: {
    backgroundColor: colors.accent_green_bright,
    borderRadius: borderRadius.pill,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeMuted: {
    backgroundColor: colors.text_muted,
  },
  tabBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: colors.bg_primary,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
  },

  // Loading / Empty
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.text_muted,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.text_secondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.text_muted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bg_card,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.1)',
  },
  cardHighlighted: {
    borderColor: colors.accent_green_bright,
    shadowColor: colors.accent_green_bright,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  statusStrip: {
    width: 4,
  },
  stripUpcoming: {
    backgroundColor: colors.accent_green_bright,
  },
  stripCompleted: {
    backgroundColor: colors.text_muted,
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  levelBadge: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderRadius: borderRadius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelBadgeDim: {
    backgroundColor: 'rgba(156,163,175,0.15)',
  },
  levelBadgeText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.accent_green_bright,
    textTransform: 'capitalize',
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(52,211,153,0.08)',
    borderRadius: borderRadius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  doneBadgeText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.accent_green_bright,
  },
  eventTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.text_primary,
    marginTop: 2,
    marginBottom: 2,
  },
  eventDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.text_muted,
    lineHeight: 18,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  detailText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.text_secondary,
    flex: 1,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    backgroundColor: colors.accent_green_bright,
    borderRadius: borderRadius.button,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  joinBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.bg_primary,
    flex: 1,
    textAlign: 'center',
  },
});
