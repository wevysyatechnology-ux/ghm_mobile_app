import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Sparkles, Users, TrendingUp } from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import { useAIConsent } from '@/contexts/AIConsentContext';

const ACTIONS = [
  {
    icon: Sparkles,
    label: 'Improve my profile',
    description: 'AI suggestions to enhance visibility',
  },
  {
    icon: Users,
    label: 'Suggest connections',
    description: 'Find members you should meet',
  },
  {
    icon: TrendingUp,
    label: 'How am I performing?',
    description: 'Get insights on your engagement',
  },
];

export default function AIProfileActions() {
  const { isConsentGranted, consentStatus, requestConsent } = useAIConsent();

  const handleActionPress = () => {
    if (isConsentGranted) {
      // AI feature logic will be implemented here
      return;
    }
    if (consentStatus === 'declined') {
      const msg = 'AI features are disabled. To enable them, go to Settings and accept the AI consent.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('AI Features Disabled', msg);
      return;
    }
    requestConsent();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Insights</Text>
      {ACTIONS.map((action, index) => {
        const IconComponent = action.icon;
        return (
          <TouchableOpacity
            key={index}
            style={[styles.actionCard, !isConsentGranted && styles.actionCardDisabled]}
            onPress={handleActionPress}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <IconComponent size={20} color={colors.accent_green} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>{action.label}</Text>
              <Text style={styles.description}>{action.description}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.lg,
    color: colors.text_primary,
    marginBottom: spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F1E',
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#2A2F2E',
  },
  actionCardDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent_green + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.md,
    color: colors.text_primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize.sm,
    color: colors.text_secondary,
  },
});
