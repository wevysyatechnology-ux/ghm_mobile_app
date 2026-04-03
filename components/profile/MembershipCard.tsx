import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Award, Calendar, ArrowUpRight, X } from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import type { User } from '@/types';

interface MembershipCardProps {
  user: User;
}

export default function MembershipCard({ user }: MembershipCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const circleText =
    user.circle === 'inner' ? 'Inner Circle' : 'Open Circle';
  const tierText = user.tier.charAt(0).toUpperCase() + user.tier.slice(1);

  const canUpgrade = user.circle === 'open' || user.tier === 'regular';

  const handleSubmit = () => {
    if (!name || !phone || !email) {
      if (Platform.OS === 'web') {
        window.alert("Please fill all fields");
      } else {
        Alert.alert("Error", "Please fill all fields");
      }
      return;
    }
    
    if (Platform.OS === 'web') {
      window.alert("Upgrade Membership request has been submitted successfully");
      setModalVisible(false);
      setName('');
      setPhone('');
      setEmail('');
    } else {
      Alert.alert("Success", "Upgrade Membership request has been submitted successfully", [
        {
          text: "OK",
          onPress: () => {
            setModalVisible(false);
            setName('');
            setPhone('');
            setEmail('');
          }
        }
      ]);
    }
  };

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
            <TouchableOpacity style={styles.upgradeButton} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
              <Text style={styles.upgradeButtonText}>Upgrade Membership</Text>
              <ArrowUpRight size={16} color={colors.bg_primary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upgrade Membership</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text_primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={colors.text_secondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.text_secondary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.text_secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.lg,
    color: colors.text_primary,
    marginBottom: spacing.xs,
  },
  tier: {
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.md,
    color: colors.bg_primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bg_primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.xl,
    color: colors.text_primary,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.sm,
    color: colors.text_secondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: '#1A1F1E',
    borderWidth: 1,
    borderColor: '#2A2F2E',
    borderRadius: borderRadius.button,
    padding: spacing.md,
    color: colors.text_primary,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize.md,
  },
  submitButton: {
    backgroundColor: colors.accent_green,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.md,
    color: colors.bg_primary,
  },
});
