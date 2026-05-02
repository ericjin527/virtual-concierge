'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';

interface Task {
  title?: string;
  description?: string;
  category: string;
  day: string;
  time?: string;
}

interface Plan {
  planSummary?: string;
  agenda?: { day: string; items: string[] }[];
  tasks?: Task[];
}

interface Experience {
  id: string;
  status: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  dates?: string;
  travelers?: number;
  budget?: string;
  intakeMode?: string;
  planDraft?: Plan;
  lead?: { name?: string };
}

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🚗', restaurant_expert: '🍽️', errand_helper: '📦', local_guide: '🗺️',
  photographer: '📷', private_chef: '👨‍🍳', cleaner: '🧹', florist: '💐',
  family_helper: '👨‍👧', party_helper: '🎉',
};

const CATEGORY_LABELS: Record<string, string> = {
  driver: 'Transport', restaurant_expert: 'Restaurant', errand_helper: 'Errand',
  local_guide: 'Local Guide', photographer: 'Photography', private_chef: 'Private Chef',
  cleaner: 'Cleaning', florist: 'Florist', family_helper: 'Family Help', party_helper: 'Event Help',
};

export default function PlanPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function poll() {
      try {
        const exp = await api.getExperience(id) as Experience;
        setExperience(exp);
        setLoading(false);
        if (exp.status === 'plan_ready') {
          clearInterval(interval);
        }
      } catch {
        setLoading(false);
      }
    }

    poll();
    // Poll every 3s while AI is generating
    interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [id]);

  async function confirmPlan() {
    setConfirming(true);
    setError('');
    try {
      await api.confirmTravelPlan(id);
      window.location.href = `/travel/experience/${id}`;
    } catch {
      setError('Failed to confirm plan. Please try again.');
      setConfirming(false);
    }
  }

  const plan = experience?.planDraft;
  const isReady = experience?.status === 'plan_ready' && plan;

  // Group tasks by day for the breakdown table
  const tasksByDay: Record<string, Task[]> = {};
  if (plan?.tasks) {
    for (const t of plan.tasks) {
      if (!tasksByDay[t.day]) tasksByDay[t.day] = [];
      tasksByDay[t.day]!.push(t);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', minHeight: '100vh', background: '#fafafa' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <a href="/travel" style={{ fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none' }}>← Start over</a>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Loading state */}
        {(loading || (!isReady && !loading)) && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '3rem 2rem', textAlign: 'center' }}>
            {loading || experience?.status === 'intake' ? (
              <>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✨</div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>Building your plan...</div>
                <div style={{ color: '#6b7280', fontSize: '0.88rem' }}>Your butler is generating a day-by-day itinerary. This takes about 10–15 seconds.</div>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#d1d5db',
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ color: '#b91c1c', fontWeight: 600 }}>Something went wrong generating your plan.</div>
                <a href="/travel" style={{ display: 'inline-block', marginTop: '1rem', color: '#6b7280', fontSize: '0.88rem' }}>← Try again</a>
              </>
            )}
          </div>
        )}

        {/* Plan ready */}
        {isReady && experience && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Your {experience.city} Plan
              </h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
                {experience.dates ?? `${experience.startDate} – ${experience.endDate}`}
                {experience.travelers ? ` · ${experience.travelers} ${experience.travelers === 1 ? 'person' : 'people'}` : ''}
                {experience.budget ? ` · ${experience.budget}` : ''}
              </p>
            </div>

            {error && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.88rem' }}>
                {error}
              </div>
            )}

            {/* Plan summary */}
            {plan?.planSummary && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Overview</div>
                <p style={{ color: '#374151', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>{plan.planSummary}</p>
              </div>
            )}

            {/* Day-by-day agenda */}
            {plan?.agenda && plan.agenda.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: '0.9rem' }}>
                  Day-by-Day Itinerary
                </div>
                {plan.agenda.map((block, i) => (
                  <div key={i} style={{ borderBottom: i < plan.agenda!.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ padding: '0.6rem 1.5rem', background: '#f9fafb', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>
                      {block.day}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '2rem', paddingRight: '1.5rem', paddingTop: '0.5rem', paddingBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {block.items.map((item, j) => (
                        <li key={j} style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.5 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Task breakdown */}
            {Object.keys(tasksByDay).length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: '0.9rem' }}>
                  Tasks for Local Experts ({plan?.tasks?.length ?? 0} total)
                </div>
                {Object.entries(tasksByDay).map(([day, tasks]) => (
                  <div key={day}>
                    <div style={{ padding: '0.45rem 1.5rem', background: '#f9fafb', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>
                      {day}
                    </div>
                    {tasks.map((task, i) => (
                      <div key={i} style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #f9fafb', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.1rem', marginTop: 1 }}>{CATEGORY_ICONS[task.category] ?? '📋'}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>
                            {task.title ?? CATEGORY_LABELS[task.category] ?? task.category}
                            {task.time && <span style={{ color: '#9ca3af', fontWeight: 400 }}> · {task.time}</span>}
                          </div>
                          {task.description && <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>{task.description}</div>}
                        </div>
                        <span style={{ marginLeft: 'auto', flexShrink: 0, background: '#f3f4f6', padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>
                          {CATEGORY_LABELS[task.category] ?? task.category}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Confirm CTA */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Ready to go?</div>
              <div style={{ color: '#6b7280', fontSize: '0.87rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Confirming publishes these tasks to our expert network. Locals will start claiming them right away.
              </div>
              <button onClick={confirmPlan} disabled={confirming} style={{
                padding: '0.85rem 2rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8,
                fontWeight: 700, fontSize: '1rem', cursor: confirming ? 'not-allowed' : 'pointer', opacity: confirming ? 0.6 : 1,
              }}>
                {confirming ? 'Confirming...' : 'Confirm this plan →'}
              </button>
              <div style={{ marginTop: '0.75rem' }}>
                <a href="/travel" style={{ fontSize: '0.82rem', color: '#9ca3af', textDecoration: 'none' }}>Start over with different dates</a>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
