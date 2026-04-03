import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ChevronLeft, ScanLine, CircleAlert, CircleCheckBig } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, fontFamily } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceService } from '@/services/attendanceService';

export default function AttendanceScanScreen() {
  const { userId, profile } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: null,
    message: '',
  });

  const canScan = useMemo(
    () => Boolean(permission?.granted && !isSubmitting && !hasScanned),
    [permission?.granted, isSubmitting, hasScanned]
  );

  const resetScanner = () => {
    setHasScanned(false);
    setStatus({ type: null, message: '' });
  };

  const handleScanned = async ({ data }: { data: string }) => {
    if (!canScan) return;

    setHasScanned(true);
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      if (!userId) {
        throw new Error('Please sign in to mark attendance.');
      }

      const parsed = AttendanceService.parseQrPayload(data);
      const context = await AttendanceService.resolveAttendanceContext(parsed);

      if (!context?.eventId) {
        throw new Error('Invalid attendance QR code. Please scan a valid event QR.');
      }

      if (!context.isLive) {
        throw new Error('This event is not currently live for attendance.');
      }

      if (context.qrExpiresAt && new Date(context.qrExpiresAt) < new Date()) {
        throw new Error('This QR code has expired. Please ask admin for a new one.');
      }

      const memberProfile = await AttendanceService.getMemberAttendanceProfile(userId);
      if (!memberProfile) {
        throw new Error('Member profile not found. Please contact support.');
      }

      if (memberProfile.approvalStatus !== 'approved') {
        throw new Error('Your account is not approved for attendance yet.');
      }

      if (!memberProfile.houseId) {
        throw new Error('Your profile does not have a house assigned.');
      }

      if (!context.houseId || context.houseId !== memberProfile.houseId) {
        throw new Error('Your house is not matched for this event');
      }

      const result = await AttendanceService.submitAttendance({
        userId,
        eventId: context.eventId,
        eventTime: context.eventTime,
        maxLateMinutes: context.maxLateMinutes,
      });

      const successMessage =
        result.result === 'already'
          ? 'You have already checked in for this event.'
          : result.status === 'late'
            ? 'Attendance submitted. You are marked late.'
            : 'Attendance submitted successfully.';

      setStatus({
        type: 'success',
        message: successMessage,
      });
    } catch (error: any) {
      const message = error?.message || 'Failed to submit attendance. Please try again.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.text_primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Attendance QR</Text>
        <View style={styles.headerSpacer} />
      </View>

      {!permission ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent_green_bright} />
          <Text style={styles.helperText}>Checking camera permission...</Text>
        </View>
      ) : !permission.granted ? (
        <View style={styles.centered}>
          <CircleAlert size={44} color={colors.accent_red} />
          <Text style={styles.permissionTitle}>Camera permission required</Text>
          <Text style={styles.helperText}>Allow camera access to scan attendance QR code.</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={async () => {
              const result = await requestPermission();
              if (!result.granted) {
                Alert.alert('Permission Required', 'Please allow camera access to continue.');
              }
            }}>
            <Text style={styles.primaryBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.scannerWrap}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={canScan ? handleScanned : undefined}
          />

          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.scanBox}>
              <ScanLine size={36} color={colors.accent_green_bright} />
              <Text style={styles.scanText}>Align QR code inside the frame</Text>
            </View>
          </View>
        </View>
      )}

      {isSubmitting ? (
        <View style={[styles.banner, styles.bannerNeutral]}>
          <ActivityIndicator size="small" color={colors.accent_green_bright} />
          <Text style={styles.bannerText}>Submitting attendance...</Text>
        </View>
      ) : null}

      {status.type ? (
        <View
          style={[
            styles.banner,
            status.type === 'success' ? styles.bannerSuccess : styles.bannerError,
          ]}>
          {status.type === 'success' ? (
            <CircleCheckBig size={18} color={colors.accent_green_bright} />
          ) : (
            <CircleAlert size={18} color={colors.accent_red} />
          )}
          <Text style={styles.bannerText}>{status.message}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={resetScanner}>
          <Text style={styles.secondaryBtnText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg_primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52,211,153,0.12)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52,211,153,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: colors.text_primary,
    textAlign: 'center',
  },
  headerSpacer: { width: 36 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  permissionTitle: {
    color: colors.text_primary,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  helperText: {
    color: colors.text_muted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  scannerWrap: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.22)',
    backgroundColor: '#050a09',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  scanBox: {
    width: '100%',
    maxWidth: 280,
    minHeight: 220,
    borderWidth: 2,
    borderRadius: 20,
    borderColor: 'rgba(52,211,153,0.7)',
    backgroundColor: 'rgba(0,0,0,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  scanText: {
    color: colors.text_primary,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  banner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bannerNeutral: {
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.25)',
  },
  bannerSuccess: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.28)',
  },
  bannerError: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.28)',
  },
  bannerText: {
    color: colors.text_secondary,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.accent_green_bright,
    borderRadius: borderRadius.button,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  primaryBtnText: {
    color: colors.bg_primary,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
  },
  secondaryBtn: {
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
    backgroundColor: 'rgba(52,211,153,0.08)',
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: colors.accent_green_bright,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
  },
});
