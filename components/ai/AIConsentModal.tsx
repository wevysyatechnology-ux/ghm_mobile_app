import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useAIConsent } from '@/contexts/AIConsentContext';
import { colors, spacing } from '@/constants/theme';

export default function AIConsentModal() {
  const { showModal, grantConsent, denyConsent } = useAIConsent();

  return (
    <Modal visible={showModal} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <View style={styles.iconBg}>
              <ShieldCheck size={28} color={colors.accent_green_bright} strokeWidth={1.8} />
            </View>
          </View>

          <Text style={styles.title}>WeVysya AI & Privacy Notice</Text>

          <ScrollView
            style={styles.bodyScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyContent}>
            <Text style={styles.body}>
              WeVysya AI uses OpenAI to provide intelligent recommendations and insights.
              {'\n\n'}
              When you use these features, your inputs (such as queries and interactions) are
              securely sent to OpenAI for processing. These inputs are used solely to generate
              responses and are not used for advertising or tracking.
              {'\n\n'}
              By tapping "Accept", you grant explicit consent for this data processing. You can
              manage this permission at any time in Settings.
            </Text>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.declineButton} onPress={denyConsent} activeOpacity={0.8}>
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={grantConsent} activeOpacity={0.8}>
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: '#0d1a17',
    borderRadius: 24,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.accent_green_bright + '30',
    shadowColor: colors.accent_green_bright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent_green_bright + '18',
    borderWidth: 1.5,
    borderColor: colors.accent_green_bright + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: colors.text_primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: colors.text_muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  bodyScroll: {
    maxHeight: 180,
  },
  bodyContent: {
    paddingBottom: spacing.sm,
  },
  body: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.text_secondary,
    lineHeight: 22,
    textAlign: 'left',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  declineButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border_secondary,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  declineText: {
    fontFamily: 'Poppins-Medium',
    color: colors.text_muted,
    fontSize: 15,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.accent_green_bright,
    alignItems: 'center',
  },
  acceptText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.bg_primary,
    fontSize: 15,
  },
});
