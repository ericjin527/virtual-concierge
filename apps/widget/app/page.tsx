'use client';
import { useEffect, useRef, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CATEGORIES = [
  { value: 'appliance_repair', label: '🔧 Appliance Repair' },
  { value: 'event_booking', label: '🎉 Event Booking' },
  { value: 'parenting_logistics', label: '👨‍👧 Parenting Help' },
];

const GREETINGS: Record<string, string> = {
  appliance_repair: "Hi! I can help you get your appliance fixed. What's going on with it?",
  event_booking: "Hi! I can help you book a venue for your event. What kind of event are you planning?",
  parenting_logistics: "Hi! I can help with parenting logistics. What do you need help with?",
};

export default function WidgetPage() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat && CATEGORIES.some(c => c.value === cat)) {
      selectCategory(cat);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  function selectCategory(cat: string) {
    setCategory(cat);
    setMessages([{ role: 'assistant', content: GREETINGS[cat] ?? "Hi! How can I help you today?" }]);
    setComplete(false);
    setTaskId(null);
  }

  function reset() {
    setCategory(null);
    setMessages([]);
    setComplete(false);
    setTaskId(null);
    setInput('');
  }

  const send = async () => {
    if (!input.trim() || !category || loading || complete) return;
    const userMsg = input.trim();
    setInput('');

    const nextMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const apiMessages = nextMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const res = await fetch(`${API}/butler/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages.slice(0, -1), message: userMsg, category }),
      });
      const data = await res.json() as { message: string; complete: boolean; taskId?: string };
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      if (data.complete) {
        setComplete(true);
        if (data.taskId) setTaskId(data.taskId);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const categoryLabel = CATEGORIES.find(c => c.value === category)?.label ?? 'Local Butler';

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, fontFamily: 'system-ui, sans-serif' }}>
      {open && (
        <div style={{
          width: 360, height: 540, background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)', display: 'flex',
          flexDirection: 'column', marginBottom: 12, overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', background: '#111', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {category ? categoryLabel : 'Local Butler'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 1 }}>
                {category ? 'AI-assisted intake · replies instantly' : 'Choose a service to get started'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {category && (
                <button onClick={reset} title="Start over" style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.75rem', lineHeight: 1 }}>
                  ↩
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
            </div>
          </div>

          {/* Category picker */}
          {!category && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem', textAlign: 'center' }}>
                What do you need help with today?
              </p>
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => selectCategory(c.value)} style={{
                  width: '100%', padding: '0.75rem 1rem', marginBottom: '0.5rem',
                  background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10,
                  cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, textAlign: 'left',
                  transition: 'background 0.1s',
                }}>
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* Chat messages */}
          {category && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '82%', padding: '9px 13px',
                      borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: m.role === 'user' ? '#111' : '#f3f4f6',
                      color: m.role === 'user' ? '#fff' : '#111',
                      fontSize: '0.87rem', lineHeight: 1.5,
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ padding: '9px 14px', background: '#f3f4f6', borderRadius: '16px 16px 16px 4px', fontSize: '0.87rem', color: '#6b7280' }}>···</div>
                  </div>
                )}
                {complete && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.75rem 1rem', marginTop: 4, fontSize: '0.82rem', color: '#166534' }}>
                    ✓ Your request has been received. We'll match you with a local expert shortly.
                    {taskId && <div style={{ marginTop: 4, color: '#6b7280' }}>Reference: #{taskId.slice(-6).toUpperCase()}</div>}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '10px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  disabled={complete}
                  placeholder={complete ? 'Request submitted' : 'Type a message…'}
                  style={{
                    flex: 1, padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 10,
                    fontSize: '0.87rem', outline: 'none', background: complete ? '#f9fafb' : '#fafafa',
                    color: complete ? '#9ca3af' : '#111',
                  }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading || complete}
                  style={{
                    padding: '9px 14px', background: '#111', color: '#fff', border: 'none',
                    borderRadius: 10, cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600,
                    opacity: !input.trim() || loading || complete ? 0.4 : 1,
                  }}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 56, height: 56, borderRadius: '50%', background: '#111', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)', float: 'right',
        }}
        aria-label="Open chat"
      >
        {open
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>
    </div>
  );
}
