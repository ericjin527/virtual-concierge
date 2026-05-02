'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { s } from '../../../../lib/styles';

interface Expert { id: string; name: string; phone: string; category: string }
interface Task {
  id: string; category: string; status: string;
  intakeBrief: Record<string, any>;
  expert?: Expert;
  messages: Array<{ id: string; fromRole: string; body: string; createdAt: string }>;
}
interface Experience {
  id: string; type: string; city?: string; dates?: string; occasion?: string;
  travelers: number; vibe?: string; budget?: string; hotelBase?: string;
  aiBrief: Record<string, any>; status: string; createdAt: string;
  lead?: { name?: string; phone?: string };
  tasks: Task[];
}

const EXP_STATUSES = ['intake','plan_ready','in_coordination','confirmed','in_progress','completed','cancelled'];

const TASK_STATUS_COLORS: Record<string, string> = {
  new: '#fef3c7', matched: '#dbeafe', accepted: '#ede9fe',
  in_progress: '#dbeafe', completed: '#d1fae5', cancelled: '#f3f4f6',
};

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🚗', restaurant_expert: '🍽️', errand_helper: '📦', local_guide: '🗺️',
  photographer: '📷', private_chef: '👨‍🍳', cleaner: '🧹', florist: '💐',
  family_helper: '👨‍👧', party_helper: '🎉',
};

export default function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [exp, setExp] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    try { setExp(await api.getExperience(id) as Experience); }
    catch { setExp(null); }
    finally { setLoading(false); }
  }

  async function setStatus(status: string) {
    setSaving(true);
    await api.updateExperienceStatus(id, status);
    await load();
    setSaving(false);
  }

  if (loading) return <div style={s.page}><p>Loading...</p></div>;
  if (!exp) return <div style={s.page}><p style={{ color: '#b91c1c' }}>Experience not found.</p></div>;

  const brief = exp.aiBrief as Record<string, any>;

  return (
    <div style={s.page}>
      <a href="/dashboard/experiences" style={s.backLink}>← Experiences</a>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <h1 style={{ ...s.h1, marginBottom: 0 }}>
          {exp.lead?.name ?? 'Unknown'} — {exp.type === 'local_visit' ? '✈️ Local Visit' : '🏠 Hosting'}
          {exp.city ? ` to ${exp.city}` : ''}
        </h1>
        <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700, background: '#f3f4f6' }}>{exp.status.replace(/_/g, ' ')}</span>
      </div>

      {/* Brief summary */}
      <div style={s.card}>
        <h2 style={s.h2}>Experience Brief</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <tbody>
            {[
              ['City', exp.city],
              ['Dates', exp.dates],
              ['Occasion / Reason', exp.occasion],
              ['Travelers', exp.travelers],
              ['Hotel / Base', exp.hotelBase],
              ['Budget', exp.budget],
              ['Vibe / Preference', exp.vibe],
              ['Practical needs', brief.practicalNeeds],
              ['Experience needs', brief.experienceNeeds],
            ].filter(([, v]) => v).map(([k, v]) => (
              <tr key={String(k)} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.4rem 0', color: '#6b7280', width: '40%' }}>{k}</td>
                <td style={{ padding: '0.4rem 0', fontWeight: 500 }}>{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {exp.lead?.phone && (
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 8, marginBottom: 0 }}>
            Contact: {exp.lead.name} · {exp.lead.phone}
          </p>
        )}
      </div>

      {/* Task board */}
      <div style={s.card}>
        <h2 style={s.h2}>Task Board ({exp.tasks.length})</h2>
        {exp.tasks.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No tasks yet.</p>}
        {exp.tasks.map(task => {
          const desc = (task.intakeBrief as any)?.description ?? task.category.replace(/_/g, ' ');
          const deadline = (task.intakeBrief as any)?.deadline;
          return (
            <div key={task.id} style={{ borderBottom: '1px solid #f3f4f6', padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {CATEGORY_ICONS[task.category] ?? '📋'} {desc}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>
                  {task.category.replace(/_/g, ' ')}{deadline ? ` · ${deadline}` : ''}
                  {task.expert ? ` · Assigned to ${task.expert.name}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ background: TASK_STATUS_COLORS[task.status] ?? '#f3f4f6', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>
                  {task.status.replace(/_/g, ' ')}
                </span>
                <a href={`/dashboard/tasks/${task.id}`} style={{ ...s.btnSecondary, fontSize: '0.75rem', padding: '0.2rem 0.6rem', textDecoration: 'none' }}>
                  Manage →
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status update */}
      <div style={s.card}>
        <h2 style={s.h2}>Update Status</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {EXP_STATUSES.map(st => (
            <button key={st} onClick={() => setStatus(st)} disabled={saving || exp.status === st} style={{
              ...s.btnSecondary,
              background: exp.status === st ? '#111' : '#f3f4f6',
              color: exp.status === st ? '#fff' : '#111',
              fontSize: '0.78rem', padding: '0.3rem 0.7rem',
            }}>
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
