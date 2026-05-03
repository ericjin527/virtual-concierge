'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';

interface PlanTask {
  title?: string;
  description?: string;
  category: string;
  day: string;
  time?: string;
}

interface Plan {
  planSummary?: string;
  agenda?: { day: string; items: string[] }[];
  tasks?: PlanTask[];
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

interface ChatMessage { role: 'user' | 'assistant'; content: string }

const CATEGORY_ICONS: Record<string, string> = {
  photographer:            '📷',
  makeup_artist:           '💄',
  hair_stylist:            '💇',
  wardrobe_stylist:        '👗',
  cultural_outfit_partner: '👘',
  creative_director:       '🎨',
  photo_editor:            '🖼️',
  video_creator:           '🎬',
  local_coordinator:       '📍',
  driver:                  '🚗',
};
const CATEGORY_LABELS: Record<string, string> = {
  photographer:            'Photography',
  makeup_artist:           'Makeup',
  hair_stylist:            'Hair',
  wardrobe_stylist:        'Styling',
  cultural_outfit_partner: 'Outfit Rental',
  creative_director:       'Creative Direction',
  photo_editor:            'Photo Editing',
  video_creator:           'Video',
  local_coordinator:       'Location',
  driver:                  'Transport',
};

function getDaysFromPlan(plan: Plan): string[] {
  const days = new Set<string>();
  plan.agenda?.forEach(a => days.add(a.day));
  plan.tasks?.forEach(t => days.add(t.day));
  return Array.from(days);
}

export default function PlanPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Local editable plan state
  const [plan, setPlan] = useState<Plan | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Your shoot plan is ready! Feel free to remove tasks, or tell me what to change — glam style, shoot location, timing, or anything else." },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  // Poll until plan_ready
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    async function poll() {
      try {
        const exp = await api.getExperience(id) as Experience;
        setExperience(exp);
        if (exp.status === 'plan_ready' && exp.planDraft) {
          setPlan(exp.planDraft);
          setLoadingPlan(false);
          clearInterval(interval);
        } else if (exp.status !== 'intake') {
          setLoadingPlan(false);
          clearInterval(interval);
        }
      } catch {
        setLoadingPlan(false);
      }
    }
    poll();
    interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  function removeTask(taskToRemove: PlanTask) {
    setPlan(prev => {
      if (!prev) return prev;
      return { ...prev, tasks: prev.tasks?.filter(t => t !== taskToRemove) };
    });
  }

  async function sendChat() {
    const text = chatInput.trim();
    if (!text || chatLoading || !plan) return;
    setChatInput('');
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setChatLoading(true);
    try {
      const prior = next.slice(0, -1);
      const result = await api.reviseTravelPlan(id, prior, text, plan) as { reply: string; revisedPlan?: Plan };
      setMessages(prev => [...prev, { role: 'assistant', content: result.reply }]);
      if (result.revisedPlan) setPlan(result.revisedPlan);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that. Try again." }]);
    } finally {
      setChatLoading(false);
    }
  }

  async function confirmPlan() {
    setError('');
    setConfirming(true);
    try {
      await api.confirmTravelPlan(id, plan);
      window.location.href = `/travel/experience/${id}`;
    } catch {
      setError('Failed to confirm. Please try again.');
      setConfirming(false);
    }
  }

  const days = plan ? getDaysFromPlan(plan) : [];
  const totalTasks = plan?.tasks?.length ?? 0;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', minHeight: '100vh', background: '#f3f4f6' }}>
      <style>{`
        .preview-layout { display: flex; gap: 0; flex-direction: column; }
        @media (min-width: 900px) { .preview-layout { flex-direction: row; height: calc(100vh - 57px); } }
        .plan-panel { overflow-y: auto; padding: 1.5rem; flex: 1.1; }
        @media (min-width: 900px) { .plan-panel { padding: 2rem; } }
        .chat-panel { display: flex; flex-direction: column; background: #fff; border-left: 1px solid #e5e7eb; }
        @media (min-width: 900px) { .chat-panel { width: 360px; flex-shrink: 0; height: 100%; } }
        .task-row:hover .remove-btn { opacity: 1; }
        .remove-btn { opacity: 0; transition: opacity 0.15s; }
        @media (hover: none) { .remove-btn { opacity: 1; } }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {plan && !loadingPlan && (
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              {totalTasks} task{totalTasks !== 1 ? 's' : ''} · {days.length} day{days.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={confirmPlan}
            disabled={confirming || loadingPlan || !plan}
            style={{
              background: '#111', color: '#fff', border: 'none', borderRadius: 7,
              padding: '0.45rem 1rem', fontWeight: 700, fontSize: '0.88rem',
              cursor: confirming || loadingPlan || !plan ? 'not-allowed' : 'pointer',
              opacity: confirming || loadingPlan || !plan ? 0.5 : 1,
            }}
          >
            {confirming ? 'Confirming...' : 'Confirm plan →'}
          </button>
        </div>
      </nav>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>{error}</div>
      )}

      {/* Loading */}
      {loadingPlan && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 57px)', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>✨</div>
          <div style={{ fontWeight: 700 }}>Building your plan...</div>
          <div style={{ color: '#6b7280', fontSize: '0.88rem' }}>About 10–15 seconds</div>
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db', animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
          <style>{`@keyframes pulse{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
        </div>
      )}

      {/* Main layout */}
      {!loadingPlan && plan && (
        <div className="preview-layout">

          {/* ── Left: Plan ── */}
          <div className="plan-panel">
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                {experience?.city ? `${experience.city} Shoot Plan` : 'Your Shoot Plan'}
              </h1>
              <p style={{ color: '#6b7280', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
                {experience?.dates ?? `${experience?.startDate} – ${experience?.endDate}`}
                {experience?.travelers ? ` · ${experience.travelers} ${experience.travelers === 1 ? 'person' : 'people'}` : ''}
                {experience?.budget ? ` · ${experience.budget}` : ''}
              </p>
            </div>

            {plan.planSummary && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1rem', fontSize: '0.88rem', color: '#374151', lineHeight: 1.65 }}>
                {plan.planSummary}
              </div>
            )}

            {/* Day cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {days.map(day => {
                const agendaBlock = plan.agenda?.find(a => a.day === day);
                const dayTasks = plan.tasks?.filter(t => t.day === day) ?? [];
                return (
                  <div key={day} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                    {/* Day header */}
                    <div style={{ padding: '0.65rem 1.1rem', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: '0.85rem' }}>
                      {day}
                    </div>

                    {/* Agenda items */}
                    {agendaBlock && agendaBlock.items.length > 0 && (
                      <div style={{ padding: '0.7rem 1.1rem 0.4rem', borderBottom: dayTasks.length > 0 ? '1px solid #f3f4f6' : 'none' }}>
                        <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {agendaBlock.items.map((item, i) => (
                            <li key={i} style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.5 }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tasks */}
                    {dayTasks.length > 0 && (
                      <div>
                        {dayTasks.map((task, i) => (
                          <div key={i} className="task-row" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.1rem', borderTop: i > 0 || agendaBlock ? '1px solid #f9fafb' : 'none' }}>
                            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{CATEGORY_ICONS[task.category] ?? '📋'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {task.title ?? CATEGORY_LABELS[task.category] ?? task.category}
                                {task.time && <span style={{ color: '#9ca3af', fontWeight: 400 }}> · {task.time}</span>}
                              </div>
                              {task.description && (
                                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {task.description}
                                </div>
                              )}
                            </div>
                            <span style={{ flexShrink: 0, background: '#f3f4f6', padding: '1px 7px', borderRadius: 99, fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>
                              {CATEGORY_LABELS[task.category] ?? task.category}
                            </span>
                            <button
                              className="remove-btn"
                              onClick={() => removeTask(task)}
                              title="Remove this task"
                              style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 99, border: '1px solid #e5e7eb', background: '#fff', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', padding: 0 }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                Happy with your plan? Confirming sends these tasks to our local glam + photography team.
              </div>
              <button
                onClick={confirmPlan}
                disabled={confirming || !plan}
                style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.95rem', cursor: confirming ? 'not-allowed' : 'pointer', opacity: confirming ? 0.6 : 1 }}
              >
                {confirming ? 'Confirming...' : 'Confirm this plan →'}
              </button>
              <div style={{ marginTop: '0.6rem' }}>
                <a href="/travel" style={{ fontSize: '0.8rem', color: '#9ca3af', textDecoration: 'none' }}>Start over</a>
              </div>
            </div>
          </div>

          {/* ── Right: Chat ── */}
          <div className="chat-panel">
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0 }}>
              ✏️ Modify your plan
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '0.6rem 0.85rem',
                    borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                    background: m.role === 'user' ? '#111' : '#f3f4f6',
                    color: m.role === 'user' ? '#fff' : '#111',
                    fontSize: '0.85rem', lineHeight: 1.55, whiteSpace: 'pre-wrap',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: 'flex' }}>
                  <div style={{ padding: '0.6rem 0.85rem', background: '#f3f4f6', borderRadius: '14px 14px 14px 3px', color: '#9ca3af', fontSize: '0.85rem' }}>···</div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Suggestion chips */}
            <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flexShrink: 0 }}>
              {['Add a video reel task', 'Switch to soft glam makeup', 'Move shoot to golden hour'].map(chip => (
                <button key={chip} onClick={() => { setChatInput(chip); }} style={{
                  padding: '3px 10px', borderRadius: 99, border: '1px solid #e5e7eb',
                  background: '#f9fafb', fontSize: '0.75rem', color: '#374151', cursor: 'pointer',
                }}>
                  {chip}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                placeholder="e.g. Add a kimono rental on day 2..."
                disabled={chatLoading}
                style={{
                  flex: 1, padding: '0.55rem 0.75rem', border: '1px solid #e5e7eb',
                  borderRadius: 8, fontSize: '0.85rem', outline: 'none', background: '#fafafa',
                }}
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim() || chatLoading}
                style={{
                  padding: '0.55rem 0.9rem', background: '#111', color: '#fff', border: 'none',
                  borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                  opacity: !chatInput.trim() || chatLoading ? 0.4 : 1,
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
