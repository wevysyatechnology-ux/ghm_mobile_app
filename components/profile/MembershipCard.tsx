import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Award, Calendar, ArrowUpRight } from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import type { User } from '@/types';

interface MembershipCardProps {
  user: User;
}

export default function MembershipCard({ user }: MembershipCardProps) {
  const circleText =
    user.circle === 'inner' ? 'Inner Circle' : 'Open Circle';
  const tierText = user.tier.charAt(0).toUpperCase() + user.tier.slice(1);

  const canUpgrade = user.circle === 'open' || user.tier === 'regular';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Membership</Text>

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Award size={24} color={colors.accent_green} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.circle}>{circleText}</Text>
            <Text style={styles.tier}>{tierText} Member</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Calendar size={16} color={colors.text_secondary} />
          <Text style={styles.infoText}>
            Member since {new Date(user.created_at).getFullYear()}
          </Text>
        </View>

        {canUpgrade && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.upgradeButton} activeOpacity={0.7}>
              <Text style={styles.upgradeButtonText}>Upgrade Membership</Text>
              <ArrowUpRight size={16} color={colors.bg_primary} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: '#1A1F1E',
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#2A2F2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent_green + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  circle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: spacing.xs,
  },
  tier: {
    fontSize: fontSize.sm,
    color: colors.text_secondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2F2E',
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.text_secondary,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent_green,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    gap: spacing.xs,
  },
  upgradeButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.bg_primary,
  },
});
