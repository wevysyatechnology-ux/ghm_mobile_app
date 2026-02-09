import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, User, Flame } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { LinksService } from '@/services/linksService';
import { UserProfile } from '@/types/database';

export default function LinksForm() {
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
      const data = await LinksService.getUserHouses();
      setHouses(data);
      if (data.length > 0) {
        setSelectedHouse(data[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load houses');
    }
  };

  const loadHouseMembers = async () => {
    if (!selectedHouse) return;
    try {
      const members = await LinksService.getHouseMembers(selectedHouse.id);
      setHouseMembers(members);
    } catch (error) {
      Alert.alert('Error', 'Failed to load members');
    }
  };

  const handleSubmit = async () => {
    if (!selectedMember || !selectedHouse) {
      Alert.alert('Error', 'Please select a house member');
      return;
    }

    if (!formData.title || !formData.contact_name || !formData.contact_phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await LinksService.createLink({
        to_user_id: selectedMember.id,
        house_id: selectedHouse.id,
        title: formData.title,
        description: formData.description,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        urgency: formData.urgency,
      });

      Alert.alert('Success', 'Link sent successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create link');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
          <View style={styles.memberList}>
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
          </View>
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
});
