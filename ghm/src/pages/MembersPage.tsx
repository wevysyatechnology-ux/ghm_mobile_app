import { useEffect, useState } from 'react';
import { membersService } from '../services/membersService';
import type { MemberWithDetails } from '../types/database';

export default function MembersPage() {
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'inner_circle' | 'open_circle'>('all');

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const data = await membersService.getAllMembers();
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = members.filter((m) => {
    if (filter === 'all') return true;
    return m.vertical_type === filter;
  });

  const getAttendanceStatusBadge = (status: string) => {
    const styles: Record<
      string,
      { bg: string; color: string; label: string }
    > = {
      normal: { bg: 'rgba(42, 255, 106, 0.1)', color: 'var(--accent-primary)', label: 'Normal' },
      probation: { bg: 'rgba(255, 165, 0, 0.1)', color: '#FFA500', label: 'Probation' },
      category_open: { bg: 'rgba(255, 140, 0, 0.1)', color: '#FF8C00', label: 'Category Open' },
      removal_eligible: { bg: 'rgba(255, 77, 77, 0.1)', color: 'var(--danger)', label: 'Removal Eligible' },
    };

    const style = styles[status] || styles.normal;

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: style.bg,
          color: style.color,
        }}
      >
        {style.label}
      </span>
    );
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading members...</div>;
  }

  return (
    <div>
      <div className="gradient-header" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Members Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View and manage all WeVysya members</p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        {['all', 'inner_circle', 'open_circle'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: filter === f ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: filter === f ? 'var(--bg-base)' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s',
            }}
          >
            {f.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Phone</th>
                <th style={tableHeaderStyle}>Vertical</th>
                <th style={tableHeaderStyle}>City</th>
                <th style={tableHeaderStyle}>House</th>
                <th style={tableHeaderStyle}>Attendance</th>
                <th style={tableHeaderStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  <td style={tableCellStyle}>{member.full_name}</td>
                  <td style={tableCellStyle}>{member.phone_number || '-'}</td>
                  <td style={tableCellStyle}>
                    <span
                      style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor:
                          member.vertical_type === 'inner_circle'
                            ? 'rgba(42, 255, 106, 0.1)'
                            : 'rgba(111, 232, 176, 0.1)',
                        color:
                          member.vertical_type === 'inner_circle' ? 'var(--accent-primary)' : 'var(--accent-soft)',
                      }}
                    >
                      {member.vertical_type?.replace(/_/g, ' ') || '-'}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{member.city || '-'}</td>
                  <td style={tableCellStyle}>{member.house?.house_name || '-'}</td>
                  <td style={tableCellStyle}>
                    {member.vertical_type === 'inner_circle' ? (
                      <div>
                        {getAttendanceStatusBadge(member.attendance_status)}
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ({member.absence_count} absences)
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>N/A</span>
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {member.is_suspended ? (
                      <span
                        style={{
                          color: 'var(--danger)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}
                      >
                        Suspended
                      </span>
                    ) : (
                      <span
                        style={{
                          color: 'var(--accent-primary)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}
                      >
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMembers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No members found</div>
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
