import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  User as UserIcon,
} from 'lucide-react-native';
import { colors, spacing, fontSize } from '@/constants/theme';

export default function Call() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const memberName = params.name as string || 'Unknown';
  const memberPhoto = params.photo as string | undefined;

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    const speakingSimulator = setInterval(() => {
      setIsSpeaking((prev) => !prev);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(speakingSimulator);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.status}>Calling...</Text>
        <Text style={styles.duration}>{formatDuration(duration)}</Text>
      </View>

      <View style={styles.avatarContainer}>
        {memberPhoto ? (
          <Image source={{ uri: memberPhoto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <UserIcon size={80} color={colors.text_secondary} />
          </View>
        )}
        {isSpeaking && <View style={styles.speakingIndicator} />}
      </View>

      <Text style={styles.name}>{memberName}</Text>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={() => setIsMuted(!isMuted)}
          activeOpacity={0.7}>
          {isMuted ? (
            <MicOff size={24} color={colors.text_primary} />
          ) : (
            <Mic size={24} color={colors.text_primary} />
          )}
          <Text style={styles.controlLabel}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            isVideoOn && styles.controlButtonActive,
          ]}
          onPress={() => setIsVideoOn(!isVideoOn)}
          activeOpacity={0.7}>
          {isVideoOn ? (
            <Video size={24} color={colors.text_primary} />
          ) : (
            <VideoOff size={24} color={colors.text_primary} />
          )}
          <Text style={styles.controlLabel}>
            {isVideoOn ? 'Stop Video' : 'Start Video'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.endCallButton}
        onPress={handleEndCall}
        activeOpacity={0.8}>
        <PhoneOff size={28} color={colors.text_primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl * 2,
  },
  status: {
    fontSize: fontSize.md,
    color: colors.text_secondary,
    marginBottom: spacing.xs,
  },
  duration: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text_primary,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  avatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1A1F1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakingIndicator: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 88,
    borderWidth: 4,
    borderColor: colors.accent_green,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text_primary,
    marginBottom: spacing.xxl * 2,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xxl * 2,
  },
  controlButton: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  controlButtonActive: {
    opacity: 0.5,
  },
  controlLabel: {
    fontSize: fontSize.sm,
    color: colors.text_secondary,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.danger_red,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
});
