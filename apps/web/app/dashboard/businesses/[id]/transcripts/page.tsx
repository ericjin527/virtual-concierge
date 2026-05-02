'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../../lib/api';
import { s } from '../../../../../lib/styles';

interface CallSummary {
  id: string;
  callerPhone: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  outcome: string | null;
  turnCount: number;
}

const OUTCOME_LABELS: Record<string, string> = {
  booking_request_created: 'Booking',
  faq_answered: 'FAQ',
  human_handoff: 'Handoff',
  callback_created: 'Callback',
  abandoned: 'Abandoned',
  spam: 'Spam',
  error: 'Error',
};

const OUTCOME_COLORS: Record<string, string> = {
  booking_request_created: '#d1fae5',
  faq_answered: '#dbeafe',
  human_handoff: '#fef3c7',
  callback_created: '#ede9fe',
  abandoned: '#f3f4f6',
  spam: '#fee2e2',
  error: '#fee2e2',
};

function fmt(secs: number | null) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function TranscriptsPage() {
  const { id: businessId } = useParams<{ id: string }>();
  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (api.getCalls(businessId) as Promise<CallSummary[]>)
      .then(setCalls)
      .catch(() => setCalls([]))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) return <div style={s.page}><p>Loading...</p></div>;

  return (
    <div style={s.page}>
      <a href="/dashboard/businesses" style={s.backLink}>← Businesses</a>
      <h1 style={s.h1}>Call Transcripts</h1>

      {calls.length === 0 && (
        <div style={{ ...s.card, textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          No calls yet. Calls will appear here after someone dials in.
        </div>
      )}

      {calls.map((call) => (
        <div key={call.id} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {call.callerPhone ?? 'Unknown caller'}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: 3 }}>
                {new Date(call.startedAt).toLocaleString()} · {fmt(call.durationSeconds)} · {call.turnCount} turn{call.turnCount !== 1 ? 's' : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {call.outcome && (
                <span style={{ ...s.badge(OUTCOME_COLORS[call.outcome] ?? '#f3f4f6'), fontWeight: 600 }}>
                  {OUTCOME_LABELS[call.outcome] ?? call.outcome}
                </span>
              )}
              <a href={`/dashboard/businesses/${businessId}/transcripts/${call.id}`} style={s.link}>
                View →
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
