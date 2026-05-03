'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';

interface Expert {
  id: string; name: string; email: string; phone: string;
  categories: string[]; cities: string[]; status: string;
  completedJobs: number; rating?: number; createdAt: string;
  bio?: string; _count?: { tasks: number };
}

const A = '#1a1714';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🚗', restaurant_expert: '🍽️', errand_helper: '📦', local_guide: '🗺️',
  photographer: '📷', private_chef: '👨‍🍳', cleaner: '🧹', florist: '💐',
  family_helper: '👨‍👧', party_helper: '🎉',
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#fffbeb', color: '#92400e', label: 'Pending' },
  approved:  { bg: '#ecfdf5', color: '#065f46', label: 'Approved' },
  suspended: { bg: '#fef2f2', color: '#991b1b', label: 'Suspended' },
};

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'all', label: 'All' },
];

export default function ExpertsAdminPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('status') ?? 'pending');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    try { setExperts(await api.getAdminExperts(tab) as Expert[]); }
    catch { setExperts([]); }
    setLoading(false);
  }

  async function approve(e: React.MouseEvent, id: string) {
    e.preventDefault();
    setActing(id);
    await api.approveExpert(id).catch(() => null);
    await load();
    setActing(null);
  }

  async function suspend(e: React.MouseEvent, id: string) {
    e.preventDefault();
    setActing(id);
    await api.suspendExpert(id).catch(() => null);
    await load();
    setActing(null);
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: A, letterSpacing: '-0.025em', margin: 0, fontFamily: 'Georgia, serif' }}>
          Experts
        </h1>
        <p style={{ color: MUTED, fontSize: '0.85rem', marginTop: 5, margin: '5px 0 0' }}>
          Review, approve, and manage expert profiles.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9, padding: '0.3rem', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)} style={{
            padding: '0.4rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.82rem',
            background: tab === t.value ? A : 'transparent',
            color: tab === t.value ? '#fff' : MUTED,
            fontWeight: tab === t.value ? 600 : 400,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ color: FAINT, fontSize: '0.88rem', padding: '2rem 0' }}>Loading...</div>
      )}

      {!loading && experts.length === 0 && (
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '3rem', textAlign: 'center', color: FAINT, fontSize: '0.88rem' }}>
          No experts in this status.
        </div>
      )}

      {!loading && experts.length > 0 && (
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
          {experts.map((ex, i) => {
            const st = STATUS_STYLE[ex.status] ?? STATUS_STYLE.pending;
            return (
              <a key={ex.id} href={`/dashboard/experts/${ex.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                borderBottom: i < experts.length - 1 ? `1px solid ${BORDER}` : 'none',
                textDecoration: 'none', color: 'inherit',
              }}>
                {/* Avatar placeholder */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: '#f2ede6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                }}>
                  {CATEGORY_ICONS[ex.categories?.[0] ?? ''] ?? '👤'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: A }}>{ex.name}</div>
                  <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 2 }}>
                    {ex.cities?.join(', ')} · {ex.categories?.map(c => CATEGORY_ICONS[c] ?? c).join(' ')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: FAINT, marginTop: 1 }}>
                    {ex.email} · {ex.phone}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 6 }}>
                    <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600 }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: FAINT }}>
                    {ex.completedJobs} jobs · {ex.rating ? `★ ${ex.rating.toFixed(1)}` : 'no rating'}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }} onClick={e => e.preventDefault()}>
                  {ex.status !== 'approved' && (
                    <button
                      onClick={e => approve(e, ex.id)}
                      disabled={acting === ex.id}
                      style={{
                        padding: '0.35rem 0.75rem', background: '#ecfdf5', color: '#065f46',
                        border: '1px solid #bbf7d0', borderRadius: 6, cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: 600, opacity: acting === ex.id ? 0.5 : 1,
                      }}>
                      Approve
                    </button>
                  )}
                  {ex.status !== 'suspended' && (
                    <button
                      onClick={e => suspend(e, ex.id)}
                      disabled={acting === ex.id}
                      style={{
                        padding: '0.35rem 0.75rem', background: '#fef2f2', color: '#991b1b',
                        border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: 600, opacity: acting === ex.id ? 0.5 : 1,
                      }}>
                      Suspend
                    </button>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
