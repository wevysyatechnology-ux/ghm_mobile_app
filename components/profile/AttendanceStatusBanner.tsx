import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { AttendanceStatus } from '../../types/database';

interface AttendanceStatusBannerProps {
  attendanceStatus: AttendanceStatus;
  absenceCount: number;
}

export default function AttendanceStatusBanner({ attendanceStatus, absenceCount }: AttendanceStatusBannerProps) {
  if (attendanceStatus === 'normal') {
    return null;
  }

  const statusConfig: Record<
    Exclude<AttendanceStatus, 'normal'>,
    {
      title: string;
      message: string;
      backgroundColor: string;
      textColor: string;
      icon: string;
    }
  > = {
    probation: {
      title: 'Attendance Status: Probation',
      message: `You have ${absenceCount} absences. Please ensure regular attendance at house meetings.`,
      backgroundColor: 'rgba(255, 165, 0, 0.15)',
      textColor: '#FFA500',
      icon: '⚠️',
    },
    category_open: {
      title: 'Category Opened',
      message: `You have ${absenceCount} absences. Your case is under review by the Membership Committee. Please contact your House leadership immediately.`,
      backgroundColor: 'rgba(255, 140, 0, 0.15)',
      textColor: '#FF8C00',
      icon: '⚠️',
    },
    removal_eligible: {
      title: 'Urgent: Action Required',
      message: `You have ${absenceCount} absences and are eligible for removal. Contact House leadership immediately.`,
      backgroundColor: 'rgba(255, 77, 77, 0.15)',
      textColor: '#FF4D4D',
      icon: '🚨',
    },
  };

  const config = statusConfig[attendanceStatus as Exclude<AttendanceStatus, 'normal'>];

  if (!config) return null;

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[styles.title, { color: config.textColor }]}>{config.title}</Text>
      </View>
      <Text style={styles.message}>{config.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#A1A5A4',
  },
});
