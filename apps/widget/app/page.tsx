'use client';
import { useEffect, useRef, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface BusinessConfig {
  id: string;
  name: string;
  primaryLanguage: string;
}

export default function WidgetPage() {
  const [open, setOpen] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const b = params.get('b');
    if (!b) { setError('Missing business ID'); return; }
    setBusinessId(b);

    fetch(`${API}/widget/${b}/config`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then((cfg: BusinessConfig) => {
        setConfig(cfg);
        const greeting = cfg.primaryLanguage === 'zh'
          ? `您好！欢迎光临${cfg.name}。请问有什么可以帮您？`
          : `Hi! Welcome to ${cfg.name}. How can I help you today?`;
        setMessages([{ role: 'assistant', content: greeting }]);
      })
      .catch(() => setError('Unable to load chat.'));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || !businessId || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/widget/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, sessionId, message: userMsg }),
      });
      const data = await res.json() as { sessionId: string; reply: string; bookingCreated: boolean };
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (error) return null;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, fontFamily: 'inherit' }}>
      {/* Chat panel */}
      {open && (
        <div style={{
          width: 360, height: 520, background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)', display: 'flex',
          flexDirection: 'column', marginBottom: 12, overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px', background: '#111', color: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{config?.name ?? 'Spa Concierge'}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 1 }}>
                {config?.primaryLanguage === 'zh' ? '在线助手' : 'Online now · Replies instantly'}
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '9px 13px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
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
                <div style={{ padding: '9px 14px', background: '#f3f4f6', borderRadius: '16px 16px 16px 4px', fontSize: '0.87rem', color: '#6b7280' }}>
                  ···
                </div>
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
              placeholder={config?.primaryLanguage === 'zh' ? '输入消息…' : 'Type a message…'}
              style={{
                flex: 1, padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 10,
                fontSize: '0.87rem', outline: 'none', background: '#fafafa',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                padding: '9px 14px', background: '#111', color: '#fff', border: 'none',
                borderRadius: 10, cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600,
                opacity: !input.trim() || loading ? 0.4 : 1,
              }}
            >
              {config?.primaryLanguage === 'zh' ? '发送' : 'Send'}
            </button>
          </div>
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
