'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';

interface Task {
  id: string;
  category: string;
  status: string;
  intakeBrief: { title?: string; description?: string; day?: string; time?: string };
  expert?: { name: string; phone: string };
}

interface Experience {
  id: string;
  city?: string;
  dates?: string;
  status: string;
  createdAt: string;
  lead?: { name?: string; phone?: string };
  aiBrief: {
    planSummary?: string;
    selectedServices?: string[];
    agenda?: { day: string; items: string[] }[];
  };
  tasks: Task[];
}

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🚗', restaurant_expert: '🍽️', errand_helper: '📦', local_guide: '🗺️',
  photographer: '📷', private_chef: '👨‍🍳', cleaner: '🧹', florist: '💐',
  family_helper: '👨‍👧', party_helper: '🎉',
};

function taskCustomerStatus(status: string): { label: string; color: string; dot: string } {
  if (status === 'completed') return { label: 'Complete', color: '#d1fae5', dot: '#10b981' };
  if (['matched','accepted','in_progress','quote_submitted','quote_approved','diagnosing'].includes(status))
    return { label: 'In progress', color: '#dbeafe', dot: '#3b82f6' };
  if (['cancelled','declined'].includes(status))
    return { label: 'Cancelled', color: '#fee2e2', dot: '#ef4444' };
  return { label: 'Open', color: '#fef3c7', dot: '#f59e0b' };
}

function allComplete(tasks: Task[]) {
  return tasks.length > 0 && tasks.every(t => t.status === 'completed');
}

export default function ExperienceTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [exp, setExp] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    // poll every 30s so status updates appear without refresh
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [id]);

  async function load() {
    try { setExp(await api.getExperience(id) as Experience); }
    catch { setExp(null); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
      Loading your experience plan...
    </div>
  );

  if (!exp) return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', textAlign: 'center', color: '#b91c1c' }}>
      Experience not found.
    </div>
  );

  const brief = exp.aiBrief;
  const done = allComplete(exp.tasks);
  const completedCount = exp.tasks.filter(t => t.status === 'completed').length;

  // Group tasks by day
  const byDay: Record<string, Task[]> = {};
  for (const task of exp.tasks) {
    const day = task.intakeBrief.day ?? 'General';
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(task);
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', minHeight: '100vh', background: '#fafafa' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Ref #{id.slice(-6).toUpperCase()}</span>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {exp.city ? `Your ${exp.city} Experience` : 'Your Local Experience'}
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {exp.dates ?? ''}{exp.lead?.name ? ` · ${exp.lead.name}` : ''}
          </p>
        </div>

        {/* Plan summary */}
        {brief.planSummary && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Your Plan</div>
            <p style={{ color: '#374151', lineHeight: 1.7, margin: 0, fontSize: '0.92rem' }}>{brief.planSummary}</p>
            {brief.selectedServices && brief.selectedServices.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
                {brief.selectedServices.map(s => (
                  <span key={s} style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', color: '#374151' }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ fontWeight: 700 }}>Progress</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{completedCount} of {exp.tasks.length} tasks complete</div>
          </div>
          <div style={{ background: '#f3f4f6', borderRadius: 99, height: 8, overflow: 'hidden' }}>
            <div style={{
              background: done ? '#10b981' : '#3b82f6',
              height: '100%',
              width: exp.tasks.length > 0 ? `${(completedCount / exp.tasks.length) * 100}%` : '0%',
              borderRadius: 99,
              transition: 'width 0.5s',
            }} />
          </div>
          {done && (
            <div style={{ marginTop: '0.6rem', color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
              ✓ All tasks complete — see your full agenda below
            </div>
          )}
        </div>

        {/* Task board */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', fontWeight: 700 }}>
            Booking Tasks
          </div>
          {Object.entries(byDay).map(([day, tasks]) => (
            <div key={day}>
              <div style={{ padding: '0.5rem 1.5rem', background: '#f9fafb', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>
                {day}
              </div>
              {tasks.map(task => {
                const st = taskCustomerStatus(task.status);
                const title = task.intakeBrief.title ?? task.category.replace(/_/g, ' ');
                const desc = task.intakeBrief.description;
                const time = task.intakeBrief.time;
                return (
                  <div key={task.id} style={{ padding: '0.9rem 1.5rem', borderBottom: '1px solid #f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        <span>{CATEGORY_ICONS[task.category] ?? '📋'}</span>
                        <span>{title}</span>
                        {time && <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.78rem' }}>· {time}</span>}
                      </div>
                      {desc && <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>{desc}</div>}
                      {task.expert && (
                        <div style={{ fontSize: '0.78rem', color: '#374151', marginTop: 3 }}>
                          Assigned to <strong>{task.expert.name}</strong>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                      <span style={{ background: st.color, padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>{st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {exp.tasks.length === 0 && (
            <div style={{ padding: '1.5rem', color: '#9ca3af', textAlign: 'center', fontSize: '0.85rem' }}>
              Your tasks are being prepared — check back shortly.
            </div>
          )}
        </div>

        {/* Full agenda — shown only when all complete */}
        {done && brief.agenda && brief.agenda.length > 0 && (
          <div style={{ background: '#fff', border: '2px solid #10b981', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#065f46', marginBottom: '1rem' }}>
              ✓ Your Complete Itinerary
            </div>
            {brief.agenda.map((block: { day: string; items: string[] }) => (
              <div key={block.day} style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{block.day}</div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {block.items.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.5 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.6 }}>
          This page updates automatically. We'll reach out to {exp.lead?.phone ?? 'you'} as tasks are confirmed.<br />
          Questions? Reply to our message or contact support.
        </p>
      </div>
    </div>
  );
}
