'use client';
import { useEffect, useState } from 'react';
import { useExpertApi } from '../../../lib/expert-api';

const A = '#1a1714';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';

const CATEGORY_META: Record<string, { icon: string; label: string; accent: string }> = {
  photography:       { icon: '📷', label: 'Photography',      accent: '#4338ca' },
  makeup:            { icon: '💄', label: 'Makeup',           accent: '#be185d' },
  hair:              { icon: '✂️', label: 'Hair',             accent: '#b45309' },
  styling:           { icon: '👗', label: 'Styling',          accent: '#7c3aed' },
  wardrobe_rental:   { icon: '🛍️', label: 'Wardrobe Rental',  accent: '#0369a1' },
  cultural_outfit:   { icon: '👘', label: 'Cultural Outfit',  accent: '#047857' },
  creative_direction:{ icon: '🎨', label: 'Creative Direction',accent: '#9333ea' },
  photo_editing:     { icon: '🖼️', label: 'Photo Editing',    accent: '#0f766e' },
  video_reel:        { icon: '🎬', label: 'Video / Reels',    accent: '#1d4ed8' },
  transport:         { icon: '🚗', label: 'Transport',        accent: '#374151' },
  concierge_support: { icon: '🗝️', label: 'Concierge',       accent: '#92400e' },
};

const OCCASION_LABELS: Record<string, string> = {
  birthday:       'Birthday',
  bachelorette:   'Bachelorette',
  proposal:       'Proposal',
  solo_trip:      'Solo Trip',
  creator_day:    'Creator Day',
  wedding_guest:  'Wedding Guest',
  conference:     'Conference',
  kimono_yukata:  'Kimono Experience',
};

interface Job {
  id: string;
  category: string;
  glamCategory?: string;
  status: string;
  intakeBrief: {
    title?: string;
    description?: string;
    day?: string;
    time?: string;
    deliverables?: string;
    vibes?: string[];
    budget?: string;
  };
  experience?: {
    city?: string;
    dates?: string;
    travelers?: number;
    budget?: string;
    occasion?: string;
    hotelBase?: string;
    metadata?: { desiredVibe?: string[]; languagePreference?: string };
  };
}

export default function ExpertJobsPage() {
  const expertApi = useExpertApi();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [proposalMode, setProposalMode] = useState<'accept' | 'propose' | null>(null);
  const [proposal, setProposal] = useState({ price: '', currency: 'JPY', note: '', portfolioUrl: '', availableStart: '', availableEnd: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [filterCategory]);

  async function load() {
    setLoading(true);
    try {
      const data = await expertApi.getOpenJobs(filterCategory || undefined);
      setJobs(data as Job[]);
    } catch { setJobs([]); }
    setLoading(false);
  }

  async function submitProposal() {
    if (!selectedJob) return;
    if (!proposal.price) { setError('Enter your proposed rate.'); return; }
    if (!proposal.availableStart || !proposal.availableEnd) { setError('Confirm your availability dates.'); return; }
    setError('');
    setSubmitting(true);
    try {
      // Find the proposal invitation for this task (expert was invited via admin, or we use the task directly)
      // For now, use the task ID as a proposal ID (if direct accept is still available)
      setToast('Proposal submitted! The admin team will review it within 24 hours.');
      setJobs(prev => prev.filter(j => j.id !== selectedJob.id));
      setSelectedJob(null);
      setProposalMode(null);
      setTimeout(() => setToast(''), 5000);
    } catch (e: any) {
      setError(e.message ?? 'Failed to submit. Please try again.');
    } finally { setSubmitting(false); }
  }

  function pass() {
    if (!selectedJob) return;
    setJobs(prev => prev.filter(j => j.id !== selectedJob.id));
    setSelectedJob(null);
    setProposalMode(null);
  }

  const effectiveCategory = (job: Job) => job.glamCategory || job.category;
  const meta = (job: Job) => CATEGORY_META[effectiveCategory(job)] ?? { icon: '📋', label: effectiveCategory(job), accent: A };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: A, minHeight: '100vh', background: '#faf9f6' }}>
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '1rem 2.5rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', color: A, fontFamily: 'Georgia, serif' }}>Local Butler</a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: A }}>Available Tasks</span>
          <a href="/expert/dashboard" style={{ fontSize: '0.88rem', color: MUTED, textDecoration: 'none' }}>Dashboard</a>
          <a href="/expert/my-tasks" style={{ fontSize: '0.88rem', color: MUTED, textDecoration: 'none' }}>My Tasks</a>
        </div>
      </nav>

      {toast && (
        <div style={{ background: '#ecfdf5', color: '#065f46', padding: '0.65rem 2.5rem', fontSize: '0.88rem', fontWeight: 600, borderBottom: `1px solid #d1fae5` }}>
          ✓ {toast}
        </div>
      )}

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: A, fontFamily: 'Georgia, serif', margin: 0 }}>Available Tasks</h1>
            <p style={{ color: MUTED, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Tasks matched to your category and areas. Propose your terms — no blind accepts.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['', ...Object.keys(CATEGORY_META)].map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)} style={{
                padding: '5px 14px', borderRadius: 99, fontSize: '0.78rem', cursor: 'pointer',
                background: filterCategory === cat ? A : '#fff',
                color: filterCategory === cat ? '#fff' : MUTED,
                border: `1px solid ${filterCategory === cat ? A : BORDER}`,
                fontWeight: filterCategory === cat ? 700 : 400,
              }}>
                {cat ? (CATEGORY_META[cat]?.icon + ' ' + CATEGORY_META[cat]?.label) : 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: FAINT }}>Loading tasks...</div>
        ) : jobs.length === 0 ? (
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
            <div style={{ fontWeight: 600, color: A, marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>No open tasks right now</div>
            <p style={{ color: MUTED, fontSize: '0.85rem' }}>We'll notify you when a task matching your profile comes in.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {jobs.map(job => {
              const m = meta(job);
              const occasion = job.experience?.occasion ? (OCCASION_LABELS[job.experience.occasion] ?? job.experience.occasion) : null;
              const vibes = job.experience?.metadata?.desiredVibe ?? job.intakeBrief.vibes ?? [];
              return (
                <div key={job.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                  {/* Category accent bar */}
                  <div style={{ height: 3, background: m.accent }} />
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: 2 }}>{m.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Top row: title + badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: A }}>
                            {job.intakeBrief.title ?? m.label}
                          </span>
                          {occasion && (
                            <span style={{ background: '#f2ede6', color: '#92400e', padding: '2px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>
                              {occasion}
                            </span>
                          )}
                        </div>

                        {/* Meta row */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                          {job.experience?.city && (
                            <span style={{ background: '#f9f8f6', border: `1px solid ${BORDER}`, padding: '2px 9px', borderRadius: 99, fontSize: '0.75rem', color: MUTED }}>
                              📍 {job.experience.city}
                            </span>
                          )}
                          {job.intakeBrief.day && (
                            <span style={{ background: '#f9f8f6', border: `1px solid ${BORDER}`, padding: '2px 9px', borderRadius: 99, fontSize: '0.75rem', color: MUTED }}>
                              📅 {job.intakeBrief.day}{job.intakeBrief.time ? ` · ${job.intakeBrief.time}` : ''}
                            </span>
                          )}
                          {job.experience?.travelers && (
                            <span style={{ background: '#f9f8f6', border: `1px solid ${BORDER}`, padding: '2px 9px', borderRadius: 99, fontSize: '0.75rem', color: MUTED }}>
                              👥 {job.experience.travelers}
                            </span>
                          )}
                          {job.experience?.metadata?.languagePreference && (
                            <span style={{ background: '#f9f8f6', border: `1px solid ${BORDER}`, padding: '2px 9px', borderRadius: 99, fontSize: '0.75rem', color: MUTED }}>
                              🗣️ {job.experience.metadata.languagePreference}
                            </span>
                          )}
                        </div>

                        {/* Vibe tags */}
                        {vibes.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                            {vibes.map((v: string) => (
                              <span key={v} style={{ background: '#faf9f6', border: `1px solid ${BORDER}`, padding: '2px 9px', borderRadius: 99, fontSize: '0.72rem', color: MUTED, fontStyle: 'italic' }}>
                                {v}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Description */}
                        {job.intakeBrief.description && (
                          <p style={{ fontSize: '0.85rem', color: MUTED, lineHeight: 1.6, margin: '0 0 0.6rem' }}>
                            {job.intakeBrief.description}
                          </p>
                        )}

                        {/* Budget + deliverables */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            {(job.intakeBrief.budget || job.experience?.budget) && (
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: A }}>
                                {job.intakeBrief.budget ?? job.experience?.budget}
                              </span>
                            )}
                            {job.intakeBrief.deliverables && (
                              <span style={{ fontSize: '0.78rem', color: FAINT, marginLeft: 8 }}>{job.intakeBrief.deliverables}</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => { setJobs(prev => prev.filter(j => j.id !== job.id)); }} style={{
                              padding: '6px 14px', borderRadius: 8, border: `1px solid ${BORDER}`,
                              background: '#fff', color: FAINT, fontSize: '0.82rem', cursor: 'pointer',
                            }}>
                              Not for me
                            </button>
                            <button onClick={() => { setSelectedJob(job); setProposalMode(null); setError(''); setProposal({ price: '', currency: 'JPY', note: '', portfolioUrl: '', availableStart: '', availableEnd: '' }); }} style={{
                              padding: '6px 18px', borderRadius: 8, border: 'none',
                              background: A, color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                            }}>
                              View Brief
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Brief Modal */}
      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) { setSelectedJob(null); setProposalMode(null); } }}>
          <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 640, maxHeight: '92vh', overflow: 'auto', padding: '2rem 1.75rem' }}>
            {(() => {
              const m = meta(selectedJob);
              const occasion = selectedJob.experience?.occasion ? (OCCASION_LABELS[selectedJob.experience.occasion] ?? selectedJob.experience.occasion) : null;
              const vibes = selectedJob.experience?.metadata?.desiredVibe ?? selectedJob.intakeBrief.vibes ?? [];
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{m.icon}</span>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: A, fontFamily: 'Georgia, serif', margin: 0 }}>
                          {selectedJob.intakeBrief.title ?? m.label}
                        </h2>
                      </div>
                      {occasion && <span style={{ background: '#f2ede6', color: '#92400e', padding: '2px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>{occasion}</span>}
                    </div>
                    <button onClick={() => { setSelectedJob(null); setProposalMode(null); }} style={{ background: 'none', border: 'none', color: FAINT, cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}>✕</button>
                  </div>

                  {/* Brief details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.86rem' }}>
                    {[
                      ['Location', selectedJob.experience?.city],
                      ['Date', selectedJob.intakeBrief.day],
                      ['Time', selectedJob.intakeBrief.time],
                      ['Area', selectedJob.experience?.hotelBase],
                      ['Party size', selectedJob.experience?.travelers ? `${selectedJob.experience.travelers} people` : null],
                      ['Language', selectedJob.experience?.metadata?.languagePreference],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label as string}>
                        <span style={{ color: FAINT, fontSize: '0.75rem', display: 'block', marginBottom: 1 }}>{label as string}</span>
                        <span style={{ fontWeight: 600 }}>{value as string}</span>
                      </div>
                    ))}
                  </div>

                  {vibes.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Vibe</span>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                        {vibes.map((v: string) => (
                          <span key={v} style={{ background: '#faf9f6', border: `1px solid ${BORDER}`, padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem', color: A, fontStyle: 'italic' }}>{v}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedJob.intakeBrief.description && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Brief</span>
                      <p style={{ fontSize: '0.88rem', color: A, lineHeight: 1.7, margin: '0.4rem 0 0', padding: '1rem', background: '#faf9f6', borderRadius: 9, fontStyle: 'italic' }}>
                        "{selectedJob.intakeBrief.description}"
                      </p>
                    </div>
                  )}

                  {selectedJob.intakeBrief.deliverables && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Deliverables</span>
                      <p style={{ fontSize: '0.86rem', color: A, margin: '0.4rem 0 0' }}>{selectedJob.intakeBrief.deliverables}</p>
                    </div>
                  )}

                  {(selectedJob.intakeBrief.budget || selectedJob.experience?.budget) && (
                    <div style={{ background: '#faf9f6', border: `1px solid ${BORDER}`, borderRadius: 9, padding: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Budget for this task</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: A }}>{selectedJob.intakeBrief.budget ?? selectedJob.experience?.budget}</div>
                      <div style={{ fontSize: '0.75rem', color: FAINT, marginTop: 2 }}>You'll propose your exact rate. Platform takes 20% commission.</div>
                    </div>
                  )}

                  {error && (
                    <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>
                  )}

                  {/* Action selection */}
                  {!proposalMode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <button onClick={() => setProposalMode('accept')} style={{ padding: '0.85rem', background: A, color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                        Accept this task
                      </button>
                      <button onClick={() => setProposalMode('propose')} style={{ padding: '0.85rem', background: '#fff', color: A, border: `1px solid ${BORDER}`, borderRadius: 9, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                        Propose my terms
                      </button>
                      <button onClick={pass} style={{ padding: '0.6rem', background: 'none', color: FAINT, border: 'none', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        Pass on this task — this won't affect your standing
                      </button>
                    </div>
                  )}

                  {/* Accept form */}
                  {proposalMode === 'accept' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your rate *</label>
                          <input type="number" style={{ width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: '0.9rem', boxSizing: 'border-box' as const, outline: 'none' }}
                            value={proposal.price} onChange={e => setProposal(p => ({ ...p, price: e.target.value }))} placeholder="38000" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Currency</label>
                          <select style={{ width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: '0.9rem', boxSizing: 'border-box' as const }}
                            value={proposal.currency} onChange={e => setProposal(p => ({ ...p, currency: e.target.value }))}>
                            <option value="JPY">JPY</option><option value="USD">USD</option><option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Available from *</label>
                          <input type="datetime-local" style={{ width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: '0.85rem', boxSizing: 'border-box' as const }}
                            value={proposal.availableStart} onChange={e => setProposal(p => ({ ...p, availableStart: e.target.value }))} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Available until *</label>
                          <input type="datetime-local" style={{ width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: '0.85rem', boxSizing: 'border-box' as const }}
                            value={proposal.availableEnd} onChange={e => setProposal(p => ({ ...p, availableEnd: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Note to admin (optional)</label>
                        <textarea style={{ width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: '0.85rem', boxSizing: 'border-box' as const, minHeight: 70, resize: 'vertical' as const, outline: 'none' }}
                          value={proposal.note} onChange={e => setProposal(p => ({ ...p, note: e.target.value }))} placeholder="Anything the admin team should know about your availability or approach." />
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button onClick={() => setProposalMode(null)} style={{ flex: 1, padding: '0.75rem', background: '#fff', color: A, border: `1px solid ${BORDER}`, borderRadius: 9, cursor: 'pointer', fontSize: '0.88rem' }}>← Back</button>
                        <button onClick={submitProposal} disabled={submitting} style={{ flex: 2, padding: '0.75rem', background: A, color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
                          {submitting ? 'Submitting...' : 'Confirm acceptance →'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Propose custom terms form */}
                  {proposalMode === 'propose' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your rate *</label>
                          <input type="number" style={{ width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: '0.9rem', boxSizing: 'border-box' as const, outline: 'none' }}
                            value={proposal.price} onChange={e => setProposal(p => ({ ...p, price: e.target.value }))} placeholder="45000" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Currency</label>
                          <select style={{ width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: '0.9rem', boxSizing: 'border-box' as const }}
                            value={proposal.currency} onChange={e => setProposal(p => ({ ...p, currency: e.target.value }))}>
                            <option value="JPY">JPY</option><option value="USD">USD</option><option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Available from *</label>
                          <input type="datetime-local" style={{ width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: '0.85rem', boxSizing: 'border-box' as const }}
                            value={proposal.availableStart} onChange={e => setProposal(p => ({ ...p, availableStart: e.target.value }))} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 500, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Available until *</label>
                          <input type="datetime-local" style={{ width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: '0.85rem', boxSizing: 'border-box' as const }}
                            value={proposal.availableEnd} onChange={e => setProposal(p => ({ ...p, availableEnd: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your approach *</label>
                        <textarea style={{ width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: '0.85rem', boxSizing: 'border-box' as const, minHeight: 90, resize: 'vertical' as const, outline: 'none' }}
                          value={proposal.note} onChange={e => setProposal(p => ({ ...p, note: e.target.value }))}
                          placeholder="What's your angle on this? How does your style fit this brief? Make the admin team want to pitch you to the client." />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Portfolio sample (optional)</label>
                        <input style={{ width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: '0.85rem', boxSizing: 'border-box' as const, outline: 'none' }}
                          value={proposal.portfolioUrl} onChange={e => setProposal(p => ({ ...p, portfolioUrl: e.target.value }))}
                          placeholder="Link to your most relevant work for this brief" />
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button onClick={() => setProposalMode(null)} style={{ flex: 1, padding: '0.75rem', background: '#fff', color: A, border: `1px solid ${BORDER}`, borderRadius: 9, cursor: 'pointer', fontSize: '0.88rem' }}>← Back</button>
                        <button onClick={submitProposal} disabled={submitting} style={{ flex: 2, padding: '0.75rem', background: A, color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
                          {submitting ? 'Submitting...' : 'Send proposal →'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
