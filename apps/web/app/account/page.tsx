'use client';
import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useAccountApi } from '../../lib/account-api';

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
  const accountApi = useAccountApi();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    accountApi.getMyExperiences()
      .then(data => setExperiences(data as Experience[]))
      .catch(() => setExperiences([]))
      .finally(() => setLoading(false));
  }, []);

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

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '3rem 1.5rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: A, letterSpacing: '-0.025em', fontFamily: 'Georgia, serif', margin: '0 0 0.35rem' }}>
            {user?.firstName ? `Welcome back, ${user.firstName}` : 'My bookings'}
          </h1>
          <p style={{ color: MUTED, fontSize: '0.88rem', margin: 0 }}>
            Your Local Butler experiences.
          </p>
        </div>

        {loading && (
          <div style={{ color: FAINT, fontSize: '0.88rem', padding: '2rem 0' }}>Loading your bookings...</div>
        )}

        {!loading && experiences.length === 0 && (
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>✈️</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: A, marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>
              No bookings yet
            </div>
            <p style={{ color: MUTED, fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              When you plan a visit using this account, your bookings will appear here.
            </p>
            <a href="/travel" style={{
              display: 'inline-block', background: A, color: '#fff',
              padding: '0.65rem 1.5rem', borderRadius: 9,
              textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
            }}>
              Plan your first visit →
            </a>
          </div>
        )}

        {!loading && experiences.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {experiences.map(exp => {
              const st = STATUS_STYLE[exp.status] ?? { bg: '#f9fafb', color: '#6b7280', label: exp.status };
              return (
                <a
                  key={exp.id}
                  href={`/travel/experience/${exp.id}`}
                  style={{
                    background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10,
                    padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center',
                    gap: '1rem', textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>✈️</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: A }}>
                      {exp.city ?? 'Local visit'}
                      {exp.dates ? ` · ${exp.dates}` : ''}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 2 }}>
                      {exp.travelers} traveler{exp.travelers !== 1 ? 's' : ''}
                      {exp._count.tasks > 0 ? ` · ${exp._count.tasks} task${exp._count.tasks !== 1 ? 's' : ''}` : ''}
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
        )}
      </div>
    </div>
  );
}
