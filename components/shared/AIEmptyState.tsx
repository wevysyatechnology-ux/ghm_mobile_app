import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

interface AIEmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function AIEmptyState({
  message,
  actionLabel,
  onAction,
}: AIEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Sparkles size={32} color={colors.accent_green} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.7}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent_green + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  message: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text_primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  actionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
    backgroundColor: colors.accent_green,
  },
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.bg_primary,
  },
});
