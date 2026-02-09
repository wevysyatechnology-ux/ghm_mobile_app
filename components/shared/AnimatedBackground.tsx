import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function AnimatedBackground() {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const opacity1 = useSharedValue(0.6);
  const opacity2 = useSharedValue(0.4);

  useEffect(() => {
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    scale2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.4, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    opacity1.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 3000 }),
        withTiming(0.4, { duration: 3000 })
      ),
      -1,
      false
    );

    opacity2.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 4000 }),
        withTiming(0.3, { duration: 4000 })
      ),
      -1,
      false
    );
  }, []);

  const blob1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const blob2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  return (
    <>
      <Animated.View style={[styles.blob, styles.blob1, blob1Style]}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.4)', 'rgba(52, 211, 153, 0.3)', 'transparent']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.blob, styles.blob2, blob2Style]}>
        <LinearGradient
          colors={['rgba(110, 231, 183, 0.3)', 'rgba(16, 185, 129, 0.2)', 'transparent']}
          style={styles.gradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blob1: {
    width: 400,
    height: 400,
    top: -100,
    right: -100,
  },
  blob2: {
    width: 350,
    height: 350,
    bottom: 100,
    left: -50,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
});
