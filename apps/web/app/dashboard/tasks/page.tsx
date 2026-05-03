'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

interface Task {
  id: string; category: string; status: string; urgency?: string;
  address?: string; createdAt: string;
  lead?: { name?: string; phone?: string };
  expert?: { name: string };
  intakeBrief: Record<string, any>;
  experience?: { city?: string; dates?: string };
}

const A = '#1a1714';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  new:            { bg: '#fffbeb', color: '#92400e' },
  matched:        { bg: '#eff6ff', color: '#1d4ed8' },
  accepted:       { bg: '#eff6ff', color: '#1d4ed8' },
  in_progress:    { bg: '#faf5ff', color: '#7c3aed' },
  completed:      { bg: '#ecfdf5', color: '#065f46' },
  cancelled:      { bg: '#f9fafb', color: '#6b7280' },
  declined:       { bg: '#fef2f2', color: '#991b1b' },
};

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🚗', restaurant_expert: '🍽️', errand_helper: '📦', local_guide: '🗺️',
  photographer: '📷', private_chef: '👨‍🍳', cleaner: '🧹', florist: '💐',
  family_helper: '👨‍👧', party_helper: '🎉',
};

const FILTER_TABS = ['', 'new', 'accepted', 'in_progress', 'completed'];

export default function TasksAdminPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { load(); }, [filter]);

  async function load() {
    setLoading(true);
    try { setTasks(await api.getTasks(filter || undefined) as Task[]); }
    catch { setTasks([]); }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: A, letterSpacing: '-0.025em', margin: 0, fontFamily: 'Georgia, serif' }}>
          Tasks
        </h1>
        <p style={{ color: MUTED, fontSize: '0.85rem', marginTop: 5, margin: '5px 0 0' }}>
          Individual service tasks across all experiences.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9, padding: '0.3rem', width: 'fit-content' }}>
        {FILTER_TABS.map(st => (
          <button key={st} onClick={() => setFilter(st)} style={{
            padding: '0.4rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.82rem',
            background: filter === st ? A : 'transparent',
            color: filter === st ? '#fff' : MUTED,
            fontWeight: filter === st ? 600 : 400,
          }}>
            {st ? st.replace(/_/g, ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: FAINT, fontSize: '0.88rem', padding: '2rem 0' }}>Loading...</div>}

      {!loading && tasks.length === 0 && (
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '3rem', textAlign: 'center', color: FAINT, fontSize: '0.88rem' }}>
          No tasks found.
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
          {tasks.map((task, i) => {
            const st = STATUS_STYLE[task.status] ?? { bg: '#f9fafb', color: '#6b7280' };
            return (
              <a key={task.id} href={`/dashboard/tasks/${task.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                borderBottom: i < tasks.length - 1 ? `1px solid ${BORDER}` : 'none',
                textDecoration: 'none', color: 'inherit',
              }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{CATEGORY_ICONS[task.category] ?? '📋'}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: A }}>
                    {task.lead?.name ?? 'Unknown'} — {task.category.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 2 }}>
                    {task.experience?.city ? `${task.experience.city} · ` : ''}
                    {task.intakeBrief?.title ?? task.intakeBrief?.description ?? ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: FAINT, marginTop: 1 }}>
                    {task.expert ? `Assigned to ${task.expert.name}` : 'Unassigned'}
                    {' · '}{new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {task.urgency === 'today' && (
                    <span style={{ background: '#fef2f2', color: '#991b1b', padding: '1px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700 }}>
                      URGENT
                    </span>
                  )}
                  <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600 }}>
                    {task.status.replace(/_/g, ' ')}
                  </span>
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
