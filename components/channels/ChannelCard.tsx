import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Channel } from '@/types/database';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '@/constants/theme';

interface ChannelCardProps {
  channel: Channel;
  onPress: (channel: Channel) => void;
  isPriority?: boolean;
}

export function ChannelCard({ channel, onPress, isPriority }: ChannelCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, isPriority && styles.priorityCard]}
      onPress={() => onPress(channel)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isPriority && styles.priorityIconContainer]}>
        <Text style={styles.icon}>{channel.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, isPriority && styles.priorityTitle]}>{channel.name}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {channel.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityCard: {
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  priorityIconContainer: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  priorityTitle: {
    fontWeight: '700',
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
