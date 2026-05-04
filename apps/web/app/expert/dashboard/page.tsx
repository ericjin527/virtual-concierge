'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExpertApi } from '../../../lib/expert-api';

interface Expert { id: string; name: string; status: string; rating?: number; completedJobs: number; categories: string[]; cities: string[]; isAvailable: boolean; glamCategory?: string }
interface Task { id: string; category: string; status: string; intakeBrief: { title?: string; day?: string; time?: string }; experience?: { city?: string } }

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🚗', restaurant_expert: '🍽️', errand_helper: '📦', local_guide: '🗺️',
  photographer: '📷', private_chef: '👨‍🍳', cleaner: '🧹', florist: '💐', family_helper: '👨‍👧', party_helper: '🎉',
};
const DEFAULT_STATUS = { bg: '#fef3c7', color: '#92400e', label: 'Open' };
const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  accepted:    { bg: '#dbeafe', color: '#1d4ed8', label: 'Accepted' },
  in_progress: { bg: '#ede9fe', color: '#6d28d9', label: 'In Progress' },
  completed:   { bg: '#d1fae5', color: '#065f46', label: 'Complete' },
  new:         DEFAULT_STATUS,
};

export default function ExpertDashboard() {
  const router = useRouter();
  const expertApi = useExpertApi();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      expertApi.getMyProfile().catch(() => null),
      expertApi.getMyTasks().catch(() => []),
    ]).then(([profile, myTasks]) => {
      if (!profile) { router.push('/expert/onboarding'); return; }
      setExpert(profile as Expert);
      setTasks(myTasks as Task[]);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ fontFamily: 'system-ui', padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>;

  const active = tasks.filter(t => ['accepted', 'in_progress'].includes(t.status));
  const recent = tasks.filter(t => t.status === 'completed').slice(0, 5);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', minHeight: '100vh', background: '#f3f4f6' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '0.85rem 1.5rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <a href="/expert/jobs" style={{ fontSize: '0.88rem', color: '#374151', textDecoration: 'none', fontWeight: 600 }}>Browse Jobs</a>
          <a href="/expert/my-tasks" style={{ fontSize: '0.88rem', color: '#374151', textDecoration: 'none', fontWeight: 600 }}>My Tasks</a>
          <a href="/expert/onboarding" style={{ fontSize: '0.88rem', color: '#6b7280', textDecoration: 'none' }}>Edit Profile</a>
          {expert?.id && (
            <a href={`/experts/${expert.id}`} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.88rem', color: '#6b7280', textDecoration: 'none' }}>
              View Profile
            </a>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Profile strip */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Hey, {expert?.name?.split(' ')[0]} 👋</div>
            <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 2 }}>
              {expert?.cities?.join(', ')} · {expert?.categories?.map(c => CATEGORY_ICONS[c] ?? '').join(' ')}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {expert?.rating && <div style={{ fontWeight: 700 }}>★ {expert.rating.toFixed(1)}</div>}
            <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>{expert?.completedJobs ?? 0} completed</div>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 99, background: expert?.status === 'approved' ? '#d1fae5' : '#fef3c7', color: expert?.status === 'approved' ? '#065f46' : '#92400e' }}>
              {expert?.status === 'approved' ? 'Approved' : 'Pending approval'}
            </span>
          </div>
        </div>

        {expert?.status !== 'approved' && (
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '0.9rem 1.25rem', fontSize: '0.88rem', color: '#92400e' }}>
            ⏳ Your account is pending approval. An admin will review your profile within 1–2 business days.
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Active Jobs', value: active.length, color: '#1d4ed8' },
            { label: 'Completed', value: expert?.completedJobs ?? 0, color: '#065f46' },
            { label: 'Rating', value: expert?.rating ? `★ ${expert.rating.toFixed(1)}` : '—', color: '#92400e' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active tasks */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
            Active Tasks
            <a href="/expert/my-tasks" style={{ fontWeight: 400, fontSize: '0.82rem', color: '#6b7280', textDecoration: 'none' }}>View all →</a>
          </div>
          {active.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.88rem' }}>
              No active tasks. <a href="/expert/jobs" style={{ color: '#374151', fontWeight: 600 }}>Browse open jobs →</a>
            </div>
          ) : active.map(t => {
            const st = STATUS_COLORS[t.status] ?? DEFAULT_STATUS;
            return (
              <a key={t.id} href={`/expert/my-tasks/${t.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', borderBottom: '1px solid #f9fafb', textDecoration: 'none', color: 'inherit' }}>
                <span style={{ fontSize: '1.1rem' }}>{CATEGORY_ICONS[t.category] ?? '📋'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.intakeBrief.title ?? t.category}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{t.experience?.city} · {t.intakeBrief.day}</div>
                </div>
                <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>{st.label}</span>
              </a>
            );
          })}
        </div>

        {/* CTA to job board */}
        {expert?.status === 'approved' && (
          <a href="/expert/jobs" style={{ display: 'block', background: '#111', color: '#fff', borderRadius: 10, padding: '1.1rem', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>
            Browse open jobs →
          </a>
        )}
      </div>
    </div>
  );
}
