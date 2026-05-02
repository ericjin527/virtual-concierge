'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function RequestPage() {
  const params = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  useEffect(() => {
    if (initialQ && !sentInitial.current) {
      sentInitial.current = true;
      send(initialQ);
    }
  }, [initialQ]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await api.butlerChat(
        next.map(m => ({ role: m.role, content: m.content })),
        text,
        'appliance_repair',
      ) as { message: string; complete: boolean; taskId?: string };

      setMessages(m => [...m, { role: 'assistant', content: res.message }]);
      if (res.complete) {
        setDone(true);
        setTaskId(res.taskId ?? null);
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "I'm having trouble right now. Please try again shortly." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a href="/" style={{ fontWeight: 800, textDecoration: 'none', color: '#111', fontSize: '1rem' }}>Local Butler</a>
        <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>/ Appliance Repair</span>
      </nav>

      <div style={{ flex: 1, maxWidth: 680, width: '100%', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔧</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem', color: '#111' }}>Appliance Repair Butler</div>
            <div style={{ fontSize: '0.9rem' }}>Tell me what's going on with your appliance.</div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '78%', padding: '0.7rem 1rem', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: m.role === 'user' ? '#111' : '#fff',
              color: m.role === 'user' ? '#fff' : '#111',
              border: m.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
              fontSize: '0.9rem', lineHeight: 1.6,
            }}>
              {m.role === 'assistant' && <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', marginBottom: 4 }}>Butler</div>}
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px 12px 12px 2px', padding: '0.7rem 1rem', color: '#9ca3af', fontSize: '0.85rem' }}>Butler is typing...</div>
          </div>
        )}

        {done && (
          <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '1rem 1.25rem', marginTop: '0.5rem' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Request submitted</div>
            <div style={{ fontSize: '0.85rem', color: '#065f46' }}>We're finding the best local expert for your job. You'll receive a text when we have a match.</div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {!done && (
        <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: '1rem 1.5rem' }}>
          <form onSubmit={e => { e.preventDefault(); send(input); }} style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: '0.5rem' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              style={{ flex: 1, padding: '0.65rem 1rem', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.9rem', outline: 'none' }}
            />
            <button type="submit" disabled={loading || !input.trim()} style={{ padding: '0.65rem 1.1rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
