'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

const A = '#1a1714';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';

export default function DashboardPage() {
  const [counts, setCounts] = useState({ pending: 0, openTasks: 0, experiences: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAdminExperts('pending').catch(() => []),
      api.getTasks('new').catch(() => []),
      api.getExperiences('in_coordination').catch(() => []),
    ]).then(([experts, tasks, experiences]) => {
      setCounts({
        pending: (experts as any[]).length,
        openTasks: (tasks as any[]).length,
        experiences: (experiences as any[]).length,
      });
      setLoading(false);
    });
  }, []);

  const stats = [
    { label: 'Experts awaiting approval', value: counts.pending, href: '/dashboard/experts?status=pending', urgent: counts.pending > 0 },
    { label: 'Open tasks (unassigned)', value: counts.openTasks, href: '/dashboard/tasks?status=new', urgent: false },
    { label: 'Active experiences', value: counts.experiences, href: '/dashboard/experiences?status=in_coordination', urgent: false },
  ];

  const quickLinks = [
    { label: 'Experts', desc: 'Approve, suspend, and manage expert profiles', href: '/dashboard/experts' },
    { label: 'Tasks', desc: 'View all tasks across all experiences', href: '/dashboard/tasks' },
    { label: 'Experiences', desc: 'Track traveler requests end-to-end', href: '/dashboard/experiences' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: A, letterSpacing: '-0.025em', margin: 0, fontFamily: 'Georgia, serif' }}>
          Good morning
        </h1>
        <p style={{ color: MUTED, fontSize: '0.9rem', marginTop: 6, margin: '6px 0 0' }}>
          Here's what needs your attention today.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {stats.map(s => (
          <a key={s.label} href={s.href} style={{ textDecoration: 'none', display: 'block', background: '#fff', border: `1px solid ${s.urgent ? '#f59e0b' : BORDER}`, borderRadius: 10, padding: '1.25rem 1.5rem' }}>
            {loading ? (
              <div style={{ height: 36, background: '#f5f0ea', borderRadius: 6, marginBottom: 8 }} />
            ) : (
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.urgent ? '#b45309' : A, letterSpacing: '-0.03em', marginBottom: 4 }}>
                {s.value}
              </div>
            )}
            <div style={{ fontSize: '0.82rem', color: MUTED }}>{s.label}</div>
            {s.urgent && s.value > 0 && (
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#b45309', marginTop: 4 }}>Needs review →</div>
            )}
          </a>
        ))}
      </div>

      {/* Quick nav */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: FAINT, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Sections
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {quickLinks.map(l => (
            <a key={l.href} href={l.href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10,
              padding: '1rem 1.25rem', textDecoration: 'none', color: 'inherit',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: A }}>{l.label}</div>
                <div style={{ fontSize: '0.8rem', color: MUTED, marginTop: 2 }}>{l.desc}</div>
              </div>
              <span style={{ color: FAINT, fontSize: '1rem' }}>›</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
