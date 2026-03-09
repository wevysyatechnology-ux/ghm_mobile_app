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
import { useState, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, User, Calendar } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, spacing } from '@/constants/theme';
import { I2WEService } from '@/services/i2weService';
import { LinksService } from '@/services/linksService';
import { UserProfile } from '@/types/database';
import { sendI2WEMeetingRecordedNotification } from '@/utils/notificationHelpers';
import { useAuth } from '@/contexts/AuthContext';

export default function I2WEForm() {
  const { profile } = useAuth();
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<any>(null);
  const [houseMembers, setHouseMembers] = useState<UserProfile[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    meeting_date: '',
    notes: '',
  });

  const maximumMeetingDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const maxDateString = useMemo(
    () => formatDateForInput(maximumMeetingDate),
    [maximumMeetingDate]
  );

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

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type !== 'set' || !selectedDate) {
      return;
    }

    const selectedDateString = formatDateForInput(selectedDate);

    if (selectedDateString > maxDateString) {
      Alert.alert('Invalid Date', 'Please select today or a past date.');
      return;
    }

    setFormData((previous) => ({
      ...previous,
      meeting_date: selectedDateString,
    }));

    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMember) {
      Alert.alert('Error', 'Please select a house member');
      return;
    }

    if (!formData.meeting_date) {
      Alert.alert('Error', 'Please select a meeting date');
      return;
    }

    if (formData.meeting_date > maxDateString) {
      Alert.alert('Error', 'Please choose today or a past date for the meeting');
      return;
    }

    try {
      const result = await I2WEService.createMeeting({
        member_2_id: selectedMember.id,
        meeting_date: formData.meeting_date,
        notes: formData.notes,
      });

      // Send notification to the selected member
      if (profile) {
        await sendI2WEMeetingRecordedNotification({
          recipientId: selectedMember.id,
          meetingId: result?.id || '',
          recorderName: profile.full_name || 'A member',
          recorderId: profile.id,
          meetingDate: formData.meeting_date,
          notes: formData.notes,
        });
      }

      // Clear form
      setFormData({
        meeting_date: '',
        notes: '',
      });
      setSelectedMember(null);

      Alert.alert('Success', 'Meeting recorded successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to record meeting');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text_primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log I2WE Meeting</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled">
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
          <ScrollView
            style={styles.memberList}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled">
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
          </ScrollView>
        )}

        <Text style={styles.label}>
          Meeting Date <Text style={styles.required}>*</Text>
        </Text>
        {Platform.OS === 'web' ? (
          <View style={styles.dateInputContainer}>
            <Calendar size={20} color={colors.text_secondary} />
            <input
              type="date"
              max={maxDateString}
              value={formData.meeting_date}
              onChange={(event) => {
                setFormData((previous) => ({
                  ...previous,
                  meeting_date: event.target.value,
                }));
              }}
              style={styles.webDateInput as any}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.dateInputContainer}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}>
            <Calendar size={20} color={colors.text_secondary} />
            <Text style={[styles.dateInput, !formData.meeting_date && styles.datePlaceholder]}>
              {formData.meeting_date || 'Select meeting date'}
            </Text>
          </TouchableOpacity>
        )}

        {Platform.OS !== 'web' && showDatePicker && (
          <DateTimePicker
            value={
              formData.meeting_date
                ? new Date(`${formData.meeting_date}T00:00:00`)
                : maximumMeetingDate
            }
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={maximumMeetingDate}
            onChange={handleDateChange}
          />
        )}
        <Text style={styles.hint}>Only today or past dates are allowed</Text>

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
          <Text style={styles.submitButtonText}>Save Meeting</Text>
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
  datePlaceholder: {
    color: colors.text_tertiary,
  },
  webDateInput: {
    flex: 1,
    marginLeft: spacing.sm,
    backgroundColor: 'transparent',
    borderWidth: 0,
    outlineStyle: 'none',
    color: colors.text_primary,
    fontSize: 16,
    height: 44,
  },
  hint: {
    fontSize: 12,
    color: colors.text_tertiary,
    marginTop: spacing.xs,
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
    color: colors.text_primary,
  },
});
