'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { s } from '../../../../lib/styles';

interface Expert { id: string; name: string; phone: string; category: string; serviceArea: string }
interface Task {
  id: string; category: string; status: string; urgency?: string;
  address?: string; createdAt: string; intakeBrief: Record<string, any>;
  lead?: { name?: string; phone?: string; email?: string };
  expert?: Expert;
  quotes: Array<{ id: string; amount: number; description: string; status: string; expert: Expert }>;
  messages: Array<{ id: string; fromRole: string; body: string; createdAt: string }>;
}

const STATUSES = ['new','matched','accepted','diagnosing','quote_submitted','quote_approved','in_progress','completed','cancelled','declined'];

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const [t, ex] = await Promise.all([
      api.getTask(id) as Promise<Task>,
      api.getExperts() as Promise<Expert[]>,
    ]);
    setTask(t);
    setExperts(ex.filter(e => e.category === t.category));
    setLoading(false);
  }

  async function assign(expertId: string) {
    setSaving(true);
    await api.assignExpert(id, expertId);
    await load();
    setSaving(false);
  }

  async function setStatus(status: string) {
    setSaving(true);
    await api.updateTaskStatus(id, status);
    await load();
    setSaving(false);
  }

  if (loading) return <div style={s.page}><p>Loading...</p></div>;
  if (!task) return <div style={s.page}><p style={{ color: '#b91c1c' }}>Task not found.</p></div>;

  const brief = task.intakeBrief as Record<string, any>;

  return (
    <div style={s.page}>
      <a href="/dashboard/tasks" style={s.backLink}>← Tasks</a>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <h1 style={{ ...s.h1, marginBottom: 0 }}>{task.lead?.name ?? 'Unknown'} — {task.category.replace(/_/g, ' ')}</h1>
        <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700, background: '#f3f4f6' }}>{task.status.replace(/_/g, ' ')}</span>
      </div>

      {/* Intake brief */}
      <div style={s.card}>
        <h2 style={s.h2}>Intake Brief</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <tbody>
            {Object.entries(brief).filter(([k]) => k !== 'complete').map(([k, v]) => (
              <tr key={k} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.4rem 0', color: '#6b7280', width: '40%', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</td>
                <td style={{ padding: '0.4rem 0', fontWeight: 500 }}>{String(v ?? '—')}</td>
              </tr>
            ))}
            {task.address && (
              <tr>
                <td style={{ padding: '0.4rem 0', color: '#6b7280' }}>Address</td>
                <td style={{ padding: '0.4rem 0', fontWeight: 500 }}>{task.address}</td>
              </tr>
            )}
          </tbody>
        </table>
        {task.lead?.phone && <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 8, marginBottom: 0 }}>Contact: {task.lead.name} · {task.lead.phone}</p>}
      </div>

      {/* Assign expert */}
      <div style={s.card}>
        <h2 style={s.h2}>Assign Expert</h2>
        {task.expert ? (
          <div style={{ fontWeight: 600 }}>Assigned: {task.expert.name} · {task.expert.phone}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {experts.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No approved experts in this category yet.</p>}
            {experts.map(ex => (
              <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ex.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{ex.serviceArea}</div>
                </div>
                <button style={s.btnPrimary} disabled={saving} onClick={() => assign(ex.id)}>Assign</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status update */}
      <div style={s.card}>
        <h2 style={s.h2}>Update Status</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {STATUSES.map(st => (
            <button key={st} onClick={() => setStatus(st)} disabled={saving || task.status === st} style={{
              ...s.btnSecondary,
              background: task.status === st ? '#111' : '#f3f4f6',
              color: task.status === st ? '#fff' : '#111',
              fontSize: '0.78rem', padding: '0.3rem 0.7rem',
            }}>
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {task.messages.length > 0 && (
        <div style={s.card}>
          <h2 style={s.h2}>Activity</h2>
          {task.messages.map(m => (
            <div key={m.id} style={{ borderBottom: '1px solid #f3f4f6', padding: '0.5rem 0', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600, color: m.fromRole === 'butler' ? '#7c3aed' : '#374151', marginRight: 6 }}>{m.fromRole}</span>
              {m.body}
              <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: 8 }}>{new Date(m.createdAt).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
