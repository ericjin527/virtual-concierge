'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { s } from '../../../lib/styles';

interface Lead { name?: string; phone?: string }
interface Expert { name: string }
interface Task {
  id: string; category: string; status: string; urgency?: string;
  address?: string; createdAt: string; lead?: Lead; expert?: Expert;
  intakeBrief: Record<string, any>;
}

const STATUS_COLORS: Record<string, string> = {
  new: '#fef3c7', matched: '#dbeafe', accepted: '#ede9fe',
  diagnosing: '#ede9fe', quote_submitted: '#fef3c7', quote_approved: '#d1fae5',
  in_progress: '#dbeafe', completed: '#d1fae5', cancelled: '#f3f4f6', declined: '#fee2e2',
};

const CATEGORY_LABELS: Record<string, string> = {
  appliance_repair: '🔧 Appliance', event_booking: '🎉 Event', parenting_logistics: '👨‍👧 Parenting',
};

export default function TasksAdminPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { load(); }, [filter]);

  async function load() {
    setLoading(true);
    try { setTasks(await api.getTasks(filter || undefined) as Task[]); }
    catch { setTasks([]); }
    finally { setLoading(false); }
  }

  return (
    <div style={s.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ ...s.h1, marginBottom: 0 }}>Incoming Tasks</h1>
        <a href="/dashboard/applications" style={s.link}>Vendor Applications →</a>
      </div>

      <div style={{ ...s.row, marginBottom: '1rem' }}>
        {['', 'new', 'matched', 'accepted', 'completed'].map(st => (
          <button key={st} onClick={() => setFilter(st)} style={{
            ...s.btnSecondary, background: filter === st ? '#111' : '#f3f4f6', color: filter === st ? '#fff' : '#111',
          }}>
            {st || 'All'}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#9ca3af' }}>Loading...</p>}

      {!loading && tasks.length === 0 && (
        <div style={{ ...s.card, textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No tasks yet.</div>
      )}

      {tasks.map(task => (
        <a key={task.id} href={`/dashboard/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{ ...s.card, borderLeft: '4px solid #111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  {task.lead?.name ?? 'Unknown'} — {CATEGORY_LABELS[task.category] ?? task.category}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                  {task.intakeBrief?.applianceType ?? ''}{task.intakeBrief?.symptoms ? ` · ${task.intakeBrief.symptoms}` : ''}
                  {task.address ? ` · ${task.address}` : ''}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                  {new Date(task.createdAt).toLocaleString()}
                  {task.expert ? ` · Assigned to ${task.expert.name}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {task.urgency === 'today' && <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>URGENT</span>}
                <span style={{ background: STATUS_COLORS[task.status] ?? '#f3f4f6', padding: '2px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600 }}>
                  {task.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
