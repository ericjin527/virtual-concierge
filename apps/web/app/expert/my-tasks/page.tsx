'use client';
import { useEffect, useState } from 'react';
import { useExpertApi } from '../../../lib/expert-api';

const A = '#1a1714';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';
const P = '#7C3AED';

interface Task {
  id: string; category: string; glamCategory?: string; status: string;
  intakeBrief: { title?: string; day?: string; time?: string };
  experience?: { city?: string };
  claimedAt?: string; completedAt?: string;
}

interface Proposal {
  id: string; status: string; proposedPrice?: number; currency?: string;
  createdAt: string;
  task: {
    id: string; category: string; glamCategory?: string; status: string;
    intakeBrief: { title?: string; day?: string; time?: string };
    experience?: { city?: string; travelers?: number; budget?: string; occasion?: string };
  };
}

const CATEGORY_ICONS: Record<string, string> = {
  photography: '📷', makeup: '💄', hair: '✂️', styling: '👗',
  wardrobe_rental: '🛍️', cultural_outfit: '👘', creative_direction: '🎨',
  photo_editing: '🖼️', video_reel: '🎬', transport: '🚗', concierge_support: '🗝️',
  // legacy fallbacks
  driver: '🚗', errand_helper: '📦', local_guide: '🗺️', photographer: '📷',
};

const TASK_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  accepted:    { label: 'Confirmed',   bg: '#ede9fe', color: '#5b21b6' },
  in_progress: { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8' },
  completed:   { label: 'Complete',    bg: '#d1fae5', color: '#065f46' },
  cancelled:   { label: 'Cancelled',   bg: '#f3f4f6', color: '#6b7280' },
};

const PROPOSAL_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  invited:  { label: 'Invited',          bg: '#fef3c7', color: '#92400e' },
  accepted: { label: 'Bid submitted',    bg: '#ede9fe', color: '#5b21b6' },
  selected: { label: 'Selected ✓',       bg: '#d1fae5', color: '#065f46' },
  rejected: { label: 'Not selected',     bg: '#f3f4f6', color: '#6b7280' },
  declined: { label: 'You declined',     bg: '#f3f4f6', color: '#6b7280' },
};

const TABS = ['tasks', 'bids', 'completed'] as const;
type Tab = typeof TABS[number];

function taskIcon(t: { category: string; glamCategory?: string }) {
  return CATEGORY_ICONS[t.glamCategory ?? t.category] ?? '📋';
}

export default function MyTasksPage() {
  const expertApi = useExpertApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('tasks');

  useEffect(() => {
    Promise.all([
      expertApi.getMyTasks().catch(() => []) as Promise<Task[]>,
      expertApi.getMyProposals().catch(() => []) as Promise<Proposal[]>,
    ]).then(([t, p]) => {
      setTasks(t);
      setProposals(p);
    }).finally(() => setLoading(false));
  }, []);

  const activeTasks = tasks.filter(t => ['accepted', 'in_progress'].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Bids: proposals where expert submitted, customer hasn't decided yet
  const pendingBids = proposals.filter(p => ['accepted', 'invited'].includes(p.status));
  const decidedBids = proposals.filter(p => ['selected', 'rejected', 'declined'].includes(p.status));

  const tabCounts: Record<Tab, number> = {
    tasks: activeTasks.length,
    bids: pendingBids.length,
    completed: completedTasks.length,
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: A, minHeight: '100vh', background: '#faf9f6' }}>
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '1rem 2.5rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', color: A, fontFamily: 'Georgia, serif' }}>Local Butler</a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/expert/jobs" style={{ fontSize: '0.88rem', color: MUTED, textDecoration: 'none' }}>Browse Jobs</a>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: A }}>My Work</span>
          <a href="/expert/dashboard" style={{ fontSize: '0.88rem', color: MUTED, textDecoration: 'none' }}>Dashboard</a>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Georgia, serif', marginBottom: '1.25rem', color: A }}>My Work</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '0.3rem', width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.4rem 1rem', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: tab === t ? A : 'transparent',
              color: tab === t ? '#fff' : MUTED,
              fontWeight: tab === t ? 700 : 400, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              {t === 'tasks' ? 'Active Tasks' : t === 'bids' ? 'My Bids' : 'Completed'}
              {tabCounts[t] > 0 && (
                <span style={{
                  background: tab === t ? 'rgba(255,255,255,0.25)' : BORDER,
                  color: tab === t ? '#fff' : MUTED,
                  borderRadius: 99, padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700,
                }}>
                  {tabCounts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: FAINT }}>Loading...</div>
        ) : (
          <>
            {/* Active Tasks tab */}
            {tab === 'tasks' && (
              activeTasks.length === 0 ? (
                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '2.5rem', textAlign: 'center', color: FAINT }}>
                  No active tasks.{' '}
                  <a href="/expert/jobs" style={{ color: A, fontWeight: 600 }}>Browse open jobs →</a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {activeTasks.map(task => {
                    const st = TASK_STATUS[task.status] ?? { label: task.status, bg: '#f3f4f6', color: MUTED };
                    return (
                      <a key={task.id} href={`/expert/my-tasks/${task.id}`} style={{
                        background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10,
                        padding: '1rem 1.25rem', display: 'flex', alignItems: 'center',
                        gap: '0.75rem', textDecoration: 'none', color: 'inherit',
                      }}>
                        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{taskIcon(task)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.intakeBrief.title ?? task.category}</div>
                          <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 1 }}>
                            {task.experience?.city}
                            {task.intakeBrief.day ? ` · ${task.intakeBrief.day}` : ''}
                            {task.intakeBrief.time ? ` · ${task.intakeBrief.time}` : ''}
                          </div>
                        </div>
                        <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                          {st.label}
                        </span>
                        <span style={{ color: BORDER }}>›</span>
                      </a>
                    );
                  })}
                </div>
              )
            )}

            {/* Bids tab */}
            {tab === 'bids' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingBids.length === 0 && decidedBids.length === 0 ? (
                  <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '2.5rem', textAlign: 'center', color: FAINT }}>
                    No bids yet.{' '}
                    <a href="/expert/jobs" style={{ color: A, fontWeight: 600 }}>Browse jobs and submit a bid →</a>
                  </div>
                ) : (
                  <>
                    {pendingBids.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
                          Awaiting customer decision
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          {pendingBids.map(p => <ProposalRow key={p.id} proposal={p} />)}
                        </div>
                      </div>
                    )}
                    {decidedBids.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem', marginTop: pendingBids.length > 0 ? '0.5rem' : 0 }}>
                          Decided
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          {decidedBids.map(p => <ProposalRow key={p.id} proposal={p} />)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Completed tab */}
            {tab === 'completed' && (
              completedTasks.length === 0 ? (
                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '2.5rem', textAlign: 'center', color: FAINT }}>
                  No completed tasks yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {completedTasks.map(task => (
                    <a key={task.id} href={`/expert/my-tasks/${task.id}`} style={{
                      background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10,
                      padding: '1rem 1.25rem', display: 'flex', alignItems: 'center',
                      gap: '0.75rem', textDecoration: 'none', color: 'inherit',
                    }}>
                      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{taskIcon(task)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.intakeBrief.title ?? task.category}</div>
                        <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 1 }}>
                          {task.experience?.city}
                          {task.intakeBrief.day ? ` · ${task.intakeBrief.day}` : ''}
                        </div>
                      </div>
                      <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>Complete</span>
                      <span style={{ color: BORDER }}>›</span>
                    </a>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProposalRow({ proposal: p }: { proposal: Proposal }) {
  const st = PROPOSAL_STATUS[p.status] ?? { label: p.status, bg: '#f3f4f6', color: MUTED };
  const icon = CATEGORY_ICONS[p.task.glamCategory ?? p.task.category] ?? '📋';
  const isSelected = p.status === 'selected';

  return (
    <div style={{
      background: '#fff', border: `1px solid ${isSelected ? 'rgba(124,58,237,0.35)' : BORDER}`,
      borderRadius: 10, padding: '1rem 1.25rem',
      boxShadow: isSelected ? '0 0 0 3px rgba(124,58,237,0.08)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: 1 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: 2 }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {p.task.intakeBrief.title ?? p.task.category}
            </span>
            <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
              {st.label}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: MUTED }}>
            {p.task.experience?.city}
            {p.task.intakeBrief.day ? ` · ${p.task.intakeBrief.day}` : ''}
            {p.task.intakeBrief.time ? ` · ${p.task.intakeBrief.time}` : ''}
          </div>
          {p.proposedPrice != null && (
            <div style={{ fontSize: '0.82rem', color: MUTED, marginTop: 3 }}>
              Your bid: <strong>{p.currency ?? 'JPY'} {p.proposedPrice.toLocaleString()}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
