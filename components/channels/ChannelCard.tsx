import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Link as LinkIcon,
  Handshake,
  Users,
  UserPlus,
  Briefcase,
  TrendingUp,
  HelpCircle,
  Megaphone,
  Bell,
  User,
} from 'lucide-react-native';
import { Channel } from '@/types/database';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '@/constants/theme';

interface ChannelCardProps {
  channel: Channel;
  onPress: (channel: Channel) => void;
  isPriority?: boolean;
}

const getChannelIcon = (channel: Channel) => {
  const slug = (channel.slug || '').toLowerCase();
  const name = (channel.name || '').toLowerCase();

  if (slug.includes('link') || name.includes('link')) return LinkIcon;
  if (slug.includes('deal') || name.includes('deal')) return Handshake;
  if (
    slug.includes('i2we') ||
    slug.includes('12we') ||
    slug.includes('meeting') ||
    name.includes('i2we') ||
    name.includes('meeting')
  ) {
    return Users;
  }
  if (slug.includes('visitor') || name.includes('visitor')) return UserPlus;
  if (slug.includes('job') || name.includes('job')) return Briefcase;
  if (slug.includes('opportun') || name.includes('opportun')) return TrendingUp;
  if (slug.includes('ask') || name.includes('ask')) return HelpCircle;
  if (slug.includes('announc') || name.includes('announc')) return Megaphone;
  if (slug.includes('notif') || name.includes('notif')) return Bell;

  return User;
};

export function ChannelCard({ channel, onPress, isPriority }: ChannelCardProps) {
  const IconComponent = getChannelIcon(channel);

  return (
    <TouchableOpacity
      style={[styles.card, isPriority && styles.priorityCard]}
      onPress={() => onPress(channel)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isPriority && styles.priorityIconContainer]}>
        <IconComponent size={26} color={COLORS.primary} />
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
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  priorityTitle: {
    fontFamily: 'Poppins-Bold',
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
