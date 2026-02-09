import { useEffect, useState } from 'react';
import { approvalsService } from '../services/approvalsService';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadApprovals();
  }, []);

  async function loadApprovals() {
    try {
      const data = await approvalsService.getAllApprovals();
      setApprovals(data);
    } catch (error) {
      console.error('Error loading approvals:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredApprovals = approvals.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      category_opening: 'Category Opening',
      member_removal: 'Member Removal',
      role_assignment: 'Role Assignment',
      membership_change: 'Membership Change',
      suspension: 'Suspension',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      pending: { bg: 'rgba(255, 165, 0, 0.1)', color: '#FFA500' },
      approved: { bg: 'rgba(42, 255, 106, 0.1)', color: 'var(--accent-primary)' },
      rejected: { bg: 'rgba(255, 77, 77, 0.1)', color: 'var(--danger)' },
    };

    const style = styles[status] || styles.pending;

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.375rem 0.875rem',
          borderRadius: '12px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          backgroundColor: style.bg,
          color: style.color,
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading approvals...</div>;
  }

  return (
    <div>
      <div className="gradient-header" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Approval Requests</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review and manage approval requests</p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
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
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredApprovals.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                      {getRequestTypeLabel(approval.request_type)}
                    </h3>
                    {getStatusBadge(approval.status)}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Requested on {new Date(approval.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Subject Member
                  </p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {approval.subject_user?.full_name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Requested By
                  </p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{approval.requester?.full_name || 'Unknown'}</p>
                </div>
                {approval.status !== 'pending' && approval.approver && (
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {approval.status === 'approved' ? 'Approved By' : 'Rejected By'}
                    </p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {approval.approver?.full_name || 'Unknown'}
                    </p>
                  </div>
                )}
              </div>

              {approval.metadata?.absence_count && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Member has <strong style={{ color: 'var(--danger)' }}>{approval.metadata.absence_count}</strong>{' '}
                    consecutive absences
                  </p>
                </div>
              )}

              {approval.remarks && (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    marginTop: '1rem',
                  }}
                >
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Remarks</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{approval.remarks}</p>
                </div>
              )}
            </div>
          ))}
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
          <p style={{ color: 'var(--text-muted)' }}>No approval requests found</p>
        </div>
      )}
    </div>
  );
}
