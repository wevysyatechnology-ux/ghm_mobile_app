import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, fontSize } from '@/constants/theme';
import MemberCard from './MemberCard';
import type { User } from '@/types';

interface DiscoverSectionProps {
  title: string;
  members: User[];
  isLoading?: boolean;
}

export default function DiscoverSection({ title, members, isLoading = false }: DiscoverSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {isLoading ? (
        <Text style={styles.emptyText}>Loading members...</Text>
      ) : members.length === 0 ? (
        <Text style={styles.emptyText}>No members found in your house</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </ScrollView>
      )}
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
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize.sm,
    color: colors.text_muted,
    paddingHorizontal: spacing.lg,
  },
});
