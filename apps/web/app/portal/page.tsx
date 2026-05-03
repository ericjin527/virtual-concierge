'use client';
import { useUser, UserButton } from '@clerk/nextjs';

const A = '#1a1714';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';

export default function PortalPage() {
  const { user } = useUser();

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: '#faf9f6', color: A }}>

      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '1rem 2.5rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', color: A, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
          Local Butler
        </a>
        <UserButton afterSignOutUrl="/" />
      </nav>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '4.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: A, fontFamily: 'Georgia, serif', letterSpacing: '-0.025em', margin: '0 0 0.5rem' }}>
            {user?.firstName ? `Welcome back, ${user.firstName}` : 'Welcome back'}
          </h1>
          <p style={{ color: MUTED, fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
            What would you like to do today?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a href="/account" style={{
            background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12,
            padding: '1.5rem 1.75rem', textDecoration: 'none', color: 'inherit',
            display: 'flex', alignItems: 'center', gap: '1.25rem',
          }}>
            <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>✈️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: A, fontFamily: 'Georgia, serif', marginBottom: 3 }}>
                Plan a trip
              </div>
              <div style={{ color: MUTED, fontSize: '0.84rem', lineHeight: 1.6 }}>
                View your bookings and start new travel experiences
              </div>
            </div>
            <span style={{ color: FAINT, fontSize: '1.1rem' }}>›</span>
          </a>

          <a href="/expert" style={{
            background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12,
            padding: '1.5rem 1.75rem', textDecoration: 'none', color: 'inherit',
            display: 'flex', alignItems: 'center', gap: '1.25rem',
          }}>
            <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>🧭</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: A, fontFamily: 'Georgia, serif', marginBottom: 3 }}>
                Expert dashboard
              </div>
              <div style={{ color: MUTED, fontSize: '0.84rem', lineHeight: 1.6 }}>
                Manage your expert profile and incoming task requests
              </div>
            </div>
            <span style={{ color: FAINT, fontSize: '1.1rem' }}>›</span>
          </a>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2.25rem', fontSize: '0.78rem', color: FAINT, lineHeight: 1.6 }}>
          You can use Local Butler as both a traveler and a local expert.
        </p>
      </div>
    </div>
  );
}
