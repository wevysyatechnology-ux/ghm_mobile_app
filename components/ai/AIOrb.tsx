import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '@/constants/theme';

interface AIorbProps {
  state: 'idle' | 'listening' | 'thinking' | 'responding';
}

const ORB_SIZE = 260;
const RING_SIZE = 230;

export default function AIOrb({ state }: AIorbProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0.9);
  const glowScale = useSharedValue(1);
  const innerGlowScale = useSharedValue(1);

  useEffect(() => {
    switch (state) {
      case 'idle':
        scale.value = withRepeat(
          withSequence(
            withSpring(1.05, { damping: 10, stiffness: 80 }),
            withSpring(1, { damping: 10, stiffness: 80 })
          ),
          -1,
          false
        );
        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        innerGlowScale.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        opacity.value = withTiming(0.9, { duration: 500 });
        rotation.value = 0;
        break;

      case 'listening':
        scale.value = withRepeat(
          withSequence(
            withSpring(1.12, { damping: 8, stiffness: 100 }),
            withSpring(1, { damping: 8, stiffness: 100 })
          ),
          -1,
          false
        );
        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.4, { duration: 500 }),
            withTiming(1.1, { duration: 500 })
          ),
          -1,
          false
        );
        innerGlowScale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 600 }),
            withTiming(1, { duration: 600 })
          ),
          -1,
          false
        );
        opacity.value = withTiming(1, { duration: 300 });
        break;

      case 'thinking':
        rotation.value = withRepeat(
          withTiming(360, { duration: 2500, easing: Easing.linear }),
          -1,
          false
        );
        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.25, { duration: 1200 }),
            withTiming(1.1, { duration: 1200 })
          ),
          -1,
          false
        );
        innerGlowScale.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ),
          -1,
          false
        );
        opacity.value = withTiming(1, { duration: 300 });
        break;

      case 'responding':
        scale.value = withRepeat(
          withSequence(
            withSpring(1.1, { damping: 6, stiffness: 120 }),
            withSpring(1.05, { damping: 6, stiffness: 120 }),
            withSpring(1.1, { damping: 6, stiffness: 120 })
          ),
          -1,
          false
        );
        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.35, { duration: 350 }),
            withTiming(1.15, { duration: 350 }),
            withTiming(1.35, { duration: 350 })
          ),
          -1,
          false
        );
        innerGlowScale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 400 }),
            withTiming(1.05, { duration: 400 }),
            withTiming(1.2, { duration: 400 })
          ),
          -1,
          false
        );
        opacity.value = withTiming(1, { duration: 300 });
        break;
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: opacity.value * 0.4,
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerGlowScale.value }],
    opacity: opacity.value * 0.5,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowOuter, glowStyle]}>
        <LinearGradient
          colors={[
            'rgba(110, 231, 183, 0.7)',
            'rgba(52, 211, 153, 0.5)',
            'rgba(16, 185, 129, 0.3)',
            'transparent'
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <Animated.View style={[styles.glowMiddle, innerGlowStyle]}>
        <LinearGradient
          colors={[
            'rgba(52, 211, 153, 0.6)',
            'rgba(16, 185, 129, 0.4)',
            'transparent'
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <Animated.View style={[styles.ring, animatedStyle]}>
        <LinearGradient
          colors={[colors.accent_green_glow, colors.accent_green_bright, colors.accent_green]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ringGradient}
        />
        <View style={styles.ringInner}>
          <BlurView intensity={40} style={styles.ringBlur} />
        </View>
      </Animated.View>

      {['listening', 'thinking', 'responding'].includes(state) && (
        <View style={styles.particleContainer}>
          {[...Array(12)].map((_, i) => (
            <Particle key={i} index={i} state={state} />
          ))}
        </View>
      )}

      {state === 'responding' && (
        <View style={styles.rippleContainer}>
          {[0, 1, 2].map((i) => (
            <RippleCircle key={i} delay={i * 400} />
          ))}
        </View>
      )}
    </View>
  );
}

function Particle({ index, state }: { index: number; state: string }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  const angle = (index * 360) / 12;
  const radius = 100;

  useEffect(() => {
    const targetX = Math.cos((angle * Math.PI) / 180) * radius;
    const targetY = Math.sin((angle * Math.PI) / 180) * radius;

    if (state === 'listening') {
      translateX.value = withRepeat(
        withSequence(
          withTiming(targetX * 0.7, { duration: 800, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
      translateY.value = withRepeat(
        withSequence(
          withTiming(targetY * 0.7, { duration: 800, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800 }),
          withTiming(0, { duration: 800 })
        ),
        -1,
        false
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.5, { duration: 800 })
        ),
        -1,
        false
      );
    } else if (state === 'thinking') {
      translateX.value = withRepeat(
        withTiming(targetX * 0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      translateY.value = withRepeat(
        withTiming(targetY * 0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        false
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(0.8, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      translateX.value = withRepeat(
        withSequence(
          withSpring(targetX * 0.8, { damping: 5, stiffness: 50 }),
          withSpring(0, { damping: 5, stiffness: 50 })
        ),
        -1,
        false
      );
      translateY.value = withRepeat(
        withSequence(
          withSpring(targetY * 0.8, { damping: 5, stiffness: 50 }),
          withSpring(0, { damping: 5, stiffness: 50 })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 })
        ),
        -1,
        false
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 400 }),
          withTiming(0.5, { duration: 400 })
        ),
        -1,
        false
      );
    }

    return () => {
      translateX.value = 0;
      translateY.value = 0;
      opacity.value = 0;
      scale.value = 0;
    };
  }, [state]);

  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, particleStyle]}>
      <LinearGradient
        colors={[colors.accent_green_glow, colors.accent_green_bright]}
        style={styles.particleGradient}
      />
    </Animated.View>
  );
}

function RippleCircle({ delay }: { delay: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withRepeat(
        withTiming(2.2, { duration: 1200, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 0 }),
          withTiming(0, { duration: 1200, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.ripple, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: ORB_SIZE * 1.8,
    height: ORB_SIZE * 1.8,
    borderRadius: (ORB_SIZE * 1.8) / 2,
    overflow: 'hidden',
  },
  glowMiddle: {
    position: 'absolute',
    width: ORB_SIZE * 1.4,
    height: ORB_SIZE * 1.4,
    borderRadius: (ORB_SIZE * 1.4) / 2,
    overflow: 'hidden',
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    padding: 4,
    shadowColor: colors.accent_green_bright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  ringGradient: {
    width: '100%',
    height: '100%',
    borderRadius: RING_SIZE / 2,
  },
  ringInner: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: (RING_SIZE - 28) / 2,
    backgroundColor: colors.bg_primary,
    overflow: 'hidden',
  },
  ringBlur: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  particleContainer: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  particleGradient: {
    width: '100%',
    height: '100%',
  },
  rippleContainer: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.accent_green_glow,
  },
});
