'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';

interface Expert {
  id: string; name: string; email: string; phone: string; bio?: string; photoUrl?: string;
  categories: string[]; cities: string[]; services: string[]; specialties: string[];
  certifications: string[]; languages: string[]; status: string;
  completedJobs: number; rating?: number; isAvailable: boolean;
  backgroundChecked: boolean; insuranceVerified: boolean;
  createdAt: string; clerkUserId?: string;
  reviews?: { id: string; rating: number; body?: string; createdAt: string }[];
  tasks?: { id: string; category: string; status: string; createdAt: string }[];
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
  pending:   { bg: '#fffbeb', color: '#92400e', label: 'Pending approval' },
  approved:  { bg: '#ecfdf5', color: '#065f46', label: 'Approved' },
  suspended: { bg: '#fef2f2', color: '#991b1b', label: 'Suspended' },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: FAINT, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function ExpertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.getExpert(id).then(e => { setExpert(e as Expert); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  async function doAction(action: 'approve' | 'suspend') {
    setActing(true); setMsg('');
    try {
      await (action === 'approve' ? api.approveExpert(id) : api.suspendExpert(id));
      const updated = await api.getExpert(id);
      setExpert(updated as Expert);
      setMsg(action === 'approve' ? 'Expert approved.' : 'Expert suspended.');
    } catch { setMsg('Action failed.'); }
    setActing(false);
  }

  if (loading) return (
    <div style={{ color: FAINT, padding: '3rem 0', fontSize: '0.88rem' }}>Loading...</div>
  );
  if (!expert) return (
    <div style={{ color: '#991b1b', padding: '3rem 0', fontSize: '0.88rem' }}>Expert not found.</div>
  );

  const st = STATUS_STYLE[expert.status] ?? STATUS_STYLE.pending;

  return (
    <div>
      {/* Back */}
      <a href="/dashboard/experts" style={{ fontSize: '0.82rem', color: MUTED, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '1.5rem' }}>
        ← Experts
      </a>

      {/* Header */}
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f2ede6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            {CATEGORY_ICONS[expert.categories?.[0]] ?? '👤'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: A, margin: 0, fontFamily: 'Georgia, serif' }}>{expert.name}</h1>
              <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600 }}>{st.label}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: MUTED, marginTop: 4 }}>
              {expert.email} · {expert.phone}
            </div>
            <div style={{ fontSize: '0.82rem', color: MUTED, marginTop: 2 }}>
              {expert.cities?.join(', ')} · {expert.completedJobs} completed
              {expert.rating && ` · ★ ${expert.rating.toFixed(1)}`}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
            {expert.status !== 'approved' && (
              <button onClick={() => doAction('approve')} disabled={acting} style={{
                padding: '0.5rem 1.25rem', background: A, color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                opacity: acting ? 0.6 : 1,
              }}>
                Approve expert
              </button>
            )}
            {expert.status !== 'suspended' && (
              <button onClick={() => doAction('suspend')} disabled={acting} style={{
                padding: '0.5rem 1.25rem', background: '#fef2f2', color: '#991b1b',
                border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                opacity: acting ? 0.6 : 1,
              }}>
                Suspend
              </button>
            )}
            {msg && <div style={{ fontSize: '0.78rem', color: MUTED }}>{msg}</div>}
          </div>
        </div>

        {expert.bio && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${BORDER}`, fontSize: '0.88rem', color: '#374151', lineHeight: 1.65 }}>
            {expert.bio}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        <div>
          <Section title="Categories & Cities">
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1rem 1.25rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: MUTED, marginBottom: '0.4rem' }}>Categories</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {expert.categories?.map(c => (
                    <span key={c} style={{ background: '#f2ede6', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 500 }}>
                      {CATEGORY_ICONS[c] ?? ''} {c.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: MUTED, marginBottom: '0.4rem' }}>Cities</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {expert.cities?.map(c => (
                    <span key={c} style={{ background: '#f2ede6', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 500 }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Credentials">
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Background check', done: expert.backgroundChecked },
                { label: 'Insurance verified', done: expert.insuranceVerified },
                { label: 'Available for new jobs', done: expert.isAvailable },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: MUTED }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: row.done ? '#065f46' : '#991b1b' }}>
                    {row.done ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: MUTED }}>Languages</span>
                <span style={{ fontWeight: 500, color: A }}>{expert.languages?.join(', ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: MUTED }}>Joined</span>
                <span style={{ color: A }}>{new Date(expert.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Section>

          {expert.services?.length > 0 && (
            <Section title="Services offered">
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {expert.services.map(s => (
                    <span key={s} style={{ background: '#f5f0ea', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem' }}>{s}</span>
                  ))}
                </div>
              </div>
            </Section>
          )}
        </div>

        <div>
          <Section title="Recent reviews">
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
              {!expert.reviews?.length ? (
                <div style={{ padding: '1.25rem', fontSize: '0.85rem', color: FAINT, textAlign: 'center' }}>No reviews yet.</div>
              ) : expert.reviews.slice(0, 5).map((r, i) => (
                <div key={r.id} style={{ padding: '0.85rem 1.25rem', borderBottom: i < (expert.reviews?.length ?? 0) - 1 ? `1px solid ${BORDER}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: '#b45309' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span style={{ fontSize: '0.75rem', color: FAINT }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.body && <div style={{ fontSize: '0.82rem', color: MUTED, lineHeight: 1.5 }}>{r.body}</div>}
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
