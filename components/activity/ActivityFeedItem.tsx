import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  TrendingUp,
  FileText,
  UserPlus,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import type { Activity } from '@/types';

interface ActivityFeedItemProps {
  activity: Activity;
}

const ICON_MAP = {
  deal: TrendingUp,
  i2we: FileText,
  visitor: UserPlus,
  meeting: Calendar,
  suggestion: Sparkles,
};

export default function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
  const IconComponent = ICON_MAP[activity.type];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconComponent size={20} color={colors.accent_green_bright} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.message}>{activity.message}</Text>
        <Text style={styles.timestamp}>{activity.timestamp}</Text>

        {activity.action_label && (
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Text style={styles.actionButtonText}>{activity.action_label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bg_card,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.15)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.text_secondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.text_secondary,
    marginBottom: spacing.sm,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.button,
    backgroundColor: colors.accent_green_bright,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.bg_primary,
  },
});
