'use client';
import { useEffect, useState } from 'react';
import { useExpertApi } from '../../../lib/expert-api';

interface Job {
  id: string; category: string; status: string; urgency?: string; createdAt: string;
  intakeBrief: { title?: string; description?: string; day?: string; time?: string };
  experience?: { city?: string; dates?: string; startDate?: string; endDate?: string; travelers?: number; budget?: string };
}

const CATEGORY_ICONS: Record<string, string> = {
  driver: '🚗', restaurant_expert: '🍽️', errand_helper: '📦', local_guide: '🗺️',
  photographer: '📷', private_chef: '👨‍🍳', cleaner: '🧹', florist: '💐', family_helper: '👨‍👧', party_helper: '🎉',
};
const CATEGORY_LABELS: Record<string, string> = {
  driver: 'Transport', restaurant_expert: 'Restaurant', errand_helper: 'Errand',
  local_guide: 'Guide', photographer: 'Photography', private_chef: 'Chef',
  cleaner: 'Cleaning', florist: 'Florist', family_helper: 'Family', party_helper: 'Events',
};
const ALL_CATEGORIES = Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: `${CATEGORY_ICONS[v]} ${l}` }));

export default function ExpertJobsPage() {
  const expertApi = useExpertApi();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => { load(); }, [filterCategory, filterCity]);

  async function load() {
    setLoading(true);
    try {
      const data = await expertApi.getOpenJobs(filterCategory || undefined, filterCity || undefined);
      setJobs(data as Job[]);
    } catch { setJobs([]); }
    setLoading(false);
  }

  async function accept(jobId: string) {
    setError('');
    setAccepting(jobId);
    try {
      await expertApi.acceptJob(jobId);
      setToast('Job accepted! Check My Tasks.');
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setTimeout(() => setToast(''), 3000);
    } catch (e: any) {
      setError(e.message ?? 'Failed to accept job.');
    } finally { setAccepting(null); }
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', minHeight: '100vh', background: '#f3f4f6' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '0.85rem 1.5rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Browse Jobs</span>
          <a href="/expert/my-tasks" style={{ fontSize: '0.88rem', color: '#6b7280', textDecoration: 'none' }}>My Tasks</a>
          <a href="/expert/dashboard" style={{ fontSize: '0.88rem', color: '#6b7280', textDecoration: 'none' }}>Dashboard</a>
        </div>
      </nav>

      {toast && <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.6rem 1.5rem', fontSize: '0.88rem', fontWeight: 600 }}>✓ {toast}</div>}
      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}>{error}</div>}

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, flex: 1 }}>Open Jobs</h1>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 7, fontSize: '0.85rem', background: '#fff' }}>
            <option value="">All categories</option>
            {ALL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input value={filterCity} onChange={e => setFilterCity(e.target.value)} placeholder="Filter by city..." style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 7, fontSize: '0.85rem', width: 160 }} />
          <button onClick={load} style={{ padding: '0.5rem 0.75rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 7, cursor: 'pointer', fontSize: '0.85rem' }}>↻</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
            No open jobs right now. Check back soon!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {jobs.map(job => (
              <div key={job.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{CATEGORY_ICONS[job.category] ?? '📋'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {job.intakeBrief.title ?? CATEGORY_LABELS[job.category]}
                      {job.urgency === 'urgent' && <span style={{ marginLeft: 8, background: '#fee2e2', color: '#b91c1c', padding: '1px 7px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>URGENT</span>}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 2 }}>
                      {job.experience?.city} · {job.intakeBrief.day}{job.intakeBrief.time ? ` · ${job.intakeBrief.time}` : ''}
                    </div>
                    {job.intakeBrief.description && (
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#374151', lineHeight: 1.55 }}>{job.intakeBrief.description}</p>
                    )}
                    <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {job.experience?.travelers && (
                        <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', color: '#374151' }}>
                          👥 {job.experience.travelers} {job.experience.travelers === 1 ? 'person' : 'people'}
                        </span>
                      )}
                      {job.experience?.budget && (
                        <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', color: '#374151' }}>
                          💰 {job.experience.budget}
                        </span>
                      )}
                      <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', color: '#374151' }}>
                        {CATEGORY_LABELS[job.category]}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => accept(job.id)}
                    disabled={accepting === job.id}
                    style={{
                      padding: '0.55rem 1.1rem', background: '#111', color: '#fff', border: 'none',
                      borderRadius: 8, cursor: accepting === job.id ? 'not-allowed' : 'pointer',
                      fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                      opacity: accepting === job.id ? 0.6 : 1,
                    }}
                  >
                    {accepting === job.id ? '...' : 'Accept'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
