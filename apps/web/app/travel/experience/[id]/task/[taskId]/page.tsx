'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../../../lib/api';

interface Expert { name: string; phone?: string; rating?: number; completedJobs?: number; bio?: string; photoUrl?: string; category?: string }
interface Message { id: string; fromRole: string; body: string; createdAt: string }
interface Task {
  id: string; category: string; status: string; urgency?: string;
  createdAt: string; claimedAt?: string; completedAt?: string;
  cancelReason?: string; deliverable?: Record<string, any>;
  intakeBrief: { title?: string; description?: string; day?: string; time?: string };
  expert?: Expert;
  lead?: { name?: string; phone?: string };
  messages?: Message[];
}

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🚗', restaurant_expert: '🍽️', errand_helper: '📦', local_guide: '🗺️',
  photographer: '📷', private_chef: '👨‍🍳', cleaner: '🧹', florist: '💐',
  family_helper: '👨‍👧', party_helper: '🎉',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new:            { label: 'Open',        color: '#92400e', bg: '#fef3c7' },
  matched:        { label: 'Matched',     color: '#1d4ed8', bg: '#dbeafe' },
  accepted:       { label: 'Accepted',    color: '#1d4ed8', bg: '#dbeafe' },
  in_progress:    { label: 'In Progress', color: '#1d4ed8', bg: '#dbeafe' },
  completed:      { label: 'Complete',    color: '#065f46', bg: '#d1fae5' },
  cancelled:      { label: 'Cancelled',   color: '#6b7280', bg: '#f3f4f6' },
  declined:       { label: 'Declined',    color: '#991b1b', bg: '#fee2e2' },
};

const ROLE_LABELS: Record<string, string> = {
  customer: 'You', expert: 'Expert', admin: 'Support', butler: 'Butler',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function TaskDetailPage() {
  const { id: experienceId, taskId } = useParams<{ id: string; taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTask(taskId).then(t => { setTask(t as Task); setLoading(false); }).catch(() => setLoading(false));
    const interval = setInterval(() => {
      api.getTask(taskId).then(t => setTask(t as Task)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [taskId]);

  if (loading) return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
  );
  if (!task) return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', textAlign: 'center', color: '#b91c1c' }}>Task not found.</div>
  );

  const st = STATUS_CONFIG[task.status] ?? { label: 'Unknown', bg: '#f3f4f6', color: '#6b7280' };
  const title = task.intakeBrief.title ?? task.category.replace(/_/g, ' ');
  const icon = CATEGORY_ICONS[task.category] ?? '📋';

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', minHeight: '100vh', background: '#fafafa' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '0.85rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', background: '#fff' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <a href={`/travel/experience/${experienceId}`} style={{ fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none' }}>← Back to trip</a>
      </nav>

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Header */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem' }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{title}</h1>
              <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                {task.intakeBrief.day}{task.intakeBrief.time ? ` · ${task.intakeBrief.time}` : ''}
              </div>
            </div>
            <span style={{ background: st.bg, color: st.color, padding: '3px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
              {st.label}
            </span>
          </div>
          {task.intakeBrief.description && (
            <p style={{ margin: '0.75rem 0 0', color: '#374151', fontSize: '0.88rem', lineHeight: 1.6 }}>
              {task.intakeBrief.description}
            </p>
          )}
        </div>

        {/* Expert */}
        {task.expert ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Your Expert</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                {task.expert.photoUrl ? <img src={task.expert.photoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👤'}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{task.expert.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                  {task.expert.rating ? `★ ${task.expert.rating.toFixed(1)}` : ''}
                  {task.expert.completedJobs ? ` · ${task.expert.completedJobs} jobs` : ''}
                </div>
              </div>
            </div>
            {task.expert.bio && (
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>{task.expert.bio}</p>
            )}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem', textAlign: 'center', color: '#6b7280', fontSize: '0.88rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</div>
            Finding an expert for this task...
          </div>
        )}

        {/* Deliverable */}
        {task.status === 'completed' && task.deliverable && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>✓ Completed</div>
            {Object.entries(task.deliverable).map(([k, v]) => v && (
              <div key={k} style={{ marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>{k.replace(/([A-Z])/g, ' $1').trim()}: </span>
                <span style={{ color: '#6b7280' }}>{String(v)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <TimelineItem time={task.createdAt} label="Task created by your butler" />
            {task.claimedAt && <TimelineItem time={task.claimedAt} label={`Accepted by ${task.expert?.name ?? 'an expert'}`} />}
            {task.completedAt && <TimelineItem time={task.completedAt} label="Marked complete" highlight />}
            {task.cancelReason && <TimelineItem time={task.createdAt} label={`Cancelled: ${task.cancelReason}`} error />}
          </div>
        </div>

        {/* Messages */}
        {task.messages && task.messages.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Updates</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {task.messages.map(m => (
                <div key={m.id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', minWidth: 52, paddingTop: 2 }}>
                    {ROLE_LABELS[m.fromRole] ?? m.fromRole}
                  </span>
                  <div style={{ flex: 1, fontSize: '0.86rem', color: '#374151', lineHeight: 1.5 }}>{m.body}</div>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', flexShrink: 0, paddingTop: 2 }}>{fmt(m.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineItem({ time, label, highlight, error }: { time: string; label: string; highlight?: boolean; error?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: error ? '#ef4444' : highlight ? '#10b981' : '#d1d5db', flexShrink: 0, marginTop: 5 }} />
      <span style={{ color: highlight ? '#065f46' : error ? '#b91c1c' : '#374151' }}>{label}</span>
      <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '0.78rem', flexShrink: 0 }}>{fmt(time)}</span>
    </div>
  );
}
