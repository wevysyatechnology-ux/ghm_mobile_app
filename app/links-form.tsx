import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, User, Flame } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { LinksService } from '@/services/linksService';
import { UserProfile } from '@/types/database';
import { sendLinkReceivedNotification } from '@/utils/notificationHelpers';
import { useAuth } from '@/contexts/AuthContext';

export default function LinksForm() {
  const { profile } = useAuth();
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<any>(null);
  const [houseMembers, setHouseMembers] = useState<UserProfile[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    urgency: 1,
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
      
      if (members.length === 0) {
        Alert.alert(
          'No Members Found',
          'There are no other members in this house to send a link to. Please contact your house administrator.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Error loading house members:', error);
      Alert.alert(
        'Error',
        `Failed to load members: ${error.message || 'Unknown error'}. Check console for details.`
      );
    }
  }

  const handleSubmit = async () => {
    console.log('Submit button clicked');
    console.log('Selected member:', selectedMember);
    console.log('Form data:', formData);

    if (!selectedMember) {
      Alert.alert('Error', 'Please select a house member');
      return;
    }

    if (!formData.title || !formData.contact_name || !formData.contact_phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      console.log('Creating link...');
      const result = await LinksService.createLink({
        to_user_id: selectedMember.id,
        title: formData.title,
        description: formData.description,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        urgency: formData.urgency,
      });
      console.log('Link created successfully:', result);

      // Send notification to the recipient
      if (profile && selectedHouse) {
        await sendLinkReceivedNotification({
          recipientId: selectedMember.id,
          linkId: result?.id || '',
          senderName: profile.full_name || 'A member',
          senderId: profile.id,
          houseName: selectedHouse.house_name || 'Your House',
          houseId: selectedHouse.id,
          linkType: 'business',
        });
      }

      // Clear form
      setFormData({
        title: '',
        description: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        urgency: 1,
      });
      setSelectedMember(null);

      Alert.alert('Success', 'Link sent successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating link:', error);
      Alert.alert('Error', `Failed to create link: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text_primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Links Form</Text>
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
            {houseMembers.length === 0 ? (
              <View style={styles.emptyMemberList}>
                <Text style={styles.emptyMemberText}>
                  No other members found in this house
                </Text>
              </View>
            ) : (
              houseMembers.map((member) => (
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
              ))
            )}
          </ScrollView>
        )}

        <Text style={styles.label}>
          Title <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Task Header"
          placeholderTextColor={colors.text_tertiary}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Task Description"
          placeholderTextColor={colors.text_tertiary}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          maxLength={500}
        />
        <Text style={styles.charCount}>{formData.description.length}/500</Text>

        <Text style={styles.label}>
          Contact's Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Contact's Name"
          placeholderTextColor={colors.text_tertiary}
          value={formData.contact_name}
          onChangeText={(text) => setFormData({ ...formData, contact_name: text })}
        />

        <Text style={styles.label}>
          Contact's Phone Number <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Contact's Phone Number"
          placeholderTextColor={colors.text_tertiary}
          value={formData.contact_phone}
          onChangeText={(text) => setFormData({ ...formData, contact_phone: text })}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Contact's Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Contact's Email"
          placeholderTextColor={colors.text_tertiary}
          value={formData.contact_email}
          onChangeText={(text) => setFormData({ ...formData, contact_email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>
          Urgency of Requirement <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.urgencyContainer}>
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setFormData({ ...formData, urgency: level })}
              style={[
                styles.urgencyButton,
                formData.urgency >= level && styles.urgencyButtonActive,
              ]}>
              <Flame
                size={24}
                color={formData.urgency >= level ? colors.accent_red : colors.text_tertiary}
                fill={formData.urgency >= level ? colors.accent_red : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
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
  charCount: {
    fontSize: 12,
    color: colors.text_tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
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
  urgencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  urgencyButton: {
    padding: spacing.sm,
  },
  urgencyButtonActive: {
    opacity: 1,
  },
  submitButton: {
    backgroundColor: colors.accent_blue,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text_primary,
  },
  emptyMemberList: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyMemberText: {
    fontSize: 14,
    color: colors.text_tertiary,
    textAlign: 'center',
  },
});
