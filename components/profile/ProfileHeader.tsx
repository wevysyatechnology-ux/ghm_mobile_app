import { View, Text, StyleSheet, Image } from 'react-native';
import { User as UserIcon } from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import type { User } from '@/types';

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const getBadgeColor = () => {
    if (user.tier === 'privileged') return '#FFD700';
    if (user.tier === 'regular') return colors.accent_green;
    return colors.text_secondary;
  };

  const getTierLabel = () => {
    return user.tier.charAt(0).toUpperCase() + user.tier.slice(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {user.profile_photo ? (
          <Image source={{ uri: user.profile_photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <UserIcon size={48} color={colors.text_secondary} />
          </View>
        )}
        {user.is_online && <View style={styles.onlineIndicator} />}
      </View>

      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.category}>{user.category}</Text>
      <Text style={styles.location}>{user.location}</Text>

      <View style={[styles.badge, { backgroundColor: getBadgeColor() + '20' }]}>
        <Text style={[styles.badgeText, { color: getBadgeColor() }]}>
          {getTierLabel()} Member
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.bg_card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent_green_bright,
    borderWidth: 3,
    borderColor: colors.bg_primary,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text_primary,
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: fontSize.md,
    color: colors.accent_green_bright,
    marginBottom: spacing.xs,
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.text_secondary,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.button,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
