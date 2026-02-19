import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, User } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { DealsService } from '@/services/dealsService';
import { LinksService } from '@/services/linksService';
import { UserProfile } from '@/types/database';
import { sendDealRecordedNotification } from '@/utils/notificationHelpers';
import { useAuth } from '@/contexts/AuthContext';

export default function DealsForm() {
  const { profile } = useAuth();
  const [selectedMember, setSelectedMember] = useState<UserProfile | { id: 'wevysya', full_name: 'WeVysya' } | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<any>(null);
  const [houseMembers, setHouseMembers] = useState<UserProfile[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
  });

  useEffect(() => {
    loadUserHouses();
  }, []);

  useEffect(() => {
    if (selectedHouse) {
      loadHouseMembers();
    }
  }, [selectedHouse]);

  const loadUserHouses = async () => {
    try {
      console.log('🏠 Loading user houses...');
      const data = await LinksService.getUserHouses();
      console.log('✅ Houses loaded:', data.length);
      
      if (data.length === 0) {
        Alert.alert(
          'No House Found',
          'You are not assigned to a house yet. Please contact your administrator.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setHouses(data);
      if (data.length > 0) {
        setSelectedHouse(data[0]);
      }
    } catch (error) {
      console.error('❌ Error in loadUserHouses:', error);
      Alert.alert(
        'Error',
        'Failed to load houses. Please check your profile setup.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadHouseMembers = async () => {
    if (!selectedHouse) return;
    try {
      console.log('👥 Loading members for house:', selectedHouse.house_name || selectedHouse.id);
      const members = await LinksService.getHouseMembers(selectedHouse.id);
      console.log('✅ Members loaded:', members.length);
      setHouseMembers(members);
    } catch (error) {
      console.error('❌ Error loading house members:', error);
      Alert.alert(
        'Error',
        `Failed to load members. Please try again.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleSubmit = async () => {
    if (!selectedMember) {
      Alert.alert('Error', 'Please select a member or WeVysya');
      return;
    }

    if (!formData.title || !formData.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const isWeVysyaDeal = selectedMember.id === 'wevysya';

    try {
      const result = await DealsService.createDeal({
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        deal_type: isWeVysyaDeal ? 'wevysya_deal' : 'house_deal',
      });

      // Send notification to the member (if not WeVysya deal)
      if (!isWeVysyaDeal && selectedMember.id && profile) {
        await sendDealRecordedNotification({
          recipientId: selectedMember.id,
          dealId: result?.id || '',
          memberName: profile.full_name || 'A member',
          memberId: profile.id,
          amount: parseFloat(formData.amount),
          currency: '₹',
          dealType: 'house_deal',
        });
      }

      // Clear form
      setFormData({
        title: '',
        description: '',
        amount: '',
      });
      setSelectedMember(null);

      Alert.alert('Success', 'Deal created successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating deal:', error);
      Alert.alert('Error', `Failed to create deal: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text_primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Deal</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>
          Send to <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowMemberPicker(!showMemberPicker)}>
          <User size={20} color={colors.text_secondary} />
          <Text style={styles.pickerText}>
            {selectedMember ? selectedMember.full_name : 'Choose Member'}
          </Text>
        </TouchableOpacity>

        {showMemberPicker && (
          <ScrollView style={styles.memberList}>
            {houseMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.memberItem}
                onPress={() => {
                  setSelectedMember(member);
                  setShowMemberPicker(false);
                }}>
                <Text style={styles.memberName}>{member.full_name}</Text>
                <Text style={styles.memberDetails}>
                  {member.business_category} • {member.city}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.memberItem}
              onPress={() => {
                setSelectedMember({ id: 'wevysya', full_name: 'WeVysya' });
                setShowMemberPicker(false);
              }}>
              <Text style={styles.memberName}>WeVysya</Text>
              <Text style={styles.memberDetails}>Open to all WeVysya members</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        <Text style={styles.label}>
          Title <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Deal Title"
          placeholderTextColor={colors.text_tertiary}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Deal Description"
          placeholderTextColor={colors.text_tertiary}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          maxLength={500}
        />

        <Text style={styles.label}>
          Amount <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Deal Amount"
          placeholderTextColor={colors.text_tertiary}
          value={formData.amount}
          onChangeText={(text) => setFormData({ ...formData, amount: text })}
          keyboardType="decimal-pad"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Deal</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    backgroundColor: colors.card_background,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text_primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text_secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  required: {
    color: colors.accent_red,
  },
  input: {
    backgroundColor: colors.card_background,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text_primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card_background,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerText: {
    fontSize: 16,
    color: colors.text_secondary,
    marginLeft: spacing.md,
  },
  memberList: {
    backgroundColor: colors.card_background,
    borderRadius: 12,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: 200,
  },
  memberItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: spacing.xs,
  },
  memberDetails: {
    fontSize: 14,
    color: colors.text_tertiary,
  },
  submitButton: {
    backgroundColor: colors.accent_green_bright,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});
