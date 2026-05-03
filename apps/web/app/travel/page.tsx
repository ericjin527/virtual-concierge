'use client';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '../../lib/api';

const SERVICES = [
  { id: 'photography',       icon: '📷', label: 'Photography' },
  { id: 'makeup',            icon: '💄', label: 'Makeup' },
  { id: 'hair',              icon: '💇', label: 'Hair Styling' },
  { id: 'wardrobe_styling',  icon: '👗', label: 'Wardrobe Styling' },
  { id: 'cultural_outfit',   icon: '👘', label: 'Kimono / Outfit Rental' },
  { id: 'creative_direction',icon: '🎨', label: 'Creative Direction' },
  { id: 'photo_editing',     icon: '🖼️', label: 'Photo Editing' },
  { id: 'video_reel',        icon: '🎬', label: 'Video Reel' },
  { id: 'location_scouting', icon: '📍', label: 'Location Scouting' },
  { id: 'transport',         icon: '🚗', label: 'Transport' },
];

const BUDGET_OPTIONS = [
  { value: 'budget',  label: 'Essential',  sub: '$300–$600' },
  { value: 'mid',     label: 'Signature',  sub: '$600–$1,500' },
  { value: 'luxury',  label: 'Editorial',  sub: '$1,500+' },
];

const A = '#1a1714';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`,
  borderRadius: 9, fontSize: '0.9rem', boxSizing: 'border-box',
  background: '#fff', outline: 'none', color: A, fontFamily: 'system-ui, sans-serif',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 700,
  color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em',
};

type Route = 'pick' | 'delegation-form' | 'services-form';

export default function TravelPage() {
  const { userId } = useAuth();
  const [route, setRoute] = useState<Route>('pick');
  const [selected, setSelected] = useState<string[]>([]);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numPeople, setNumPeople] = useState(2);
  const [budget, setBudget] = useState('mid');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function toggleService(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function submit(intakeMode: 'full_delegation' | 'specific_services') {
    setError('');
    if (!destination.trim()) return setError('Please enter a destination.');
    if (!startDate || !endDate) return setError('Please enter your travel dates.');
    if (new Date(endDate) < new Date(startDate)) return setError('End date must be after start date.');
    if (!name.trim()) return setError('Please enter your name.');
    if (!phone.trim()) return setError('Please enter your phone number.');
    if (intakeMode === 'specific_services' && selected.length === 0)
      return setError('Please select at least one service.');

    setSubmitting(true);
    try {
      const result = await api.travelIntake({
        intakeMode,
        destination: destination.trim(),
        startDate, endDate, numPeople,
        budget: intakeMode === 'full_delegation' ? budget : undefined,
        selectedServices: intakeMode === 'specific_services' ? selected : undefined,
        name: name.trim(),
        phone: phone.trim(),
        ...(userId ? { clerkUserId: userId } : {}),
      }) as { experienceId: string };
      window.location.href = `/travel/plan-preview/${result.experienceId}`;
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const commonFields = (mode: 'full_delegation' | 'specific_services') => (
    <>
      <div>
        <label style={labelStyle}>Destination *</label>
        <input style={inputStyle} value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Tokyo, Paris, New York" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Arrival date *</label>
          <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Departure date *</label>
          <input type="date" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Travelers *</label>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => setNumPeople(n)} style={{
              width: 44, height: 44, borderRadius: 9,
              border: numPeople === n ? `2px solid ${A}` : `1px solid ${BORDER}`,
              background: numPeople === n ? A : '#fff',
              color: numPeople === n ? '#fff' : A,
              fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
            }}>{n}</button>
          ))}
          <button type="button" onClick={() => setNumPeople(6)} style={{
            padding: '0 0.85rem', height: 44, borderRadius: 9,
            border: numPeople === 6 ? `2px solid ${A}` : `1px solid ${BORDER}`,
            background: numPeople === 6 ? A : '#fff',
            color: numPeople === 6 ? '#fff' : A,
            fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
          }}>6+</button>
        </div>
      </div>

      {mode === 'full_delegation' && (
        <div>
          <label style={labelStyle}>Budget *</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {BUDGET_OPTIONS.map(b => (
              <button key={b.value} type="button" onClick={() => setBudget(b.value)} style={{
                flex: 1, padding: '0.65rem 0.5rem', borderRadius: 9, cursor: 'pointer', textAlign: 'center',
                border: budget === b.value ? `2px solid ${A}` : `1px solid ${BORDER}`,
                background: budget === b.value ? A : '#fff',
                color: budget === b.value ? '#fff' : A,
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{b.label}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.65, marginTop: 2 }}>{b.sub}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Your name *</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="First Last" />
        </div>
        <div>
          <label style={labelStyle}>WhatsApp / Phone *</label>
          <input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 415 000 0000" />
        </div>
      </div>

      <button
        onClick={() => submit(mode)}
        disabled={submitting || (mode === 'specific_services' && selected.length === 0)}
        style={{
          padding: '0.9rem', background: A, color: '#fff', border: 'none', borderRadius: 9,
          fontWeight: 700, fontSize: '0.95rem',
          cursor: (submitting || (mode === 'specific_services' && selected.length === 0)) ? 'not-allowed' : 'pointer',
          opacity: (submitting || (mode === 'specific_services' && selected.length === 0)) ? 0.5 : 1,
          marginTop: 4,
        }}
      >
        {submitting ? 'Building your plan...' : mode === 'full_delegation' ? 'Generate my plan →' : `Build plan for ${selected.length || 0} service${selected.length !== 1 ? 's' : ''} →`}
      </button>
    </>
  );

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: A, minHeight: '100vh', background: '#faf9f6' }}>

      {/* Nav */}
      <nav style={{
        borderBottom: `1px solid ${BORDER}`, padding: '1rem 2.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff',
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', color: A, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
          Local Butler
        </a>
        <a href="/expert" style={{
          background: A, color: '#fff', padding: '0.4rem 1rem',
          borderRadius: 8, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
        }}>
          For experts
        </a>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: 9, marginBottom: '1.25rem', fontSize: '0.86rem' }}>
            {error}
          </div>
        )}

        {/* ── Route picker ── */}
        {route === 'pick' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: A, letterSpacing: '-0.025em', fontFamily: 'Georgia, serif', margin: '0 0 0.6rem' }}>
                Your destination shoot, planned
              </h1>
              <p style={{ color: MUTED, fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                Tell us your trip and empty time slots. AI designs the look, glam plan, shoot route, and expert lineup.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => setRoute('delegation-form')} style={{
                padding: '1.5rem', borderRadius: 12, border: `1px solid ${BORDER}`,
                background: '#fff', cursor: 'pointer', textAlign: 'left',
                transition: 'border-color 0.15s',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: A, marginBottom: 4, fontFamily: 'Georgia, serif' }}>
                  Design my full shoot experience
                </div>
                <div style={{ color: MUTED, fontSize: '0.84rem', lineHeight: 1.6 }}>
                  Tell us your destination, dates, and occasion — AI builds your complete glam + shoot plan
                </div>
              </button>

              <button onClick={() => setRoute('services-form')} style={{
                padding: '1.5rem', borderRadius: 12, border: `1px solid ${BORDER}`,
                background: '#fff', cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: A, marginBottom: 4, fontFamily: 'Georgia, serif' }}>
                  I know what I need
                </div>
                <div style={{ color: MUTED, fontSize: '0.84rem', lineHeight: 1.6 }}>
                  Select specific services — photographer, makeup, hair, styling, kimono rental, and more
                </div>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
              {['Vetted local experts', 'Tokyo & beyond', 'No commitment required'].map(t => (
                <span key={t} style={{ fontSize: '0.76rem', color: FAINT }}>✓ {t}</span>
              ))}
            </div>
          </>
        )}

        {/* ── Full Delegation Form ── */}
        {route === 'delegation-form' && (
          <>
            <button onClick={() => setRoute('pick')} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '0.84rem', marginBottom: '1.5rem', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              ← Back
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: A, letterSpacing: '-0.02em', fontFamily: 'Georgia, serif', margin: '0 0 1.5rem' }}>
              Design my full shoot experience
            </h2>
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {commonFields('full_delegation')}
            </div>
          </>
        )}

        {/* ── Specific Services Form ── */}
        {route === 'services-form' && (
          <>
            <button onClick={() => setRoute('pick')} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '0.84rem', marginBottom: '1.5rem', padding: 0 }}>
              ← Back
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: A, letterSpacing: '-0.02em', fontFamily: 'Georgia, serif', margin: '0 0 1rem' }}>
              Select your services
            </h2>

            {/* Service tiles */}
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.25rem', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: FAINT, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                Which services do you need?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.45rem' }}>
                {SERVICES.map(s => (
                  <button key={s.id} type="button" onClick={() => toggleService(s.id)} style={{
                    padding: '0.6rem 0.75rem', borderRadius: 9, cursor: 'pointer',
                    border: selected.includes(s.id) ? `2px solid ${A}` : `1px solid ${BORDER}`,
                    background: selected.includes(s.id) ? A : '#fff',
                    color: selected.includes(s.id) ? '#fff' : A,
                    fontSize: '0.82rem', fontWeight: selected.includes(s.id) ? 600 : 400,
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.45rem',
                  }}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {commonFields('specific_services')}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
