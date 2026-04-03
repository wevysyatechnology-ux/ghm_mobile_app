import { Text, TextStyle, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={[styles.text, style]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Poppins-Bold',
    backgroundColor: 'transparent',
  },
});
