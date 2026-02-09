import { View, Text, StyleSheet } from 'react-native';
import { Eye, Calendar } from 'lucide-react-native';
import { colors, spacing, fontSize } from '@/constants/theme';

const INSIGHTS = [
  { icon: Eye, text: '3 members viewed your profile' },
  { icon: Calendar, text: 'Next meeting in 2 days' },
];

export default function MicroInsights() {
  return (
    <View style={styles.container}>
      {INSIGHTS.map((insight, index) => {
        const IconComponent = insight.icon;
        return (
          <View key={index} style={styles.insight}>
            <IconComponent size={14} color={colors.text_muted} />
            <Text style={styles.text}>{insight.text}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  text: {
    fontSize: fontSize.xs,
    color: colors.text_muted,
    fontWeight: '500',
  },
});
