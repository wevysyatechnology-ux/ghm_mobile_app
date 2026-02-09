import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '@/constants/theme';
import ActivityFeedItem from '@/components/activity/ActivityFeedItem';
import AIEmptyState from '@/components/shared/AIEmptyState';
import FloatingLogo from '@/components/shared/FloatingLogo';

export default function Activity() {
  const mockActivities = [
    {
      id: '1',
      type: 'deal' as const,
      title: 'New Deal Posted',
      message: 'Ramesh Kumar posted a manufacturing deal',
      timestamp: '2 hours ago',
      action_label: 'View',
    },
    {
      id: '2',
      type: 'meeting' as const,
      title: 'Upcoming Meeting',
      message: 'Monthly Inner Circle meet in 2 days',
      timestamp: '5 hours ago',
      action_label: 'Details',
    },
    {
      id: '3',
      type: 'suggestion' as const,
      title: 'AI Suggestion',
      message: 'You might want to connect with 3 new members',
      timestamp: '1 day ago',
      action_label: 'View',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <FloatingLogo size="medium" />
          <Text style={styles.header}>Activity</Text>
        </View>

        {mockActivities.length > 0 ? (
          mockActivities.map((activity) => (
            <ActivityFeedItem key={activity.id} activity={activity} />
          ))
        ) : (
          <AIEmptyState message="Want me to suggest people you should connect with?" />
        )}
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
    paddingHorizontal: spacing.xl,
  },
  headerContainer: {
    marginBottom: spacing.xxl,
  },
  header: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.text_primary,
    letterSpacing: -1,
    marginTop: spacing.lg,
  },
});
