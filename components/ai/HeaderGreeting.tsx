import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '@/constants/theme';
import FloatingLogo from '@/components/shared/FloatingLogo';

interface HeaderGreetingProps {
  user: {
    name: string;
    circle: 'inner' | 'open';
    tier: 'regular' | 'privileged' | 'virtual';
  };
}

export default function HeaderGreeting({ user }: HeaderGreetingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const circleText = user.circle === 'inner' ? 'Inner Circle' : 'Open Circle';
  const tierText =
    user.tier.charAt(0).toUpperCase() + user.tier.slice(1);

  return (
    <View style={styles.container}>
      <FloatingLogo size="large" />

      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.userName}>{user.name}</Text>
      </View>

      <View style={styles.badgeContainer}>
        <LinearGradient
          colors={['rgba(52, 211, 153, 0.2)', 'rgba(16, 185, 129, 0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>
            {circleText} · {tierText}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  greetingContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.text_primary,
    lineHeight: 50,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 56,
    color: colors.accent_green_bright,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent_green_bright,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent_green_bright,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
