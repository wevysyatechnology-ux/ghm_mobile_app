import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { profile, signOut } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/members', label: 'Members', icon: '👥' },
    { path: '/houses', label: 'Houses', icon: '🏠' },
    { path: '/attendance', label: 'Attendance', icon: '✓' },
    { path: '/approvals', label: 'Approvals', icon: '✔️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>WeVysya</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>GHM Portal</p>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 0' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.5rem',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(42, 255, 106, 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                fontSize: '0.9375rem',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
                textDecoration: 'none',
              })}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              {profile?.full_name || 'Admin User'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {profile?.admin_role?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Admin'}
            </p>
          </div>
          <button
            onClick={signOut}
            style={{
              width: '100%',
              padding: '0.625rem',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-base)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: '260px', flex: 1, padding: '2rem', maxWidth: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
}
