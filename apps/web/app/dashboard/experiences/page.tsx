'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { s } from '../../../lib/styles';

interface Experience {
  id: string; type: string; city?: string; dates?: string; occasion?: string;
  travelers: number; budget?: string; status: string; createdAt: string;
  lead?: { name?: string; phone?: string };
  _count: { tasks: number };
}

const STATUS_COLORS: Record<string, string> = {
  intake: '#fef3c7', plan_ready: '#dbeafe', in_coordination: '#ede9fe',
  confirmed: '#d1fae5', in_progress: '#dbeafe', completed: '#d1fae5',
  cancelled: '#f3f4f6',
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
    finally { setLoading(false); }
  }

  return (
    <div style={s.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ ...s.h1, marginBottom: 0 }}>Experiences</h1>
        <div style={s.row}>
          <a href="/dashboard/tasks" style={s.link}>Tasks</a>
          <a href="/dashboard/applications" style={s.link}>Applications</a>
        </div>
      </div>

      <div style={{ ...s.row, marginBottom: '1rem' }}>
        {STATUSES.map(st => (
          <button key={st} onClick={() => setFilter(st)} style={{
            ...s.btnSecondary, background: filter === st ? '#111' : '#f3f4f6', color: filter === st ? '#fff' : '#111',
          }}>
            {st ? st.replace(/_/g, ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#9ca3af' }}>Loading...</p>}

      {!loading && experiences.length === 0 && (
        <div style={{ ...s.card, textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No experiences yet.</div>
      )}

      {experiences.map(exp => (
        <a key={exp.id} href={`/dashboard/experiences/${exp.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{ ...s.card, borderLeft: '4px solid #6d28d9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  {exp.lead?.name ?? 'Unknown'} — {exp.type === 'local_visit' ? '✈️ Local Visit' : '🏠 Hosting'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                  {exp.city ?? '—'}{exp.dates ? ` · ${exp.dates}` : ''}{exp.occasion ? ` · ${exp.occasion}` : ''}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                  {exp._count.tasks} task{exp._count.tasks !== 1 ? 's' : ''} · {exp.travelers} traveler{exp.travelers !== 1 ? 's' : ''}
                  {exp.budget ? ` · ${exp.budget}` : ''}
                  {' · '}{new Date(exp.createdAt).toLocaleString()}
                </div>
              </div>
              <span style={{ background: STATUS_COLORS[exp.status] ?? '#f3f4f6', padding: '2px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600 }}>
                {exp.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
