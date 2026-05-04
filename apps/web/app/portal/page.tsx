'use client';
import { useEffect, useState } from 'react';
import { useUser, useAuth, UserButton } from '@clerk/nextjs';
import { api } from '../../lib/api';

const A = '#1a1714';
const P = '#7C3AED';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';

interface Experience {
  id: string;
  city?: string;
  dates?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  intakeMode?: string;
  budget?: string;
  occasion?: string;
  travelers?: number;
  createdAt: string;
  _count?: { tasks: number };
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  intake:           { label: 'Submitted',      bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  plan_ready:       { label: 'Plan ready ✨',  bg: '#ede9fe', color: '#5b21b6', dot: P },
  in_coordination:  { label: 'Coordinating',   bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  confirmed:        { label: 'Confirmed',       bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  in_progress:      { label: 'In progress',     bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  completed:        { label: 'Completed',       bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
  cancelled:        { label: 'Cancelled',       bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

function fmt(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PortalPage() {
  const { user } = useUser();
  const { getToken, isLoaded } = useAuth();
  const [trips, setTrips] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    getToken().then(token => {
      if (!token) { setLoading(false); return; }
      (api.getMyExperiences(token) as Promise<Experience[]>)
        .then(setTrips)
        .catch(() => setTrips([]))
        .finally(() => setLoading(false));
    });
  }, [isLoaded]);

  const activeTrips = trips.filter(t => !['completed', 'cancelled'].includes(t.status));
  const pastTrips = trips.filter(t => ['completed', 'cancelled'].includes(t.status));

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: '#faf9f6', color: A }}>
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '1rem 2.5rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', color: A, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
          Local Butler
        </a>
        <UserButton afterSignOutUrl="/" />
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: A, fontFamily: 'Georgia, serif', letterSpacing: '-0.025em', margin: '0 0 0.25rem' }}>
            {user?.firstName ? `${user.firstName}'s trips` : 'My trips'}
          </h1>
          <p style={{ color: MUTED, fontSize: '0.88rem', margin: 0 }}>
            {loading ? '' : trips.length === 0 ? 'No trips yet — plan your first shoot below.' : `${trips.length} trip${trips.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Active trips */}
        {!loading && activeTrips.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
              Active
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {activeTrips.map(t => <TripCard key={t.id} trip={t} />)}
            </div>
          </div>
        )}

        {/* Past trips */}
        {!loading && pastTrips.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
              Past
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {pastTrips.map(t => <TripCard key={t.id} trip={t} />)}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {[1, 2].map(i => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.25rem 1.5rem', height: 80, opacity: 0.5 }} />
            ))}
          </div>
        )}

        {/* Plan a new trip CTA */}
        <a href="/travel" style={{
          display: 'flex', alignItems: 'center', gap: '1.25rem',
          background: trips.length === 0 && !loading
            ? `linear-gradient(135deg, ${P} 0%, #A855F7 100%)`
            : '#fff',
          border: trips.length === 0 && !loading ? 'none' : `1px solid ${BORDER}`,
          borderRadius: 12, padding: '1.4rem 1.75rem', textDecoration: 'none', color: 'inherit',
          boxShadow: trips.length === 0 && !loading ? '0 4px 16px rgba(124,58,237,0.3)' : 'none',
        }}>
          <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>✈️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: trips.length === 0 && !loading ? '#fff' : A, fontFamily: 'Georgia, serif', marginBottom: 3 }}>
              Plan a new trip
            </div>
            <div style={{ fontSize: '0.84rem', lineHeight: 1.6, color: trips.length === 0 && !loading ? 'rgba(255,255,255,0.75)' : MUTED }}>
              Get a magazine-style shoot at your destination
            </div>
          </div>
          <span style={{ color: trips.length === 0 && !loading ? 'rgba(255,255,255,0.6)' : FAINT, fontSize: '1.1rem' }}>›</span>
        </a>

        {/* Expert dashboard link */}
        <a href="/expert/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.6rem',
          background: '#fff', border: `1px solid ${BORDER}`,
          borderRadius: 12, padding: '1.25rem 1.75rem', textDecoration: 'none', color: 'inherit',
        }}>
          <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>🧭</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: A, fontFamily: 'Georgia, serif', marginBottom: 3 }}>Expert dashboard</div>
            <div style={{ color: MUTED, fontSize: '0.84rem', lineHeight: 1.6 }}>Manage your expert profile and bids</div>
          </div>
          <span style={{ color: FAINT, fontSize: '1.1rem' }}>›</span>
        </a>
      </div>
    </div>
  );
}

function TripCard({ trip }: { trip: Experience }) {
  const st = STATUS_CONFIG[trip.status] ?? { label: trip.status, bg: '#f3f4f6', color: MUTED, dot: FAINT };
  const dateRange = trip.startDate && trip.endDate
    ? `${fmt(trip.startDate)} – ${fmt(trip.endDate)}`
    : trip.dates ?? fmt(trip.createdAt);

  const href = trip.status === 'plan_ready' || trip.status === 'in_coordination'
    ? `/travel/plan-preview/${trip.id}`
    : `/travel/plan-preview/${trip.id}`;

  return (
    <a href={href} style={{
      background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12,
      padding: '1.1rem 1.4rem', textDecoration: 'none', color: 'inherit',
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📍</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: A }}>
          {trip.city ?? 'Trip'}
          {trip.occasion ? ` · ${trip.occasion.replace(/_/g, ' ')}` : ''}
        </div>
        <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 2 }}>
          {dateRange}
          {trip._count?.tasks ? ` · ${trip._count.tasks} task${trip._count.tasks !== 1 ? 's' : ''}` : ''}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>
          {st.label}
        </span>
        {trip.status === 'plan_ready' && (
          <span style={{ fontSize: '0.72rem', color: P, fontWeight: 600 }}>View plan →</span>
        )}
      </div>
    </a>
  );
}
