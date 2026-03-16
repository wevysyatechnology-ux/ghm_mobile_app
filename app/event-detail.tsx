import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  ExternalLink,
  AlertCircle,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, fontFamily } from '@/constants/theme';
import { EventsService, EventMeeting } from '@/services/eventsService';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEEE, MMMM d, yyyy');
}

function formatEventTime(timeStr: string | null): string {
  if (!timeStr) return 'Time TBD';
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return format(d, 'h:mm a');
}

export default function EventDetail() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventMeeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    EventsService.getEventById(eventId)
      .then((data) => {
        if (data) setEvent(data);
        else setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [eventId]);

  const isCompleted = event
    ? isPast(new Date(event.event_date + 'T23:59:59'))
    : false;

  const handleJoin = () => {
    if (!event?.meeting_link) return;
    const link = event.meeting_link;
    if (link.startsWith('http://') || link.startsWith('https://')) {
      Linking.openURL(link);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.text_primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Detail</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent_green_bright} />
        </View>
      ) : notFound || !event ? (
        <View style={styles.centered}>
          <AlertCircle size={48} color={colors.text_muted} />
          <Text style={styles.notFoundText}>Event not found</Text>
          <TouchableOpacity
            style={styles.backToListBtn}
            onPress={() => router.push('/event-meetings' as any)}>
            <Text style={styles.backToListText}>View All Events</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          <View style={[styles.statusBanner, isCompleted ? styles.bannerCompleted : styles.bannerUpcoming]}>
            {isCompleted ? (
              <CheckCircle size={16} color={colors.text_muted} />
            ) : (
              <Calendar size={16} color={colors.accent_green_bright} />
            )}
            <Text style={[styles.statusText, isCompleted && styles.statusTextDim]}>
              {isCompleted ? 'Completed' : 'Upcoming Event'}
            </Text>
          </View>

          {/* Level badge */}
          <View style={styles.levelRow}>
            <View style={[styles.levelBadge, isCompleted && styles.levelBadgeDim]}>
              <Text style={[styles.levelBadgeText, isCompleted && styles.levelBadgeTextDim]}>
                {event.event_level
                  ? event.event_level.charAt(0).toUpperCase() +
                    event.event_level.slice(1).replace(/_/g, ' ')
                  : 'Event'}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {event.title || `Event – ${formatEventDate(event.event_date)}`}
          </Text>

          {/* Description */}
          {event.description ? (
            <Text style={styles.description}>{event.description}</Text>
          ) : null}

          {/* Detail cards */}
          <View style={styles.detailsCard}>
            <DetailRow
              icon={<Calendar size={18} color={colors.accent_green_bright} />}
              label="Date"
              value={formatEventDate(event.event_date)}
            />
            <Divider />
            <DetailRow
              icon={<Clock size={18} color={colors.accent_green_bright} />}
              label="Time"
              value={formatEventTime(event.event_time)}
            />
            <Divider />
            <DetailRow
              icon={<MapPin size={18} color={colors.accent_green_bright} />}
              label="Location"
              value={event.location || 'Location TBD'}
            />
            {event.meeting_link ? (
              <>
                <Divider />
                <DetailRow
                  icon={<Video size={18} color={colors.accent_green_bright} />}
                  label="Meeting Link"
                  value={event.meeting_link}
                  onPress={handleJoin}
                  isLink
                />
              </>
            ) : null}
          </View>

          {/* Join button */}
          {!isCompleted && event.meeting_link ? (
            <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} activeOpacity={0.85}>
              <Video size={16} color={colors.bg_primary} />
              <Text style={styles.joinBtnText}>Join Meeting</Text>
              <ExternalLink size={14} color={colors.bg_primary} />
            </TouchableOpacity>
          ) : null}

          {/* View all events */}
          <TouchableOpacity
            style={styles.allEventsBtn}
            onPress={() => router.push('/event-meetings' as any)}
            activeOpacity={0.8}>
            <Text style={styles.allEventsBtnText}>View All Events</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
  onPress,
  isLink,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
  isLink?: boolean;
}) {
  const inner = (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text
          style={[styles.detailValue, isLink && styles.detailValueLink]}
          numberOfLines={isLink ? 1 : undefined}>
          {value}
        </Text>
      </View>
      {isLink && <ExternalLink size={14} color={colors.accent_green_bright} />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

function Divider() {
  return <View style={styles.divider} />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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
  headerSpacer: { width: 36 },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  notFoundText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.text_muted,
  },

  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },

  // Status banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  bannerUpcoming: {
    backgroundColor: 'rgba(52,211,153,0.12)',
  },
  bannerCompleted: {
    backgroundColor: 'rgba(156,163,175,0.12)',
  },
  statusText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.accent_green_bright,
  },
  statusTextDim: {
    color: colors.text_muted,
  },

  // Level badge
  levelRow: {
    marginBottom: spacing.sm,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  levelBadgeDim: {
    backgroundColor: 'rgba(156,163,175,0.1)',
  },
  levelBadgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    color: colors.accent_green_bright,
    textTransform: 'capitalize',
  },
  levelBadgeTextDim: {
    color: colors.text_muted,
  },

  // Title / description
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.text_primary,
    marginBottom: spacing.sm,
    lineHeight: 32,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text_secondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },

  // Details card
  detailsCard: {
    backgroundColor: colors.bg_card,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.1)',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(52,211,153,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: { flex: 1 },
  detailLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.text_muted,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.text_primary,
  },
  detailValueLink: {
    color: colors.accent_green_bright,
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(52,211,153,0.08)',
    marginHorizontal: spacing.md,
  },

  // Join button
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent_green_bright,
    borderRadius: borderRadius.button,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  joinBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.bg_primary,
    flex: 1,
    textAlign: 'center',
  },

  // View all events
  allEventsBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  allEventsBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.accent_green_bright,
  },

  backToListBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  backToListText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.accent_green_bright,
  },
});
