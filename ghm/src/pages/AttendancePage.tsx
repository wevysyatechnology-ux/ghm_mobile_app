import { useEffect, useState } from 'react';
import { attendanceService } from '../services/attendanceService';

export default function AttendancePage() {
  const [membersWithIssues, setMembersWithIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  async function loadAttendanceData() {
    try {
      const data = await attendanceService.getMembersWithAttendanceIssues();
      setMembersWithIssues(data);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getAttendanceStatusInfo = (status: string, absenceCount: number) => {
    const styles: Record<
      string,
      { bg: string; color: string; label: string; description: string }
    > = {
      probation: {
        bg: 'rgba(255, 165, 0, 0.1)',
        color: '#FFA500',
        label: 'Probation',
        description: `${absenceCount} absences - Member is on probation`,
      },
      category_open: {
        bg: 'rgba(255, 140, 0, 0.1)',
        color: '#FF8C00',
        label: 'Category Opened',
        description: `${absenceCount} absences - Category opened, requires committee review`,
      },
      removal_eligible: {
        bg: 'rgba(255, 77, 77, 0.1)',
        color: 'var(--danger)',
        label: 'Removal Eligible',
        description: `${absenceCount} absences - Member eligible for removal`,
      },
    };

    return styles[status] || null;
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading attendance data...</div>;
  }

  return (
    <div>
      <div className="gradient-header" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Attendance Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track and manage member attendance for Inner Circle members
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            backgroundColor: 'rgba(42, 255, 106, 0.1)',
            border: '1px solid rgba(42, 255, 106, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Attendance Policy
          </h3>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>1st & 2nd Absence:</strong> No action
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>3rd Absence:</strong> Status changes to Probation
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>4th Absence:</strong> Category Opened - Requires Membership Committee review
            </p>
            <p>
              <strong>5th Absence:</strong> Member becomes Removal Eligible
            </p>
          </div>
        </div>
      </div>

      {membersWithIssues.length > 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Members Requiring Attention</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>House</th>
                  <th style={tableHeaderStyle}>Absences</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Description</th>
                </tr>
              </thead>
              <tbody>
                {membersWithIssues.map((member) => {
                  const statusInfo = getAttendanceStatusInfo(member.attendance_status, member.absence_count);
                  if (!statusInfo) return null;

                  return (
                    <tr
                      key={member.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                      }}
                    >
                      <td style={tableCellStyle}>{member.full_name}</td>
                      <td style={tableCellStyle}>
                        {member.core_house_members?.[0]?.core_houses?.house_name || '-'}
                      </td>
                      <td style={tableCellStyle}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '1.125rem',
                            color: statusInfo.color,
                          }}
                        >
                          {member.absence_count}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.375rem 0.875rem',
                            borderRadius: '12px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.color,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {statusInfo.description}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(42, 255, 106, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <span style={{ fontSize: '2rem' }}>✓</span>
          </div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>All Clear</h3>
          <p style={{ color: 'var(--text-muted)' }}>No members with attendance issues at this time</p>
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '1rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  borderBottom: '1px solid var(--border-color)',
};

const tableCellStyle: React.CSSProperties = {
  padding: '1rem',
  fontSize: '0.875rem',
  color: 'var(--text-primary)',
};
