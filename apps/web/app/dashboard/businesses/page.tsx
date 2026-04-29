'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { s } from '../../../lib/styles';

const WIDGET_URL = process.env.NEXT_PUBLIC_WIDGET_URL ?? 'http://localhost:3001';

interface Business { id: string; name: string; publicPhone: string; primaryLanguage: string; tonePreset: string; active: boolean }

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // For MVP, list is stored in localStorage until we add a list endpoint
    const stored = JSON.parse(localStorage.getItem('vc_businesses') ?? '[]');
    setBusinesses(stored);
    setLoading(false);
  }, []);

  if (loading) return <div style={s.page}><p>Loading...</p></div>;

  return (
    <div style={s.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ ...s.h1, marginBottom: 0 }}>Businesses</h1>
        <button style={s.btnPrimary} onClick={() => router.push('/dashboard/businesses/new')}>+ New Business</button>
      </div>

      {businesses.length === 0 && (
        <div style={{ ...s.card, textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>
          <p style={{ marginBottom: '1rem' }}>No businesses yet.</p>
          <button style={s.btnPrimary} onClick={() => router.push('/dashboard/businesses/new')}>Create your first spa</button>
        </div>
      )}

      {businesses.map((b) => (
        <div key={b.id} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>{b.name}</div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 4 }}>{b.publicPhone} · {b.primaryLanguage.toUpperCase()} · {b.tonePreset}</div>
            </div>
            <div style={s.row}>
              <a href={`/dashboard/businesses/${b.id}/booking-requests`} style={{ ...s.link, fontWeight: 600 }}>Bookings</a>
              <a href={`/dashboard/businesses/${b.id}/services`} style={s.link}>Services</a>
              <a href={`/dashboard/businesses/${b.id}/therapists`} style={s.link}>Therapists</a>
              <a href={`/dashboard/businesses/${b.id}/rooms`} style={s.link}>Rooms</a>
              <a href={`/dashboard/businesses/${b.id}/policy`} style={s.link}>Policy</a>
              <a href={`/dashboard/businesses/${b.id}`} style={s.link}>Edit</a>
            </div>
          </div>
          <details style={{ marginTop: '0.75rem' }}>
            <summary style={{ fontSize: '0.8rem', color: '#6b7280', cursor: 'pointer' }}>Embed chat widget</summary>
            <pre style={{ marginTop: 8, padding: '0.65rem', background: '#f9fafb', borderRadius: 6, fontSize: '0.75rem', overflowX: 'auto', border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
{`<iframe src="${WIDGET_URL}/?b=${b.id}" style="position:fixed;bottom:0;right:0;width:400px;height:640px;border:none;z-index:9999" allow="microphone"></iframe>`}
            </pre>
          </details>
        </div>
      ))}
    </div>
  );
}
