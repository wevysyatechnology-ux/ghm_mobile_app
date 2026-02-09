import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import PressableScale from '@/components/shared/PressableScale';

interface SmartPromptChipsProps {
  onPromptPress: (prompt: string) => void;
}

const PROMPTS = [
  { text: 'Find a CA in Bengaluru', icon: true, route: '/(tabs)/discover' },
  { text: 'Post a deal', icon: true, route: '/deals-form' },
  { text: 'Invite a visitor', icon: true, route: '/i2we-form' },
  { text: 'Call a member', icon: true, route: '/call' },
];

export default function SmartPromptChips({
  onPromptPress,
}: SmartPromptChipsProps) {
  const handlePress = (prompt: typeof PROMPTS[0]) => {
    if (prompt.route) {
      router.push(prompt.route as any);
    } else {
      onPromptPress(prompt.text);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {PROMPTS.map((prompt, index) => (
          <PressableScale
            key={index}
            onPress={() => handlePress(prompt)}
            scaleValue={0.95}>
            <LinearGradient
              colors={['rgba(26, 31, 28, 0.8)', 'rgba(15, 19, 16, 0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.chip}>
              {prompt.icon && (
                <Sparkles size={14} color={colors.accent_green_bright} />
              )}
              <Text style={styles.chipText}>{prompt.text}</Text>
            </LinearGradient>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  scrollContent: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    shadowColor: colors.accent_green_bright,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text_primary,
    letterSpacing: 0.2,
  },
});
