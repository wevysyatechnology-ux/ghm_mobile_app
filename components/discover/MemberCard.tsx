import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Phone, User as UserIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import type { User } from '@/types';

interface MemberCardProps {
  member: User;
}

export default function MemberCard({ member }: MemberCardProps) {
  const router = useRouter();
  const canCall = member.circle === 'inner';

  const handleCall = () => {
    if (canCall) {
      router.push({
        pathname: '/call',
        params: {
          name: member.name,
          photo: member.profile_photo || '',
        },
      });
    }
  };

  const getBadgeColor = () => {
    if (member.tier === 'privileged') return '#FFD700';
    if (member.tier === 'regular') return colors.accent_green;
    return colors.text_secondary;
  };

  const getTierLabel = () => {
    return member.tier.charAt(0).toUpperCase() + member.tier.slice(1);
  };

  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        {member.profile_photo ? (
          <Image
            source={{ uri: member.profile_photo }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <UserIcon size={32} color={colors.text_secondary} />
          </View>
        )}
        {member.is_online && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {member.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {member.category}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {member.location}
        </Text>
        <View
          style={[styles.badge, { backgroundColor: getBadgeColor() + '20' }]}>
          <Text style={[styles.badgeText, { color: getBadgeColor() }]}>
            {getTierLabel()}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.viewButton}
          activeOpacity={0.7}>
          <Text style={styles.viewButtonText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.callButton,
            !canCall && styles.callButtonDisabled,
          ]}
          disabled={!canCall}
          onPress={handleCall}
          activeOpacity={0.7}>
          <Phone
            size={16}
            color={canCall ? colors.bg_primary : colors.text_secondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: colors.bg_card,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.15)',
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bg_secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent_green_bright,
    borderWidth: 2,
    borderColor: colors.bg_card,
  },
  info: {
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: fontSize.sm,
    color: colors.text_secondary,
    marginBottom: spacing.xs,
  },
  location: {
    fontSize: fontSize.xs,
    color: colors.text_secondary,
    marginBottom: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.button,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.button,
    backgroundColor: colors.accent_green_bright,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.bg_primary,
  },
  callButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.button,
    backgroundColor: colors.accent_green_bright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonDisabled: {
    backgroundColor: colors.bg_secondary,
  },
});
