import { Text, TextStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { colors } from '@/constants/theme';

interface GradientTextProps {
  children: string;
  style?: TextStyle;
  colors?: readonly [string, string, ...string[]];
}

export default function GradientText({
  children,
  style,
  colors: gradientColors = [colors.accent_green_glow, colors.accent_green_bright, colors.accent_green] as const
}: GradientTextProps) {
  return (
    <MaskedView
      maskElement={
        <Text style={[styles.text, style]}>{children}</Text>
      }>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}>
        <Text style={[styles.text, style, styles.transparent]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '700',
  },
  transparent: {
    opacity: 0,
  },
});
