import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isProfileComplete, isLoading } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  const innerGlow = useRef(new Animated.Value(0)).current;
  const middleGlow = useRef(new Animated.Value(0)).current;
  const outerGlow = useRef(new Animated.Value(0)).current;

  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring3Scale = useRef(new Animated.Value(1)).current;

  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(innerGlow, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(innerGlow, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(middleGlow, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(middleGlow, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(outerGlow, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(outerGlow, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring1Scale, {
            toValue: 1.4,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring1Scale, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(1000),
          Animated.timing(ring2Scale, {
            toValue: 1.5,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Scale, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(2000),
          Animated.timing(ring3Scale, {
            toValue: 1.6,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring3Scale, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    const minDisplayTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500);

    return () => clearTimeout(minDisplayTimer);
  }, []);

  useEffect(() => {
    console.log('Index screen - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'isProfileComplete:', isProfileComplete, 'minTimeElapsed:', minTimeElapsed);

    if (!isLoading && minTimeElapsed) {
      if (!isAuthenticated) {
        console.log('Redirecting to login');
        router.replace('/auth/login');
      } else if (!isProfileComplete) {
        console.log('Redirecting to profile setup');
        router.replace('/auth/profile-setup');
      } else {
        console.log('Redirecting to tabs');
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isProfileComplete, isLoading, minTimeElapsed]);

  const iconRotateInterpolate = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  const innerGlowOpacity = innerGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const middleGlowOpacity = middleGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const outerGlowOpacity = outerGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const ring1Opacity = ring1Scale.interpolate({
    inputRange: [1, 1.6],
    outputRange: [0.3, 0],
  });

  const ring2Opacity = ring2Scale.interpolate({
    inputRange: [1, 1.6],
    outputRange: [0.25, 0],
  });

  const ring3Opacity = ring3Scale.interpolate({
    inputRange: [1, 1.6],
    outputRange: [0.2, 0],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0B1F14', '#000000']}
        style={styles.gradient}
        locations={[0, 0.5, 1]}
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.ring,
            {
              width: 400,
              height: 400,
              borderRadius: 200,
              opacity: ring3Opacity,
              transform: [{ scale: ring3Scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              width: 350,
              height: 350,
              borderRadius: 175,
              opacity: ring2Opacity,
              transform: [{ scale: ring2Scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              width: 300,
              height: 300,
              borderRadius: 150,
              opacity: ring1Opacity,
              transform: [{ scale: ring1Scale }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.glowLayer,
            {
              width: 260,
              height: 260,
              borderRadius: 130,
              opacity: outerGlowOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(52, 211, 153, 0.3)', 'rgba(16, 185, 129, 0.15)', 'transparent']}
            style={styles.gradientCircle}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.glowLayer,
            {
              width: 220,
              height: 220,
              borderRadius: 110,
              opacity: middleGlowOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(52, 211, 153, 0.4)', 'rgba(16, 185, 129, 0.2)', 'transparent']}
            style={styles.gradientCircle}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.glowLayer,
            {
              width: 180,
              height: 180,
              borderRadius: 90,
              opacity: innerGlowOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(52, 211, 153, 0.5)', 'rgba(16, 185, 129, 0.3)', 'transparent']}
            style={styles.gradientCircle}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: iconOpacity,
              transform: [
                { scale: iconScale },
                { rotate: iconRotateInterpolate },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(15, 50, 35, 1)', 'rgba(10, 35, 25, 1)']}
            style={styles.iconBackground}
          >
            <Image
              source={require('@/assets/images/wevysya_logo_r.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textSlide }],
            },
          ]}
        >
          <Animated.Text style={styles.brandText}>WeVysya</Animated.Text>
          <LoadingDots />
        </Animated.View>
      </View>
    </View>
  );
}

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, []);

  const createDotStyle = (dot: Animated.Value) => ({
    opacity: dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
  });

  return (
    <View style={styles.dots}>
      <Animated.View style={[styles.dot, createDotStyle(dot1)]} />
      <Animated.View style={[styles.dot, createDotStyle(dot2)]} />
      <Animated.View style={[styles.dot, createDotStyle(dot3)]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: colors.accent_green_bright,
  },
  glowLayer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  iconContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent_green_bright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logo: {
    width: 110,
    height: 110,
  },
  textContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text_primary,
    letterSpacing: 2,
    marginBottom: 24,
    textShadowColor: 'rgba(52, 211, 153, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent_green_bright,
    shadowColor: colors.accent_green_bright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
});
