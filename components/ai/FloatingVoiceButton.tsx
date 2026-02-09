import { StyleSheet, Platform } from 'react-native';
import { Mic } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/theme';
import PressableScale from '@/components/shared/PressableScale';
import { useEffect } from 'react';

interface FloatingVoiceButtonProps {
  onPress: () => void;
  isActive?: boolean;
}

export default function FloatingVoiceButton({ onPress, isActive = false }: FloatingVoiceButtonProps) {
  const scale = useSharedValue(1);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.1, { damping: 8, stiffness: 100 }),
          withSpring(1, { damping: 8, stiffness: 100 })
        ),
        -1,
        false
      );
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      scale.value = withSpring(1);
      glowScale.value = withTiming(1);
    }
  }, [isActive]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: isActive ? 0.6 : 0.4,
  }));

  return (
    <Animated.View style={[styles.container, buttonStyle]}>
      <Animated.View style={[styles.glow, glowStyle]}>
        <LinearGradient
          colors={[
            'rgba(52, 211, 153, 0.6)',
            'rgba(16, 185, 129, 0.3)',
            'transparent'
          ]}
          style={styles.glowGradient}
        />
      </Animated.View>
      <PressableScale onPress={onPress} scaleValue={0.9}>
        <LinearGradient
          colors={[colors.accent_green_glow, colors.accent_green_bright]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}>
          <Mic size={28} color={colors.bg_primary} strokeWidth={2.5} />
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 90 : 100,
    right: 24,
    zIndex: 1000,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -30,
    left: -30,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent_green_bright,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
});
