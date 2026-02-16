import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MessageCircle } from 'lucide-react-native';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

interface AIResponseToastProps {
  message: string;
  visible: boolean;
  onHide?: () => void;
  duration?: number;
}

export default function AIResponseToast({ 
  message, 
  visible, 
  onHide,
  duration = 3000 
}: AIResponseToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });

      // Auto-hide after duration
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 400 });
        opacity.value = withTiming(0, { duration: 400 });
        
        setTimeout(() => {
          onHide?.();
        }, 400);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-100, { duration: 400 });
      opacity.value = withTiming(0, { duration: 400 });
    }
  }, [visible, message, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible && translateY.value < 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(52, 211, 153, 0.25)', 'rgba(16, 185, 129, 0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MessageCircle size={20} color={colors.accent_green_bright} />
            </View>
            <Text style={styles.message}>{message}</Text>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
  },
  blurContainer: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  gradient: {
    padding: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text_primary,
    fontWeight: '600',
    lineHeight: 20,
  },
});
