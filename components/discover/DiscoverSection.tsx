import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, fontSize } from '@/constants/theme';
import MemberCard from './MemberCard';
import type { User } from '@/types';

interface DiscoverSectionProps {
  title: string;
}

const MOCK_MEMBERS: User[] = [
  {
    id: '1',
    name: 'Ramesh Kumar',
    email: 'ramesh@example.com',
    category: 'Manufacturing',
    location: 'Chennai, Tamil Nadu',
    circle: 'inner',
    tier: 'privileged',
    is_online: true,
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Suresh Naidu',
    email: 'suresh@example.com',
    category: 'Real Estate',
    location: 'Hyderabad, Telangana',
    circle: 'inner',
    tier: 'regular',
    is_online: false,
    created_at: '2024-01-02',
  },
  {
    id: '3',
    name: 'Venkat Reddy',
    email: 'venkat@example.com',
    category: 'Finance',
    location: 'Bengaluru, Karnataka',
    circle: 'open',
    tier: 'virtual',
    is_online: true,
    created_at: '2024-01-03',
  },
];

export default function DiscoverSection({ title }: DiscoverSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {MOCK_MEMBERS.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
