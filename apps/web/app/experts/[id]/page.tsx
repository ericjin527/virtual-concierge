'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';

interface Review { id: string; rating: number; body?: string; createdAt: string }
interface Expert {
  id: string; name: string; businessName?: string; bio?: string; photoUrl?: string;
  category: string; serviceArea: string; services: string[]; specialties: string[];
  certifications: string[]; insuranceVerified: boolean; backgroundChecked: boolean;
  diagnosticFee?: number; languages: string[]; rating?: number; completedJobs: number;
  responseTimeMinutes?: number; badges: string[]; reviews: Review[];
}

const BADGE_LABELS: Record<string, string> = {
  verified: '✓ Verified', licensed: '⚖ Licensed', insured: '🛡 Insured',
  background_checked: '🔍 Background checked', customer_favorite: '⭐ Customer favorite',
};

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: '1rem' }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  );
}

export default function ExpertProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (api.getExpert(id) as Promise<Expert>).then(setExpert).catch(() => setExpert(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', textAlign: 'center' }}>Loading...</div>;
  if (!expert) return <div style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', textAlign: 'center', color: '#b91c1c' }}>Expert not found.</div>;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#111', maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <a href="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.85rem' }}>← Local Butler</a>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#e5e7eb', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
          {expert.photoUrl ? <img src={expert.photoUrl} alt={expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 2 }}>{expert.name}</h1>
          {expert.businessName && <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 4 }}>{expert.businessName}</div>}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            {expert.rating != null && <><Stars rating={expert.rating} /><span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{expert.rating.toFixed(1)} · {expert.completedJobs} jobs</span></>}
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>📍 {expert.serviceArea}</span>
            {expert.responseTimeMinutes && <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>⚡ Responds in ~{expert.responseTimeMinutes}min</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {expert.badges.map(b => (
              <span key={b} style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>
                {BADGE_LABELS[b] ?? b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {expert.diagnosticFee != null && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem 1rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Diagnostic fee</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>${expert.diagnosticFee}</span>
        </div>
      )}

      {expert.bio && (
        <div style={{ marginTop: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>About</h2>
          <p style={{ color: '#374151', lineHeight: 1.7, fontSize: '0.9rem' }}>{expert.bio}</p>
        </div>
      )}

      <div style={{ marginTop: '1.25rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Services</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {expert.services.map(s => <span key={s} style={{ background: '#f3f4f6', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem' }}>{s}</span>)}
        </div>
      </div>

      {expert.certifications.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Certifications</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {expert.certifications.map(c => <span key={c} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: 99, fontSize: '0.8rem' }}>{c}</span>)}
          </div>
        </div>
      )}

      {expert.reviews.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Reviews</h2>
          {expert.reviews.map(r => (
            <div key={r.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Stars rating={r.rating} />
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.body && <p style={{ fontSize: '0.85rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>{r.body}</p>}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <a href="/request" style={{ background: '#111', color: '#fff', padding: '0.75rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', display: 'inline-block' }}>
          Request {expert.name} →
        </a>
      </div>
    </div>
  );
}
