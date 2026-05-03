'use client';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '../../lib/api';

// ── Design tokens ──────────────────────────────────────────────────────────────
const P = '#7C3AED';          // purple primary
const P_BG = 'rgba(124,58,237,0.07)';
const P_BORDER = 'rgba(124,58,237,0.35)';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const CARD_BG = '#FFFFFF';
const FIELD_BG = '#F3F4F6';

// ── Constants ──────────────────────────────────────────────────────────────────
const DESTINATIONS = [
  'Tokyo, Japan',
  'Paris, France',
  'Seoul, South Korea',
  'New York, USA',
  'Shanghai, China',
  'Los Angeles, USA',
  'Other',
];

const OCCASIONS = [
  { id: 'solo_travel',  label: 'Solo travel',           icon: '📷' },
  { id: 'couple',       label: 'Couple / Date',          icon: '🤍' },
  { id: 'proposal',     label: 'Proposal',               icon: '✨' },
  { id: 'birthday',     label: 'Birthday / Celebration', icon: '🎉' },
  { id: 'creator',      label: 'Creator / Content',      icon: '📸' },
  { id: 'business',     label: 'Business / Conference',  icon: '💼' },
  { id: 'friend_group', label: 'Friend group',           icon: '👥' },
];

const VIBES = [
  'Street editorial', 'Soft glam', 'Luxury / High fashion',
  'Cultural / Traditional', 'Neon / Nightlife', 'Natural / Lifestyle',
  'Cinematic', 'Editorial fashion',
];

const SERVICES = [
  { id: 'photography',        label: 'Photography' },
  { id: 'makeup',             label: 'Makeup' },
  { id: 'hair',               label: 'Hair styling' },
  { id: 'wardrobe_styling',   label: 'Wardrobe styling' },
  { id: 'cultural_outfit',    label: 'Kimono / yukata rental' },
  { id: 'creative_direction', label: 'Creative direction' },
  { id: 'photo_editing',      label: 'Photo editing' },
  { id: 'video_reel',         label: 'Video content' },
];

const BUDGET_OPTIONS = [
  { value: 'budget',  label: 'Essential',  range: '$300–$600' },
  { value: 'mid',     label: 'Signature',  range: '$600–$1,500' },
  { value: 'luxury',  label: 'Editorial',  range: '$1,500+' },
];

const STEP_TITLES = ['Trip details', 'Occasion & vibe', 'Services & budget', 'Contact info'];
const TOTAL = 4;

// ── Shared styles ──────────────────────────────────────────────────────────────
const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', background: FIELD_BG,
  border: '1.5px solid transparent', borderRadius: 10, fontSize: '0.93rem',
  color: TEXT, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  appearance: 'none' as const,
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.875rem', fontWeight: 600, color: TEXT, marginBottom: 6,
};
const sectionTitle: React.CSSProperties = {
  fontSize: '0.75rem', fontWeight: 700, color: MUTED,
  letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 10,
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function TravelPage() {
  const { userId } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — Trip details
  const [destination, setDestination] = useState('Tokyo, Japan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [flexibleDays, setFlexibleDays] = useState(false);
  const [hotelArea, setHotelArea] = useState('');
  const [travelers, setTravelers] = useState('1');

  // Step 2 — Occasion & vibe
  const [occasion, setOccasion] = useState('');
  const [vibes, setVibes] = useState<string[]>([]);
  const [inspiration, setInspiration] = useState('');

  // Step 3 — Services & budget
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState('mid');

  // Step 4 — Contact
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  function toggleArr(arr: string[], setArr: (v: string[]) => void, val: string) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  }

  function getDaysInRange(start: string, end: string): { key: string; label: string; short: string }[] {
    if (!start || !end) return [];
    const days: { key: string; label: string; short: string }[] = [];
    const cur = new Date(start + 'T00:00:00');
    const last = new Date(end + 'T00:00:00');
    while (cur <= last) {
      const key = cur.toISOString().slice(0, 10);
      const label = cur.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      const short = cur.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      days.push({ key, label, short });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }

  function buildEmptySlots(): string | undefined {
    if (flexibleDays) return 'flexible — any day works';
    if (selectedDays.length === 0) return undefined;
    return selectedDays.join(', ');
  }

  function validateStep(): string {
    if (step === 1) {
      if (!destination) return 'Please select a destination.';
      if (!startDate || !endDate) return 'Please enter your travel dates.';
      if (new Date(endDate) < new Date(startDate)) return 'Departure must be after arrival.';
    }
    if (step === 2) {
      if (!occasion) return 'Please select an occasion.';
    }
    if (step === 4) {
      if (!name.trim()) return 'Please enter your name.';
      if (!phone.trim()) return 'Please enter your phone number.';
    }
    return '';
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  }
  function prev() { setError(''); setStep(s => s - 1); }

  async function submit() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    try {
      const intakeMode = services.length > 0 ? 'specific_services' : 'full_delegation';
      const result = await api.travelIntake({
        intakeMode,
        destination,
        startDate, endDate,
        numPeople: parseInt(travelers),
        budget,
        selectedServices: services.length > 0 ? services : undefined,
        name: name.trim(),
        phone: phone.trim(),
        occasion,
        vibes,
        emptyTimeSlots: buildEmptySlots(),
        hotelArea: hotelArea.trim() || undefined,
        ...(userId ? { clerkUserId: userId } : {}),
      } as any) as { experienceId: string };
      window.location.href = `/travel/plan-preview/${result.experienceId}`;
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const pct = ((step - 1) / (TOTAL - 1)) * 100;

  return (
    <div style={{
      minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: TEXT,
      background: 'radial-gradient(ellipse at 20% 0%, #FDE8F0 0%, #FFF7ED 45%, #FFFBEA 100%)',
    }}>
      <style>{`
        select { -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px !important; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.5; }
        .occ-card:hover { border-color: ${P_BORDER} !important; }
        .svc-tile:hover { border-color: ${P_BORDER} !important; }
        .vibe-pill:hover { border-color: ${P} !important; color: ${P} !important; }
      `}</style>

      {/* Nav */}
      <nav style={{
        padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 10,
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', color: P, fontFamily: 'system-ui', letterSpacing: '-0.03em' }}>
          Local Butler
        </a>
        <a href="/expert" style={{ fontSize: '0.85rem', color: MUTED, textDecoration: 'none', fontWeight: 500 }}>
          Expert portal
        </a>
      </nav>

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>

        {/* Progress bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: P }}>Step {step} of {TOTAL}</span>
            <span style={{ fontSize: '0.8rem', color: MUTED }}>{STEP_TITLES[step - 1]}</span>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: 'rgba(124,58,237,0.12)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(to right, #7C3AED, #A855F7, #EC4899, #FB7185)',
              width: `${pct === 0 ? 8 : pct}%`,
              transition: 'width 0.35s ease',
            }} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA',
            padding: '0.7rem 1rem', borderRadius: 10, marginBottom: '1.25rem', fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {/* ── Step 1: Trip details ── */}
        {step === 1 && (
          <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER}`, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: P, margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
              Your destination shoot, planned
            </h2>
            <p style={{ color: MUTED, fontSize: '0.9rem', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
              Tell us your trip and empty time slots. AI designs the look, glam plan, shoot route, and expert lineup.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Destination *</label>
                <select style={fieldStyle} value={destination} onChange={e => setDestination(e.target.value)}>
                  {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Arrival date *</label>
                  <input type="date" style={fieldStyle} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Departure date *</label>
                  <input type="date" style={fieldStyle} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Which days work for your shoot?</label>
                {!startDate || !endDate ? (
                  <div style={{ padding: '0.85rem 1rem', background: FIELD_BG, borderRadius: 10, fontSize: '0.875rem', color: MUTED }}>
                    Enter your dates above to pick available days
                  </div>
                ) : (
                  <div>
                    {/* Flexible toggle */}
                    <button
                      type="button"
                      onClick={() => { setFlexibleDays(f => !f); setSelectedDays([]); }}
                      style={{
                        width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                        border: flexibleDays ? `1.5px solid ${P}` : `1.5px solid ${BORDER}`,
                        background: flexibleDays ? P_BG : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer', marginBottom: '0.5rem', transition: 'all 0.12s',
                      }}
                    >
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: flexibleDays ? P : TEXT }}>
                        🗓 I{"'"}m flexible — any day works
                      </span>
                      {flexibleDays && (
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                      )}
                    </button>
                    {/* Day pills */}
                    {!flexibleDays && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {getDaysInRange(startDate, endDate).map(d => (
                          <button
                            key={d.key}
                            type="button"
                            onClick={() => toggleArr(selectedDays, setSelectedDays, d.key)}
                            style={{
                              padding: '0.45rem 0.85rem', borderRadius: 99, fontSize: '0.82rem', cursor: 'pointer',
                              border: selectedDays.includes(d.key) ? `1.5px solid ${P}` : `1.5px solid ${BORDER}`,
                              background: selectedDays.includes(d.key) ? P : '#fff',
                              color: selectedDays.includes(d.key) ? '#fff' : TEXT,
                              fontWeight: selectedDays.includes(d.key) ? 600 : 400,
                              transition: 'all 0.12s',
                            }}
                          >
                            {d.short}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Hotel area / neighborhood</label>
                <input style={fieldStyle} value={hotelArea} onChange={e => setHotelArea(e.target.value)} placeholder="e.g. Shibuya, Ginza, Harajuku" />
              </div>

              <div>
                <label style={labelStyle}>Number of travelers *</label>
                <select style={fieldStyle} value={travelers} onChange={e => setTravelers(e.target.value)}>
                  {['1 person', '2 people', '3 people', '4 people', '5 people', '6+ people'].map((l, i) => (
                    <option key={i} value={String(i + 1)}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
              <button onClick={() => window.location.href = '/'} style={{
                flex: 1, padding: '0.85rem', borderRadius: 10, border: `1.5px solid ${BORDER}`,
                background: 'transparent', color: P, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={next} style={{
                flex: 2, padding: '0.85rem', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${P}, #A855F7)`, color: '#fff',
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              }}>Continue</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Occasion & Vibe ── */}
        {step === 2 && (
          <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER}`, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: P, margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
              {"What's the occasion?"}
            </h2>
            <p style={{ color: MUTED, fontSize: '0.9rem', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
              Help us understand the vibe and style you're going for
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={sectionTitle}>Occasion *</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                {OCCASIONS.map(o => (
                  <button key={o.id} className="occ-card" type="button" onClick={() => setOccasion(o.id)} style={{
                    padding: '1rem 0.75rem', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    border: occasion === o.id ? `1.5px solid ${P}` : `1.5px solid ${BORDER}`,
                    background: occasion === o.id ? P_BG : '#fff',
                    display: 'flex', flexDirection: 'column', gap: 6, transition: 'all 0.12s',
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>{o.icon}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: occasion === o.id ? P : TEXT, lineHeight: 1.3 }}>{o.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={sectionTitle}>Desired vibe * (select all that apply)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {VIBES.map(v => (
                  <button key={v} className="vibe-pill" type="button" onClick={() => toggleArr(vibes, setVibes, v)} style={{
                    padding: '0.45rem 1rem', borderRadius: 99, fontSize: '0.85rem', cursor: 'pointer',
                    border: vibes.includes(v) ? `1.5px solid ${P}` : `1.5px solid ${BORDER}`,
                    background: vibes.includes(v) ? P : '#fff',
                    color: vibes.includes(v) ? '#fff' : TEXT,
                    fontWeight: vibes.includes(v) ? 600 : 400, transition: 'all 0.12s',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {vibes.includes(v) && <span style={{ fontSize: '0.7rem' }}>✓</span>}
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Inspiration links <span style={{ fontWeight: 400, color: MUTED }}>(optional)</span></label>
              <textarea
                style={{ ...fieldStyle, minHeight: 80, resize: 'vertical' }}
                value={inspiration}
                onChange={e => setInspiration(e.target.value)}
                placeholder="Pinterest boards, Instagram posts, or reference photos"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={prev} style={{
                flex: 1, padding: '0.85rem', borderRadius: 10, border: `1.5px solid ${BORDER}`,
                background: 'transparent', color: P, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
              }}>Previous</button>
              <button onClick={next} style={{
                flex: 2, padding: '0.85rem', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${P}, #A855F7)`, color: '#fff',
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              }}>Continue</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Services & Budget ── */}
        {step === 3 && (
          <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER}`, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: P, margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
              Services & budget
            </h2>
            <p style={{ color: MUTED, fontSize: '0.9rem', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
              Select the services you need and your budget range
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={sectionTitle}>Services needed * (select all that apply)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                {SERVICES.map(s => (
                  <button key={s.id} className="svc-tile" type="button" onClick={() => toggleArr(services, setServices, s.id)} style={{
                    padding: '0.85rem 1rem', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    border: services.includes(s.id) ? `1.5px solid ${P}` : `1.5px solid ${BORDER}`,
                    background: services.includes(s.id) ? P_BG : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.12s',
                  }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: services.includes(s.id) ? 600 : 400, color: services.includes(s.id) ? P : TEXT }}>
                      {s.label}
                    </span>
                    {services.includes(s.id) && (
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={sectionTitle}>Budget range *</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.55rem' }}>
                {BUDGET_OPTIONS.map(b => (
                  <button key={b.value} type="button" onClick={() => setBudget(b.value)} style={{
                    padding: '1rem 0.75rem', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    border: budget === b.value ? `1.5px solid ${P}` : `1.5px solid ${BORDER}`,
                    background: budget === b.value ? P_BG : '#fff',
                    transition: 'all 0.12s',
                  }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: budget === b.value ? P : TEXT, marginBottom: 3 }}>{b.label}</div>
                    <div style={{ fontSize: '0.78rem', color: MUTED }}>{b.range}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={prev} style={{
                flex: 1, padding: '0.85rem', borderRadius: 10, border: `1.5px solid ${BORDER}`,
                background: 'transparent', color: P, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
              }}>Previous</button>
              <button onClick={next} style={{
                flex: 2, padding: '0.85rem', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${P}, #A855F7)`, color: '#fff',
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              }}>Continue</button>
            </div>
          </div>
        )}

        {/* ── Step 4: Contact ── */}
        {step === 4 && (
          <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER}`, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: P, margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
              Almost there
            </h2>
            <p style={{ color: MUTED, fontSize: '0.9rem', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
              {"We'll send your personalized shoot plan to this contact"}
            </p>

            {/* Summary */}
            <div style={{ background: P_BG, border: `1px solid ${P_BORDER}`, borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: TEXT, lineHeight: 1.7 }}>
              <strong style={{ color: P }}>{destination}</strong>
              {startDate && endDate && <> · {startDate} – {endDate}</>}
              {occasion && <> · {OCCASIONS.find(o => o.id === occasion)?.label}</>}
              {vibes.length > 0 && <> · {vibes.slice(0, 2).join(', ')}{vibes.length > 2 ? ` +${vibes.length - 2}` : ''}</>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={labelStyle}>Your name *</label>
                <input style={fieldStyle} value={name} onChange={e => setName(e.target.value)} placeholder="First Last" />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp / Phone *</label>
                <input type="tel" style={fieldStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 415 000 0000" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button onClick={prev} style={{
                flex: 1, padding: '0.85rem', borderRadius: 10, border: `1.5px solid ${BORDER}`,
                background: 'transparent', color: P, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
              }}>Previous</button>
              <button onClick={submit} disabled={submitting} style={{
                flex: 2, padding: '0.85rem', borderRadius: 10, border: 'none',
                background: submitting ? '#A78BFA' : `linear-gradient(135deg, ${P}, #A855F7)`,
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}>
                {submitting ? 'Building your plan...' : 'Generate my shoot plan →'}
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: MUTED, marginTop: '1rem' }}>
              Free to submit · No commitment required
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
