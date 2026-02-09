import { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, borderRadius } from '@/constants/theme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export default function GlassCard({ children, style, intensity = 20 }: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} style={styles.blur}>
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 31, 28, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  blur: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
  },
  content: {
    backgroundColor: 'rgba(26, 31, 28, 0.4)',
  },
});
