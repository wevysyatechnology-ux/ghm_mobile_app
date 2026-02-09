import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { DashboardMetrics } from '../types/database';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const data = await dashboardService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</div>;
  }

  const metricCards = [
    {
      label: 'Inner Circle Members',
      value: metrics?.total_inner_circle || 0,
      color: 'var(--accent-primary)',
      bgColor: 'rgba(42, 255, 106, 0.1)',
    },
    {
      label: 'Open Circle Members',
      value: metrics?.total_open_circle || 0,
      color: 'var(--accent-soft)',
      bgColor: 'rgba(111, 232, 176, 0.1)',
    },
    {
      label: 'Active Memberships',
      value: metrics?.active_memberships || 0,
      color: 'var(--accent-primary)',
      bgColor: 'rgba(42, 255, 106, 0.1)',
    },
    {
      label: 'Expired Memberships',
      value: metrics?.expired_memberships || 0,
      color: 'var(--text-muted)',
      bgColor: 'rgba(110, 115, 114, 0.1)',
    },
    {
      label: 'Total Houses',
      value: metrics?.total_houses || 0,
      color: 'var(--accent-secondary)',
      bgColor: 'rgba(30, 215, 96, 0.1)',
    },
    {
      label: 'Members on Probation',
      value: metrics?.members_on_probation || 0,
      color: '#FFA500',
      bgColor: 'rgba(255, 165, 0, 0.1)',
    },
    {
      label: 'Category Opened',
      value: metrics?.members_category_open || 0,
      color: '#FF8C00',
      bgColor: 'rgba(255, 140, 0, 0.1)',
    },
    {
      label: 'Removal Eligible',
      value: metrics?.members_removal_eligible || 0,
      color: 'var(--danger)',
      bgColor: 'rgba(255, 77, 77, 0.1)',
    },
  ];

  return (
    <div>
      <div className="gradient-header" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of WeVysya operations</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {metricCards.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <span style={{ fontSize: '1.5rem', color: card.color, fontWeight: 700 }}>{card.value}</span>
            </div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{card.label}</h3>
          </div>
        ))}
      </div>

      {(metrics?.members_on_probation || 0) + (metrics?.members_category_open || 0) + (metrics?.members_removal_eligible || 0) > 0 && (
        <div
          style={{
            marginTop: '2rem',
            backgroundColor: 'rgba(255, 140, 0, 0.1)',
            border: '1px solid rgba(255, 140, 0, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#FFA500' }}>Attendance Alerts</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            There are members requiring attention. Review the Attendance section for details.
          </p>
        </div>
      )}
    </div>
  );
}
