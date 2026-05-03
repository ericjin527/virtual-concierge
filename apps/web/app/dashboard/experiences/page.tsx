'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

interface Experience {
  id: string; type: string; city?: string; dates?: string; occasion?: string;
  travelers: number; budget?: string; status: string; createdAt: string;
  lead?: { name?: string; phone?: string };
  _count: { tasks: number };
}

const A = '#1a1714';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  intake:          { bg: '#f0f9ff', color: '#0369a1' },
  plan_ready:      { bg: '#eff6ff', color: '#1d4ed8' },
  in_coordination: { bg: '#faf5ff', color: '#7c3aed' },
  confirmed:       { bg: '#ecfdf5', color: '#065f46' },
  in_progress:     { bg: '#eff6ff', color: '#1d4ed8' },
  completed:       { bg: '#ecfdf5', color: '#065f46' },
  cancelled:       { bg: '#f9fafb', color: '#6b7280' },
};

const STATUSES = ['', 'intake', 'plan_ready', 'in_coordination', 'confirmed', 'in_progress', 'completed'];

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { load(); }, [filter]);

  async function load() {
    setLoading(true);
    try { setExperiences(await api.getExperiences(filter || undefined) as Experience[]); }
    catch { setExperiences([]); }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: A, letterSpacing: '-0.025em', margin: 0, fontFamily: 'Georgia, serif' }}>
          Experiences
        </h1>
        <p style={{ color: MUTED, fontSize: '0.85rem', marginTop: 5, margin: '5px 0 0' }}>
          All traveler requests, from intake to completion.
        </p>
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.5rem' }}>
        {STATUSES.map(st => (
          <button key={st} onClick={() => setFilter(st)} style={{
            padding: '0.35rem 0.9rem', borderRadius: 20, border: `1px solid ${filter === st ? A : BORDER}`,
            background: filter === st ? A : '#fff', color: filter === st ? '#fff' : MUTED,
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: filter === st ? 600 : 400,
          }}>
            {st ? st.replace(/_/g, ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: FAINT, fontSize: '0.88rem', padding: '2rem 0' }}>Loading...</div>}

      {!loading && experiences.length === 0 && (
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '3rem', textAlign: 'center', color: FAINT, fontSize: '0.88rem' }}>
          No experiences found.
        </div>
      )}

      {!loading && experiences.length > 0 && (
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
          {experiences.map((exp, i) => {
            const st = STATUS_STYLE[exp.status] ?? { bg: '#f9fafb', color: '#6b7280' };
            return (
              <a key={exp.id} href={`/dashboard/experiences/${exp.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                borderBottom: i < experiences.length - 1 ? `1px solid ${BORDER}` : 'none',
                textDecoration: 'none', color: 'inherit',
              }}>
                <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                  {exp.type === 'local_visit' ? '✈️' : '🏠'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: A }}>
                    {exp.lead?.name ?? 'Unknown traveler'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 2 }}>
                    {[exp.city, exp.dates, exp.occasion].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: FAINT, marginTop: 1 }}>
                    {exp._count.tasks} task{exp._count.tasks !== 1 ? 's' : ''} · {exp.travelers} traveler{exp.travelers !== 1 ? 's' : ''}
                    {exp.budget ? ` · ${exp.budget}` : ''}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600 }}>
                    {exp.status.replace(/_/g, ' ')}
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
  );
}
