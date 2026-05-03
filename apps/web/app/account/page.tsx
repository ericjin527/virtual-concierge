'use client';
import { useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { api } from '../../lib/api';

const A = '#1a1714';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  intake:          { bg: '#f0f9ff', color: '#0369a1', label: 'In review' },
  plan_ready:      { bg: '#eff6ff', color: '#1d4ed8', label: 'Plan ready' },
  in_coordination: { bg: '#faf5ff', color: '#7c3aed', label: 'Coordinating' },
  confirmed:       { bg: '#ecfdf5', color: '#065f46', label: 'Confirmed' },
  in_progress:     { bg: '#eff6ff', color: '#1d4ed8', label: 'In progress' },
  completed:       { bg: '#ecfdf5', color: '#065f46', label: 'Complete' },
  cancelled:       { bg: '#f9fafb', color: '#6b7280', label: 'Cancelled' },
};

interface Experience {
  id: string; type: string; city?: string; dates?: string; status: string;
  createdAt: string; travelers: number; _count: { tasks: number };
}

export default function AccountPage() {
  const { user } = useUser();
  const [phone, setPhone] = useState('');
  const [experiences, setExperiences] = useState<Experience[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function lookup() {
    setError('');
    const p = phone.trim();
    if (!p) return setError('Please enter your phone number.');
    setLoading(true);
    try {
      const results = await api.getExperiencesByPhone(p) as Experience[];
      setExperiences(results);
      if (results.length === 0) setError('No bookings found for that number. Make sure it matches what you entered when booking.');
    } catch {
      setError('Failed to look up bookings. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: '#faf9f6', color: A }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '1rem 2.5rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', color: A, fontFamily: 'Georgia, serif' }}>
          Local Butler
        </a>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/travel" style={{ fontSize: '0.85rem', color: MUTED, textDecoration: 'none' }}>New booking</a>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1.5rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: A, letterSpacing: '-0.025em', fontFamily: 'Georgia, serif', margin: '0 0 0.4rem' }}>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p style={{ color: MUTED, fontSize: '0.88rem', margin: 0 }}>
            Enter the phone number you used when booking to see your experiences.
          </p>
        </div>

        {/* Phone lookup */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: FAINT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Look up your bookings
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
              placeholder="+1 415 000 0000"
              style={{
                flex: 1, padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`,
                borderRadius: 9, fontSize: '0.9rem', outline: 'none', color: A, background: '#fff',
              }}
            />
            <button
              onClick={lookup}
              disabled={loading}
              style={{
                padding: '0.65rem 1.25rem', background: A, color: '#fff', border: 'none',
                borderRadius: 9, cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '0.88rem', opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Looking up...' : 'Find bookings'}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.83rem', color: '#991b1b' }}>{error}</div>
          )}
        </div>

        {/* Results */}
        {experiences !== null && experiences.length > 0 && (
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: FAINT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Your experiences ({experiences.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {experiences.map(exp => {
                const st = STATUS_STYLE[exp.status] ?? { bg: '#f9fafb', color: '#6b7280', label: exp.status };
                return (
                  <a
                    key={exp.id}
                    href={`/travel/experience/${exp.id}`}
                    style={{
                      background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10,
                      padding: '1rem 1.25rem', display: 'flex', alignItems: 'center',
                      gap: '1rem', textDecoration: 'none', color: 'inherit',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{exp.type === 'local_visit' ? '✈️' : '🏠'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: A }}>
                        {exp.type === 'local_visit' ? 'Bay Area Visit' : 'Hosting Experience'}
                        {exp.city ? ` — ${exp.city}` : ''}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 2 }}>
                        {[exp.dates, `${exp.travelers} traveler${exp.travelers !== 1 ? 's' : ''}`, `${exp._count.tasks} task${exp._count.tasks !== 1 ? 's' : ''}`].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600 }}>
                        {st.label}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: FAINT, marginTop: 4 }}>
                        {new Date(exp.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{ color: FAINT }}>›</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* New booking CTA */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: FAINT, fontSize: '0.83rem', marginBottom: '0.75rem' }}>
            Planning something new?
          </p>
          <a href="/travel" style={{
            display: 'inline-block', background: A, color: '#fff', padding: '0.65rem 1.5rem',
            borderRadius: 9, textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
          }}>
            Start a new booking →
          </a>
        </div>
      </div>
    </div>
  );
}
