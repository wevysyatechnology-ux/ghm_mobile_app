import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, User, Calendar } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { I2WEService } from '@/services/i2weService';
import { LinksService } from '@/services/linksService';
import { UserProfile } from '@/types/database';

export default function I2WEForm() {
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<any>(null);
  const [houseMembers, setHouseMembers] = useState<UserProfile[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  const [formData, setFormData] = useState({
    meeting_date: '',
    notes: '',
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
      const members = await I2WEService.getHouseMembers(selectedHouse.id);
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

    if (!formData.meeting_date) {
      Alert.alert('Error', 'Please select a meeting date');
      return;
    }

    try {
      await I2WEService.createMeeting({
        member_2_id: selectedMember.id,
        house_id: selectedHouse.id,
        meeting_date: formData.meeting_date,
        notes: formData.notes,
      });

      Alert.alert('Success', 'Meeting scheduled successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule meeting');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text_primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule I2WE Meeting</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>I2WE - I to WE</Text>
          <Text style={styles.infoDescription}>
            Connect 1-on-1 with fellow house members to build meaningful business relationships
          </Text>
        </View>

        <Text style={styles.label}>
          Meet with <Text style={styles.required}>*</Text>
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
          Meeting Date <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.dateInputContainer}>
          <Calendar size={20} color={colors.text_secondary} />
          <TextInput
            style={styles.dateInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.text_tertiary}
            value={formData.meeting_date}
            onChangeText={(text) => setFormData({ ...formData, meeting_date: text })}
          />
        </View>
        <Text style={styles.hint}>Format: YYYY-MM-DD (e.g., 2024-12-25)</Text>

        <Text style={styles.label}>Meeting Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add meeting agenda, topics to discuss..."
          placeholderTextColor={colors.text_tertiary}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          maxLength={500}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Schedule Meeting</Text>
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
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent_blue,
    marginBottom: spacing.sm,
  },
  infoDescription: {
    fontSize: 14,
    color: colors.text_secondary,
    lineHeight: 20,
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card_background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text_primary,
  },
  hint: {
    fontSize: 12,
    color: colors.text_tertiary,
    marginTop: spacing.xs,
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
