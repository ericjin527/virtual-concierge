'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';

interface Message { role: 'user' | 'assistant'; content: string }

const USE_CASES = [
  { icon: '💼', label: 'Business trip', q: "I'm visiting San Francisco for a business trip next week" },
  { icon: '👨‍👩‍👧‍👦', label: 'Family visit', q: "My family is coming to the Bay Area and I want to plan local activities" },
  { icon: '🎉', label: 'Special occasion', q: "I'm coming to SF for a celebration and need local help" },
  { icon: '🗺️', label: 'Leisure stay', q: "I'm visiting the Bay Area and want a great local experience" },
];

export default function TravelPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your Local Experience Butler. Tell me where you're visiting and when — I'll help you plan everything from transport to restaurants to local guides." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [experienceId, setExperienceId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) send(q);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text?: string) {
    const userMsg = (text ?? input).trim();
    if (!userMsg || loading || complete) return;
    setInput('');

    const next: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(next);
    setLoading(true);

    try {
      const prior = next.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
      const data = await api.travelButlerChat(prior, userMsg) as { message: string; complete: boolean; experienceId?: string };
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      if (data.complete) {
        setComplete(true);
        if (data.experienceId) setExperienceId(data.experienceId);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I hit a snag. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const isFirstMessage = messages.length === 1;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', minHeight: '100vh', background: '#fafafa' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <a href="/join" style={{ background: '#111', color: '#fff', padding: '0.4rem 0.9rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Join as expert</a>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Local Experience Butler</h1>
          <p style={{ color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
            Coming to town? Tell me what you need — transport, restaurants, guides, errands, or family support. I'll coordinate trusted locals for your whole stay.
          </p>
        </div>

        {/* Quick-start chips (only on first message) */}
        {isFirstMessage && !complete && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {USE_CASES.map(u => (
              <button key={u.label} onClick={() => send(u.q)} style={{
                padding: '0.5rem 0.9rem', borderRadius: 99, border: '1px solid #e5e7eb',
                background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
              }}>
                {u.icon} {u.label}
              </button>
            ))}
          </div>
        )}

        {/* Chat */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 320, maxHeight: 520, overflowY: 'auto' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '0.75rem 1rem',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? '#111' : '#f3f4f6',
                  color: m.role === 'user' ? '#fff' : '#111',
                  fontSize: '0.9rem', lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '0.75rem 1rem', background: '#f3f4f6', borderRadius: '16px 16px 16px 4px', color: '#9ca3af', fontSize: '0.9rem' }}>···</div>
              </div>
            )}
            {complete && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: 700, color: '#166534', marginBottom: 4 }}>✓ Your experience plan is being prepared</div>
                <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>
                  We'll review your brief, source trusted local experts, and reach out within a few hours.
                </div>
                {experienceId && <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#6b7280' }}>Reference: #{experienceId.slice(-6).toUpperCase()}</div>}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!complete && (
            <div style={{ borderTop: '1px solid #f3f4f6', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Tell me about your trip..."
                disabled={loading}
                style={{
                  flex: 1, padding: '0.65rem 0.9rem', border: '1px solid #e5e7eb', borderRadius: 8,
                  fontSize: '0.9rem', outline: 'none', background: '#fafafa',
                }}
              />
              <button
                onClick={() => send()}
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

        {/* Trust bar */}
        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {['Vetted local experts', 'Bay Area coverage', 'Human concierge review', 'No commitment to start'].map(t => (
            <span key={t} style={{ fontSize: '0.8rem', color: '#6b7280' }}>✓ {t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
