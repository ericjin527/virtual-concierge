'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../../../lib/api';
import { s } from '../../../../../../lib/styles';

interface Message { role: 'user' | 'assistant' | 'system'; content: string }

interface CallDetail {
  id: string;
  callerPhone: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  outcome: string | null;
  messages: Message[];
}

export default function TranscriptDetailPage() {
  const { id: businessId, callId } = useParams<{ id: string; callId: string }>();
  const [call, setCall] = useState<CallDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (api.getCall(businessId, callId) as Promise<CallDetail>)
      .then(setCall)
      .catch(() => setCall(null))
      .finally(() => setLoading(false));
  }, [businessId, callId]);

  if (loading) return <div style={s.page}><p>Loading...</p></div>;
  if (!call) return <div style={s.page}><p style={{ color: '#b91c1c' }}>Call not found.</p></div>;

  const visible = call.messages.filter((m) => m.role !== 'system');

  return (
    <div style={s.page}>
      <a href={`/dashboard/businesses/${businessId}/transcripts`} style={s.backLink}>← Transcripts</a>

      <div style={{ ...s.card, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{call.callerPhone ?? 'Unknown caller'}</div>
            <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 3 }}>
              {new Date(call.startedAt).toLocaleString()}
              {call.durationSeconds != null && ` · ${Math.floor(call.durationSeconds / 60)}m ${call.durationSeconds % 60}s`}
            </div>
          </div>
          {call.outcome && (
            <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
              {call.outcome.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>

      {visible.length === 0 && (
        <div style={{ ...s.card, textAlign: 'center', color: '#9ca3af' }}>No transcript available for this call.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {visible.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end',
            }}
          >
            <div
              style={{
                maxWidth: '72%',
                padding: '0.6rem 0.9rem',
                borderRadius: msg.role === 'user' ? '0 12px 12px 12px' : '12px 0 12px 12px',
                background: msg.role === 'user' ? '#f3f4f6' : '#111',
                color: msg.role === 'user' ? '#111' : '#fff',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: 3, opacity: 0.6 }}>
                {msg.role === 'user' ? 'Caller' : 'AI'}
              </div>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
