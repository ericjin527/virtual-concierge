'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../../lib/api';
import { s } from '../../../../../lib/styles';

interface BookingRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  requestedDate: string;
  preferredSlot: string | null;
  status: string;
  notes: string | null;
  source: string;
  createdAt: string;
  service: { name: string } | null;
  recommendedSlotsJson: Array<{ startTime: string; endTime: string; therapistId: string }> | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending_owner_confirmation: '#fef3c7',
  confirmed: '#d1fae5',
  declined: '#fee2e2',
  needs_callback: '#dbeafe',
  cancelled: '#f3f4f6',
};

const STATUS_LABELS: Record<string, string> = {
  pending_owner_confirmation: 'Pending',
  confirmed: 'Confirmed',
  declined: 'Declined',
  needs_callback: 'Needs Callback',
  cancelled: 'Cancelled',
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function BookingRequestsPage() {
  const { id: businessId } = useParams<{ id: string }>();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending_owner_confirmation');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [declineNotes, setDeclineNotes] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    (api.getBookingRequests(businessId, statusFilter || undefined) as Promise<BookingRequest[]>)
      .then(setRequests)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [businessId, statusFilter]);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    setUpdating(id);
    try {
      await api.updateBookingRequest(businessId, id, { status, ...(notes ? { notes } : {}) });
      load();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div style={s.page}>
      <a href={`/dashboard/businesses`} style={s.backLink}>← Businesses</a>
      <h1 style={s.h1}>Booking Requests</h1>

      <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['pending_owner_confirmation', 'confirmed', 'needs_callback', 'declined', ''].map((v) => (
          <button
            key={v}
            onClick={() => setStatusFilter(v)}
            style={{
              ...s.btnSecondary,
              background: statusFilter === v ? '#111' : undefined,
              color: statusFilter === v ? '#fff' : undefined,
              borderColor: statusFilter === v ? '#111' : undefined,
            }}
          >
            {v ? STATUS_LABELS[v] : 'All'}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#6b7280' }}>Loading...</p>}

      {!loading && requests.length === 0 && (
        <p style={{ color: '#6b7280' }}>No booking requests found.</p>
      )}

      {requests.map((r) => (
        <div key={r.id} style={{ ...s.card, borderLeft: `4px solid ${STATUS_COLORS[r.status] ? '#d1d5db' : '#e5e7eb'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{r.customerName}</span>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{r.customerPhone}</span>
                <span style={{
                  ...s.badge(STATUS_COLORS[r.status] ?? '#f3f4f6'),
                  color: '#374151',
                  fontWeight: 600,
                }}>
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#374151', marginBottom: 4 }}>
                {r.service?.name && <span style={{ fontWeight: 600 }}>{r.service.name} · </span>}
                <span>Requested: {r.requestedDate}</span>
                {r.preferredSlot && <span> · Preferred: {r.preferredSlot}</span>}
              </div>

              {r.recommendedSlotsJson && r.recommendedSlotsJson.length > 0 && (
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 4 }}>
                  Recommended slots: {r.recommendedSlotsJson.map((sl, i) => (
                    <span key={i} style={{ marginRight: 8 }}>
                      {formatDate(sl.startTime)} {formatTime(sl.startTime)}–{formatTime(sl.endTime)}
                    </span>
                  ))}
                </div>
              )}

              {r.notes && (
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 4 }}>
                  Note: {r.notes}
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 6 }}>
                Submitted {formatDate(r.createdAt)} via {r.source}
              </div>
            </div>

            {r.status === 'pending_owner_confirmation' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 160 }}>
                <button
                  style={{ ...s.btnPrimary, background: '#16a34a', opacity: updating === r.id ? 0.6 : 1 }}
                  disabled={updating === r.id}
                  onClick={() => updateStatus(r.id, 'confirmed')}
                >
                  Confirm
                </button>
                <button
                  style={{ ...s.btnSecondary, opacity: updating === r.id ? 0.6 : 1 }}
                  disabled={updating === r.id}
                  onClick={() => updateStatus(r.id, 'needs_callback')}
                >
                  Needs Callback
                </button>
                <div>
                  <input
                    style={{ ...s.input, marginBottom: 4, fontSize: '0.8rem' }}
                    placeholder="Decline reason (optional)"
                    value={declineNotes[r.id] ?? ''}
                    onChange={e => setDeclineNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                  />
                  <button
                    style={{ ...s.btnDanger, width: '100%', opacity: updating === r.id ? 0.6 : 1 }}
                    disabled={updating === r.id}
                    onClick={() => updateStatus(r.id, 'declined', declineNotes[r.id])}
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
