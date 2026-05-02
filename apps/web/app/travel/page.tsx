'use client';
import { useRef, useState } from 'react';
import { api } from '../../lib/api';

interface Message { role: 'user' | 'assistant'; content: string }

const SERVICES = [
  { id: 'hotel',       icon: '🏨', label: 'Hotel' },
  { id: 'restaurant',  icon: '🍽️', label: 'Restaurant' },
  { id: 'sightseeing', icon: '🗺️', label: 'Sightseeing' },
  { id: 'transport',   icon: '🚗', label: 'Transport' },
  { id: 'bar',         icon: '🍸', label: 'Bar / Nightlife' },
  { id: 'nightclub',   icon: '🎶', label: 'Nightclub' },
  { id: 'errand',      icon: '📦', label: 'Errand' },
  { id: 'photography', icon: '📷', label: 'Photography' },
  { id: 'local_guide', icon: '🧭', label: 'Local Guide' },
  { id: 'family',      icon: '👨‍👧', label: 'Family Support' },
  { id: 'business',    icon: '💼', label: 'Business Support' },
  { id: 'emergency',   icon: '🆘', label: 'Emergency Help' },
];

type Mode = 'pick' | 'chat';

const GREETING = (selected: string[]) =>
  `Got it — you need help with: ${selected.join(', ')}. Just a few quick things: what city are you visiting, and what are your travel dates?`;

export default function TravelPage() {
  const [mode, setMode] = useState<Mode>('pick');
  const [selected, setSelected] = useState<string[]>([]);
  const [automated, setAutomated] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [experienceId, setExperienceId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function startChat(isAutomated: boolean) {
    setAutomated(isAutomated);
    const greeting = isAutomated
      ? `Great — I'll plan everything for you. What city are you visiting and what are your travel dates?`
      : GREETING(selected.map(id => SERVICES.find(s => s.id === id)?.label ?? id));
    setMessages([{ role: 'assistant', content: greeting }]);
    setMode('chat');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  async function send() {
    const userMsg = input.trim();
    if (!userMsg || loading || complete) return;
    setInput('');

    const next: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(next);
    setLoading(true);

    try {
      const prior = next.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
      const context = automated
        ? 'User wants fully automated scheduling.'
        : `User selected these services: ${selected.map(id => SERVICES.find(s => s.id === id)?.label ?? id).join(', ')}.`;

      const data = await api.travelButlerChat(prior, userMsg, context, selected) as {
        message: string; complete: boolean; experienceId?: string;
      };
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      if (data.complete) {
        setComplete(true);
        if (data.experienceId) {
          setExperienceId(data.experienceId);
          setTimeout(() => {
            window.location.href = `/travel/experience/${data.experienceId}`;
          }, 2000);
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I hit a snag. Please try again." }]);
    } finally {
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', minHeight: '100vh', background: '#fafafa' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <a href="/join" style={{ background: '#111', color: '#fff', padding: '0.4rem 0.9rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Join as expert</a>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Local Experience Butler</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>
          Visiting the Bay Area? We connect you with trusted locals for everything you need on the ground.
        </p>

        {mode === 'pick' && (
          <>
            {/* Service checklist */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>What do you need help with?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                {SERVICES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      border: selected.includes(s.id) ? '2px solid #111' : '1px solid #e5e7eb',
                      borderRadius: 8,
                      background: selected.includes(s.id) ? '#111' : '#fff',
                      color: selected.includes(s.id) ? '#fff' : '#374151',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: selected.includes(s.id) ? 700 : 400,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode selector */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>How would you like to proceed?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button onClick={() => startChat(true)} style={{
                  padding: '0.85rem 1rem', borderRadius: 8, border: '1px solid #e5e7eb',
                  background: '#f9fafb', cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.9rem', fontWeight: 500,
                }}>
                  <div style={{ fontWeight: 700 }}>✨ Fully automated</div>
                  <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 2 }}>Tell me your dates and we'll plan everything for you</div>
                </button>
                <button
                  onClick={() => selected.length > 0 && startChat(false)}
                  disabled={selected.length === 0}
                  style={{
                    padding: '0.85rem 1rem', borderRadius: 8, border: '1px solid #e5e7eb',
                    background: selected.length > 0 ? '#f9fafb' : '#f3f4f6',
                    cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
                    textAlign: 'left', fontSize: '0.9rem', fontWeight: 500,
                    opacity: selected.length === 0 ? 0.5 : 1,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    🎯 Help with selected{selected.length > 0 ? ` (${selected.length})` : ''}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 2 }}>
                    {selected.length > 0
                      ? selected.map(id => SERVICES.find(s => s.id === id)?.icon).join(' ')
                      : 'Select services above first'}
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {mode === 'chat' && (
          <>
            {/* Back link */}
            <button onClick={() => { setMode('pick'); setMessages([]); setComplete(false); }} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}>
              ← Change selections
            </button>

            {/* Selected tags (if not automated) */}
            {!automated && selected.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                {selected.map(id => {
                  const s = SERVICES.find(x => x.id === id);
                  return s ? (
                    <span key={id} style={{ background: '#111', color: '#fff', padding: '2px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600 }}>
                      {s.icon} {s.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            {/* Chat window */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 280, maxHeight: 480, overflowY: 'auto' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%', padding: '0.75rem 1rem',
                      borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: m.role === 'user' ? '#111' : '#f3f4f6',
                      color: m.role === 'user' ? '#fff' : '#111',
                      fontSize: '0.9rem', lineHeight: 1.55, whiteSpace: 'pre-wrap',
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex' }}>
                    <div style={{ padding: '0.75rem 1rem', background: '#f3f4f6', borderRadius: '16px 16px 16px 4px', color: '#9ca3af' }}>···</div>
                  </div>
                )}
                {complete && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: 4 }}>✓ Request received</div>
                    <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>
                      We'll review your plan and match you with trusted local experts. Expect a message within a few hours.
                    </div>
                    {experienceId && <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#6b7280' }}>Ref: #{experienceId.slice(-6).toUpperCase()}</div>}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {!complete && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Type your answer..."
                    disabled={loading}
                    autoFocus
                    style={{
                      flex: 1, padding: '0.65rem 0.9rem', border: '1px solid #e5e7eb',
                      borderRadius: 8, fontSize: '0.9rem', outline: 'none', background: '#fafafa',
                    }}
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || loading}
                    style={{
                      padding: '0.65rem 1.1rem', background: '#111', color: '#fff', border: 'none',
                      borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                      opacity: !input.trim() || loading ? 0.4 : 1,
                    }}
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {['Vetted local experts', 'Bay Area coverage', 'No commitment to start'].map(t => (
            <span key={t} style={{ fontSize: '0.8rem', color: '#9ca3af' }}>✓ {t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
