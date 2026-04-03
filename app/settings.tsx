import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ShieldCheck, ChevronLeft, Info } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { useAIConsent } from '@/contexts/AIConsentContext';

export default function Settings() {
  const { consentStatus, isConsentGranted, grantConsent, denyConsent } = useAIConsent();

  const handleToggle = async (value: boolean) => {
    if (value) {
      // User wants to enable – show the privacy notice before granting
      const title = 'WeVysya AI & Privacy Notice';
      const message =
        'Your inputs (such as queries and interactions) are securely sent to OpenAI for processing. ' +
        'These inputs are used solely to generate responses and are not used for advertising or tracking.\n\n' +
        'By tapping "Accept", you grant explicit consent for this data processing.';

      if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n\n${message}`)) {
          await grantConsent();
        }
      } else {
        Alert.alert(title, message, [
          { text: 'Decline', style: 'cancel' },
          {
            text: 'Accept',
            onPress: async () => {
              await grantConsent();
            },
          },
        ]);
      }
    } else {
      // User wants to disable
      const title = 'Revoke AI Consent';
      const message =
        'Revoking consent will disable all AI features. You can re-enable them at any time from Settings.';

      if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n\n${message}`)) {
          await denyConsent();
        }
      } else {
        Alert.alert(title, message, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Revoke',
            style: 'destructive',
            onPress: async () => {
              await denyConsent();
            },
          },
        ]);
      }
    }
  };

  const statusLabel =
    consentStatus === 'accepted'
      ? 'Enabled'
      : consentStatus === 'declined'
      ? 'Disabled'
      : 'Not set';

  const statusColor =
    consentStatus === 'accepted'
      ? colors.accent_green_bright
      : colors.danger_red;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text_primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: AI & Privacy */}
        <Text style={styles.sectionLabel}>AI & Privacy</Text>

        <View style={styles.card}>
          {/* Icon + Title row */}
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={22} color={colors.accent_green_bright} strokeWidth={2} />
            </View>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardTitle}>WeVysya AI Data Processing</Text>
              <Text style={[styles.statusBadge, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
            <Switch
              value={isConsentGranted}
              onValueChange={handleToggle}
              trackColor={{
                false: colors.border_secondary,
                true: colors.accent_green_bright + '80',
              }}
              thumbColor={
                isConsentGranted ? colors.accent_green_bright : colors.text_muted
              }
            />
          </View>

          <View style={styles.divider} />

          {/* Privacy details */}
          <View style={styles.infoRow}>
            <Info size={14} color={colors.text_muted} strokeWidth={2} />
            <Text style={styles.infoText}>
              Your inputs (such as queries and interactions) are securely sent to
              OpenAI for processing.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Info size={14} color={colors.text_muted} strokeWidth={2} />
            <Text style={styles.infoText}>
              These inputs are used solely to generate responses and are{' '}
              <Text style={styles.infoTextBold}>not</Text> used for advertising or
              tracking.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Info size={14} color={colors.text_muted} strokeWidth={2} />
            <Text style={styles.infoText}>
              You can revoke this consent at any time by toggling the switch above.
              Disabling will turn off all AI features.
            </Text>
          </View>
        </View>

        {/* Consent action buttons */}
        {consentStatus !== 'accepted' && (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleToggle(true)}
            activeOpacity={0.8}
          >
            <ShieldCheck size={18} color={colors.bg_primary} strokeWidth={2} />
            <Text style={styles.acceptButtonText}>Grant AI Consent</Text>
          </TouchableOpacity>
        )}

        {consentStatus === 'accepted' && (
          <TouchableOpacity
            style={styles.revokeButton}
            onPress={() => handleToggle(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.revokeButtonText}>Revoke AI Consent</Text>
          </TouchableOpacity>
        )}

        {/* Notice footer */}
        <Text style={styles.footerNote}>
          WeVysya respects your privacy. You have full control over how your data is
          used for AI features.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg_primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_secondary,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: colors.text_primary,
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 80,
  },
  sectionLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: colors.text_muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.bg_secondary,
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border_secondary,
    marginBottom: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent_green_bright + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.text_primary,
  },
  statusBadge: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border_secondary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: colors.text_muted,
    lineHeight: 20,
  },
  infoTextBold: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.text_secondary,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent_green_bright,
    borderRadius: 16,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  acceptButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: colors.bg_primary,
  },
  revokeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.danger_red + '50',
    backgroundColor: colors.danger_red + '10',
    marginBottom: spacing.md,
  },
  revokeButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: colors.danger_red,
  },
  footerNote: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.text_muted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.md,
  },
});
