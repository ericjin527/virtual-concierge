'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExpertApi } from '../../../../lib/expert-api';

interface Task {
  id: string; category: string; status: string; urgency?: string;
  createdAt: string; claimedAt?: string; completedAt?: string;
  intakeBrief: { title?: string; description?: string; day?: string; time?: string };
  deliverable?: Record<string, any>;
  lead?: { name?: string; phone?: string };
  experience?: { city?: string; dates?: string; travelers?: number; budget?: string };
}

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🚗', restaurant_expert: '🍽️', errand_helper: '📦', local_guide: '🗺️',
  photographer: '📷', private_chef: '👨‍🍳', cleaner: '🧹', florist: '💐', family_helper: '👨‍👧', party_helper: '🎉',
};

const DELIVERABLE_FIELDS: Record<string, { label: string; placeholder: string }[]> = {
  restaurant_expert: [
    { label: 'Restaurant name', placeholder: 'e.g. Cotogna' },
    { label: 'Confirmation number', placeholder: 'e.g. #48821' },
    { label: 'Confirmed time', placeholder: 'e.g. 7:30 PM' },
    { label: 'Note to traveler', placeholder: 'Any special arrangements...' },
  ],
  driver: [
    { label: 'Meeting point', placeholder: 'e.g. Terminal 2, Arrivals' },
    { label: 'Confirmed time', placeholder: 'e.g. 3:15 PM' },
    { label: 'Vehicle description', placeholder: 'e.g. Black Tesla Model S' },
    { label: 'Note to traveler', placeholder: 'Anything else...' },
  ],
  photographer: [
    { label: 'Photo delivery link', placeholder: 'Google Drive / Dropbox URL' },
    { label: 'Number of photos', placeholder: 'e.g. 47' },
    { label: 'Note to traveler', placeholder: 'Highlights, best shots...' },
  ],
  local_guide: [
    { label: 'Meeting point', placeholder: 'e.g. Ferry Building entrance' },
    { label: 'Confirmed time', placeholder: 'e.g. 10:00 AM' },
    { label: 'What to bring / wear', placeholder: 'e.g. Comfortable shoes' },
    { label: 'Note to traveler', placeholder: 'Anything else...' },
  ],
};
const DEFAULT_FIELDS = [
  { label: 'What was done', placeholder: 'Summary of what was completed...' },
  { label: 'Note to traveler', placeholder: 'Any important details...' },
];

export default function ExpertTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();
  const expertApi = useExpertApi();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');
  const [deliverable, setDeliverable] = useState<Record<string, string>>({});

  useEffect(() => {
    expertApi.getMyTaskDetail(taskId)
      .then(t => { setTask(t as Task); setLoading(false); })
      .catch(() => setLoading(false));
  }, [taskId]);

  async function handleStart() {
    setActing(true); setError('');
    try {
      const updated = await expertApi.startTask(taskId) as Task;
      setTask(updated);
    } catch (e: any) { setError(e.message ?? 'Failed.'); }
    setActing(false);
  }

  async function handleComplete() {
    setActing(true); setError('');
    try {
      await expertApi.completeTask(taskId, deliverable);
      router.push('/expert/my-tasks');
    } catch (e: any) { setError(e.message ?? 'Failed.'); setActing(false); }
  }

  if (loading) return <div style={{ fontFamily: 'system-ui', padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>;
  if (!task) return <div style={{ fontFamily: 'system-ui', padding: '3rem', textAlign: 'center', color: '#b91c1c' }}>Task not found or not assigned to you.</div>;

  const fields = DELIVERABLE_FIELDS[task.category] ?? DEFAULT_FIELDS;
  const icon = CATEGORY_ICONS[task.category] ?? '📋';

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', minHeight: '100vh', background: '#fafafa' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '0.85rem 1.5rem', background: '#fff', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <a href="/expert/my-tasks" style={{ fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none' }}>← My Tasks</a>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Task header */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem' }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                {task.intakeBrief.title ?? task.category.replace(/_/g, ' ')}
              </h1>
              <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 2 }}>
                {task.experience?.city} · {task.intakeBrief.day}{task.intakeBrief.time ? ` · ${task.intakeBrief.time}` : ''}
              </div>
            </div>
            <span style={{ background: task.status === 'completed' ? '#d1fae5' : task.status === 'in_progress' ? '#ede9fe' : '#dbeafe', color: task.status === 'completed' ? '#065f46' : task.status === 'in_progress' ? '#6d28d9' : '#1d4ed8', padding: '3px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700 }}>
              {task.status.replace(/_/g, ' ')}
            </span>
          </div>
          {task.intakeBrief.description && (
            <p style={{ margin: '0.75rem 0 0', color: '#374151', fontSize: '0.88rem', lineHeight: 1.6 }}>
              {task.intakeBrief.description}
            </p>
          )}
        </div>

        {/* Trip context */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Trip Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.88rem' }}>
            {task.experience?.city && <div><span style={{ color: '#6b7280' }}>City: </span>{task.experience.city}</div>}
            {task.experience?.dates && <div><span style={{ color: '#6b7280' }}>Dates: </span>{task.experience.dates}</div>}
            {task.experience?.travelers && <div><span style={{ color: '#6b7280' }}>Travelers: </span>{task.experience.travelers}</div>}
            {task.experience?.budget && <div><span style={{ color: '#6b7280' }}>Budget: </span>{task.experience.budget}</div>}
          </div>
        </div>

        {/* Traveler contact (revealed after accept) */}
        {task.lead && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Traveler Contact</div>
            <div style={{ fontSize: '0.9rem' }}>
              {task.lead.name && <div style={{ fontWeight: 600 }}>{task.lead.name}</div>}
              {task.lead.phone && (
                <a href={`https://wa.me/${task.lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                  📱 {task.lead.phone} (WhatsApp)
                </a>
              )}
            </div>
          </div>
        )}

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.88rem' }}>{error}</div>}

        {/* Actions */}
        {task.status === 'accepted' && (
          <button onClick={handleStart} disabled={acting} style={{ padding: '0.85rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '1rem', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1 }}>
            {acting ? 'Starting...' : 'Start working on this task →'}
          </button>
        )}

        {task.status === 'in_progress' && task.status !== 'completed' && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '1rem' }}>Submit your deliverable</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {fields.map(f => (
                <div key={f.label}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4, color: '#374151' }}>{f.label}</label>
                  <input
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }}
                    value={deliverable[f.label] ?? ''}
                    onChange={e => setDeliverable(d => ({ ...d, [f.label]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>
            <button onClick={handleComplete} disabled={acting} style={{ marginTop: '1rem', width: '100%', padding: '0.85rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '1rem', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1 }}>
              {acting ? 'Submitting...' : '✓ Mark complete & submit'}
            </button>
          </div>
        )}

        {task.status === 'completed' && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1.25rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>✓</div>
            <div style={{ fontWeight: 700, color: '#065f46' }}>Task completed</div>
            {task.completedAt && <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 4 }}>{new Date(task.completedAt).toLocaleString()}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
