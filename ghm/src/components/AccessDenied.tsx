import { useAuth } from '../contexts/AuthContext';

export default function AccessDenied() {
  const { signOut } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-base)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(255, 77, 77, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--danger)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 style={{ marginBottom: '1rem', fontSize: '1.75rem' }}>Access Restricted</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>
          You don't have permission to access the GHM portal. Only users with admin roles can access this system.
        </p>
        <button
          onClick={signOut}
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--bg-base)',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
