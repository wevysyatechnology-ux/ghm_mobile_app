import { useEffect, useState } from 'react';
import { housesService } from '../services/housesService';
import type { HouseWithStats } from '../types/database';

export default function HousesPage() {
  const [houses, setHouses] = useState<HouseWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHouses();
  }, []);

  async function loadHouses() {
    try {
      const data = await housesService.getAllHouses();
      setHouses(data);
    } catch (error) {
      console.error('Error loading houses:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading houses...</div>;
  }

  return (
    <div>
      <div className="gradient-header" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Houses Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage houses and their members</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {houses.map((house) => (
          <div
            key={house.id}
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
                backgroundColor: 'rgba(42, 255, 106, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🏠</span>
            </div>

            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {house.house_name}
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {house.city}, {house.state}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{house.country}</p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Total Members
                </p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {house.total_members}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Active Members
                </p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                  {house.active_members}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {houses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No houses found</div>
      )}
    </div>
  );
}
