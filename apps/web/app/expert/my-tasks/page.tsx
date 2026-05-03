'use client';
import { useEffect, useState } from 'react';
import { useExpertApi } from '../../../lib/expert-api';

interface Task {
  id: string; category: string; status: string;
  intakeBrief: { title?: string; day?: string; time?: string };
  experience?: { city?: string };
  claimedAt?: string; completedAt?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🚗', restaurant_expert: '🍽️', errand_helper: '📦', local_guide: '🗺️',
  photographer: '📷', private_chef: '👨‍🍳', cleaner: '🧹', florist: '💐', family_helper: '👨‍👧', party_helper: '🎉',
};
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  accepted:    { label: 'Accepted',    bg: '#dbeafe', color: '#1d4ed8' },
  in_progress: { label: 'In Progress', bg: '#ede9fe', color: '#6d28d9' },
  completed:   { label: 'Complete',    bg: '#d1fae5', color: '#065f46' },
  cancelled:   { label: 'Cancelled',   bg: '#f3f4f6', color: '#6b7280' },
};
const TABS = ['active', 'completed', 'all'] as const;
type Tab = typeof TABS[number];

export default function MyTasksPage() {
  const expertApi = useExpertApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('active');

  useEffect(() => { load(); }, []);

  async function load() {
    try { setTasks(await expertApi.getMyTasks() as Task[]); }
    catch { setTasks([]); }
    setLoading(false);
  }

  const filtered = tasks.filter(t => {
    if (tab === 'active') return ['accepted', 'in_progress'].includes(t.status);
    if (tab === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', minHeight: '100vh', background: '#f3f4f6' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '0.85rem 1.5rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <a href="/expert/jobs" style={{ fontSize: '0.88rem', color: '#6b7280', textDecoration: 'none' }}>Browse Jobs</a>
          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>My Tasks</span>
          <a href="/expert/dashboard" style={{ fontSize: '0.88rem', color: '#6b7280', textDecoration: 'none' }}>Dashboard</a>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>My Tasks</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.35rem', width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.4rem 0.9rem', borderRadius: 7, border: 'none',
              background: tab === t ? '#111' : 'transparent',
              color: tab === t ? '#fff' : '#6b7280', cursor: 'pointer',
              fontWeight: tab === t ? 700 : 400, fontSize: '0.85rem', textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>
            {tab === 'active' ? (
              <>No active tasks. <a href="/expert/jobs" style={{ color: '#374151', fontWeight: 600 }}>Browse open jobs →</a></>
            ) : 'No tasks found.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {filtered.map(task => {
              const st = STATUS_CONFIG[task.status] ?? { label: 'Unknown', bg: '#f3f4f6', color: '#6b7280' };
              return (
                <a key={task.id} href={`/expert/my-tasks/${task.id}`} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                  <span style={{ fontSize: '1.2rem' }}>{CATEGORY_ICONS[task.category] ?? '📋'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.intakeBrief.title ?? task.category}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 1 }}>
                      {task.experience?.city} · {task.intakeBrief.day}{task.intakeBrief.time ? ` · ${task.intakeBrief.time}` : ''}
                    </div>
                  </div>
                  <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>{st.label}</span>
                  <span style={{ color: '#d1d5db' }}>›</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
