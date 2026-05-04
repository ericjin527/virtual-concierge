'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { api } from '../../../../../../lib/api';

const P = '#7C3AED';
const P_LIGHT = 'rgba(124,58,237,0.08)';
const P_BORDER = 'rgba(124,58,237,0.25)';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

interface Expert {
  id: string; name: string; photoUrl?: string; rating?: number; completedJobs?: number;
  bio?: string; glamCategory?: string; metadata?: Record<string, any>;
  _count?: { reviews: number };
}
interface Proposal {
  id: string; status: string; proposedPrice?: number; currency?: string;
  note?: string; portfolioSampleUrl?: string;
  availableStart?: string; availableEnd?: string;
  expert: Expert;
}
interface ExpertCard { id: string; name: string; photoUrl?: string; rating?: number;
  completedJobs: number; bio?: string; category?: string; metadata?: Record<string, any>;
  reviewCount?: number;
}
interface Message { id: string; fromRole: string; body: string; createdAt: string }
interface Task {
  id: string; category: string; glamCategory?: string; status: string; urgency?: string;
  createdAt: string; claimedAt?: string; completedAt?: string;
  cancelReason?: string; deliverable?: Record<string, any>;
  intakeBrief: { title?: string; description?: string; day?: string; time?: string };
  expert?: ExpertCard;
  lead?: { name?: string; phone?: string };
  messages?: Message[];
}

const CATEGORY_ICONS: Record<string, string> = {
  photography: '📷', makeup: '💄', hair: '💇', styling: '👗',
  wardrobe_rental: '🧥', cultural_outfit: '👘', creative_direction: '🎨',
  photo_editing: '🖼️', video_reel: '🎬', location_scouting: '🗺️',
  transport: '🚗', concierge_support: '🤝',
  driver: '🚗', errand_helper: '📦', local_guide: '🗺️', photographer: '📷',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new:            { label: 'Open',        color: '#92400e', bg: '#fef3c7' },
  matched:        { label: 'Matched',     color: '#1d4ed8', bg: '#dbeafe' },
  accepted:       { label: 'Accepted',    color: '#5b21b6', bg: '#ede9fe' },
  in_progress:    { label: 'In Progress', color: '#1d4ed8', bg: '#dbeafe' },
  completed:      { label: 'Complete',    color: '#065f46', bg: '#d1fae5' },
  cancelled:      { label: 'Cancelled',   color: '#6b7280', bg: '#f3f4f6' },
  declined:       { label: 'Declined',    color: '#991b1b', bg: '#fee2e2' },
};

const PROPOSAL_STATUS: Record<string, string> = {
  invited: 'Invited', accepted: 'Submitted bid', declined: 'Declined',
  selected: 'Selected', rejected: 'Not selected',
};

const ROLE_LABELS: Record<string, string> = {
  customer: 'You', expert: 'Expert', admin: 'Support', butler: 'Butler',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function Stars({ rating, count }: { rating: number; count?: number }) {
  const full = Math.round(rating);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#f59e0b', fontSize: '0.9rem', letterSpacing: -1 }}>
        {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      </span>
      <span style={{ fontSize: '0.82rem', color: MUTED }}>
        {rating.toFixed(1)}{count != null ? ` (${count})` : ''}
      </span>
    </span>
  );
}

function ExpertBidCard({
  proposal, onSelect, selecting, selected,
}: {
  proposal: Proposal;
  onSelect: (id: string) => void;
  selecting: boolean;
  selected: boolean;
}) {
  const e = proposal.expert;
  const gallery = (e.metadata?.galleryPhotos as string[] | undefined) ?? [];
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = [e.photoUrl, ...gallery].filter(Boolean) as string[];

  return (
    <div style={{
      background: '#fff', border: selected ? `2px solid ${P}` : `1px solid ${BORDER}`,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: selected ? `0 0 0 4px ${P_LIGHT}` : '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      minWidth: 260, maxWidth: 320, flex: '1 1 260px',
    }}>
      {/* Photo */}
      <div style={{ position: 'relative', height: 200, background: '#f3f4f6', overflow: 'hidden' }}>
        {photos.length > 0 ? (
          <img src={photos[photoIdx]} alt={e.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' }}>
            {CATEGORY_ICONS[e.glamCategory ?? ''] ?? '👤'}
          </div>
        )}
        {photos.length > 1 && (
          <>
            <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)} style={{
              position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
              width: 28, height: 28, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
            }}>‹</button>
            <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
              width: 28, height: 28, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
            }}>›</button>
          </>
        )}
        {/* Avatar overlay */}
        {e.photoUrl && photos.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            width: 44, height: 44, borderRadius: '50%', border: '2px solid #fff', overflow: 'hidden',
          }}>
            <img src={e.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '1rem 1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: TEXT }}>{e.name}</div>
            {e.rating != null && <Stars rating={e.rating} count={e._count?.reviews} />}
          </div>
          {proposal.proposedPrice != null && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: TEXT }}>
                {proposal.currency ?? '¥'}{proposal.proposedPrice.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: MUTED }}>bid price</div>
            </div>
          )}
        </div>

        {e.bio && (
          <p style={{ fontSize: '0.82rem', color: MUTED, lineHeight: 1.6, margin: '0.6rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {e.bio}
          </p>
        )}

        {proposal.note && (
          <div style={{ background: P_LIGHT, border: `1px solid ${P_BORDER}`, borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#5b21b6', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            "{proposal.note}"
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <a href={`/experts/${e.id}`} style={{
            flex: 1, textAlign: 'center', border: `1px solid ${BORDER}`, borderRadius: 8,
            padding: '0.55rem', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
            color: TEXT, background: '#f9fafb',
          }}>
            View Profile
          </a>
          {proposal.status === 'accepted' && (
            <button
              onClick={() => onSelect(proposal.id)}
              disabled={selecting}
              style={{
                flex: 1, border: 'none', borderRadius: 8, padding: '0.55rem',
                fontSize: '0.82rem', fontWeight: 700, cursor: selecting ? 'wait' : 'pointer',
                background: selected ? '#065f46' : `linear-gradient(135deg, ${P}, #A855F7)`,
                color: '#fff', transition: 'opacity 0.2s',
                opacity: selecting ? 0.7 : 1,
              }}
            >
              {selected ? '✓ Selected' : 'Select'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TaskDetailPage() {
  const { id: experienceId, taskId } = useParams<{ id: string; taskId: string }>();
  const { getToken } = useAuth();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTask = useCallback(() => {
    api.getTask(taskId).then(t => setTask(t as Task)).catch(() => {});
  }, [taskId]);

  useEffect(() => {
    Promise.all([
      api.getTask(taskId).then(t => setTask(t as Task)),
      api.getProposalsForTask(taskId).then(p => setProposals(p as Proposal[])).catch(() => {}),
    ]).finally(() => setLoading(false));

    const interval = setInterval(loadTask, 30000);
    return () => clearInterval(interval);
  }, [taskId, loadTask]);

  async function handleSelect(proposalId: string) {
    setSelecting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await api.customerSelectProposal(proposalId, token);
      setSelectedProposalId(proposalId);
      loadTask();
      // refresh proposals
      api.getProposalsForTask(taskId).then(p => setProposals(p as Proposal[])).catch(() => {});
    } catch (err) {
      alert('Could not select expert. Please try again.');
    } finally {
      setSelecting(false);
    }
  }

  if (loading) return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', textAlign: 'center', color: MUTED }}>Loading...</div>
  );
  if (!task) return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', textAlign: 'center', color: '#b91c1c' }}>Task not found.</div>
  );

  const st = STATUS_CONFIG[task.status] ?? { label: 'Unknown', bg: '#f3f4f6', color: MUTED };
  const title = task.intakeBrief.title ?? task.category.replace(/_/g, ' ');
  const icon = CATEGORY_ICONS[task.glamCategory ?? task.category] ?? '📋';

  const acceptedProposals = proposals.filter(p => p.status === 'accepted');
  const hasProposals = acceptedProposals.length > 0;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: TEXT, minHeight: '100vh', background: '#fafafa' }}>
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0.85rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', background: '#fff', position: 'sticky', top: 0, zIndex: 20 }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1rem', textDecoration: 'none', color: P }}>Local Butler</a>
        <a href={`/travel/plan-preview/${experienceId}`} style={{ fontSize: '0.85rem', color: MUTED, textDecoration: 'none' }}>← Back to plan</a>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Header */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem' }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: TEXT }}>{title}</h1>
              <div style={{ color: MUTED, fontSize: '0.85rem', marginTop: '0.2rem' }}>
                {task.intakeBrief.day}{task.intakeBrief.time ? ` · ${task.intakeBrief.time}` : ''}
              </div>
            </div>
            <span style={{ background: st.bg, color: st.color, padding: '3px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
              {st.label}
            </span>
          </div>
          {task.intakeBrief.description && (
            <p style={{ margin: '0.75rem 0 0', color: '#374151', fontSize: '0.88rem', lineHeight: 1.6 }}>
              {task.intakeBrief.description}
            </p>
          )}
        </div>

        {/* Expert bid cards */}
        {hasProposals && task.status !== 'accepted' && (
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
              {acceptedProposals.length} Expert{acceptedProposals.length > 1 ? 's' : ''} submitted a bid — pick one
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {acceptedProposals.map(p => (
                <ExpertBidCard
                  key={p.id}
                  proposal={p}
                  onSelect={handleSelect}
                  selecting={selecting}
                  selected={selectedProposalId === p.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Assigned expert (after selection) */}
        {task.expert && task.status === 'accepted' && (
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>✓ Your Expert</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                {task.expert.photoUrl
                  ? <img src={task.expert.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.3rem' }}>👤</div>}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: TEXT }}>{task.expert.name}</div>
                {task.expert.rating != null && <Stars rating={task.expert.rating} count={task.expert.reviewCount} />}
              </div>
              <a href={`/experts/${task.expert.id}`} style={{ marginLeft: 'auto', color: P, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                View profile →
              </a>
            </div>
            {task.expert.bio && (
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>{task.expert.bio}</p>
            )}
          </div>
        )}

        {/* No proposals yet */}
        {!hasProposals && task.status === 'new' && (
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.5rem', textAlign: 'center', color: MUTED, fontSize: '0.88rem' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🔍</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Finding your expert</div>
            <div>We're matching local talent for this task. You'll see their bids here soon.</div>
          </div>
        )}

        {/* Deliverable */}
        {task.status === 'completed' && task.deliverable && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>✓ Completed</div>
            {Object.entries(task.deliverable).map(([k, v]) => v && (
              <div key={k} style={{ marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>{k.replace(/([A-Z])/g, ' $1').trim()}: </span>
                <span style={{ color: MUTED }}>{String(v)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.25rem 1.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <TimelineItem time={task.createdAt} label="Task created by your butler" />
            {task.claimedAt && <TimelineItem time={task.claimedAt} label={`Expert selected`} />}
            {task.completedAt && <TimelineItem time={task.completedAt} label="Marked complete" highlight />}
            {task.cancelReason && <TimelineItem time={task.createdAt} label={`Cancelled: ${task.cancelReason}`} error />}
          </div>
        </div>

        {/* Messages */}
        {task.messages && task.messages.length > 0 && (
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Updates</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {task.messages.map(m => (
                <div key={m.id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: MUTED, minWidth: 52, paddingTop: 2 }}>
                    {ROLE_LABELS[m.fromRole] ?? m.fromRole}
                  </span>
                  <div style={{ flex: 1, fontSize: '0.86rem', color: '#374151', lineHeight: 1.5 }}>{m.body}</div>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', flexShrink: 0, paddingTop: 2 }}>{fmt(m.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineItem({ time, label, highlight, error }: { time: string; label: string; highlight?: boolean; error?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: error ? '#ef4444' : highlight ? '#10b981' : '#d1d5db', flexShrink: 0, marginTop: 5 }} />
      <span style={{ color: highlight ? '#065f46' : error ? '#b91c1c' : '#374151' }}>{label}</span>
      <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '0.78rem', flexShrink: 0 }}>{fmt(time)}</span>
    </div>
  );
}
