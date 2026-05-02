'use client';
import { useState } from 'react';
import { api } from '../../lib/api';

const SERVICES = [
  { id: 'restaurant',  icon: '🍽️', label: 'Restaurant' },
  { id: 'transport',   icon: '🚗', label: 'Transport' },
  { id: 'sightseeing', icon: '🗺️', label: 'Sightseeing' },
  { id: 'photography', icon: '📷', label: 'Photography' },
  { id: 'hotel',       icon: '🏨', label: 'Hotel Help' },
  { id: 'bar',         icon: '🍸', label: 'Bar / Nightlife' },
  { id: 'local_guide', icon: '🧭', label: 'Local Guide' },
  { id: 'family',      icon: '👨‍👧', label: 'Family Support' },
  { id: 'errand',      icon: '📦', label: 'Errands' },
  { id: 'emergency',   icon: '🆘', label: 'Emergency Help' },
];

const BUDGET_OPTIONS = [
  { value: 'budget',   label: 'Budget',    sub: 'Affordable picks' },
  { value: 'mid',      label: 'Mid-range', sub: 'Best value' },
  { value: 'luxury',   label: 'Luxury',    sub: 'Premium experience' },
];

type Route = 'pick' | 'delegation-form' | 'services-form';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db',
  borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box', background: '#fff', outline: 'none',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.78rem', fontWeight: 700,
  color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em',
};

export default function TravelPage() {
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
        startDate,
        endDate,
        numPeople,
        budget: intakeMode === 'full_delegation' ? budget : undefined,
        selectedServices: intakeMode === 'specific_services' ? selected : undefined,
        name: name.trim(),
        phone: phone.trim(),
      }) as { experienceId: string };
      window.location.href = `/travel/plan-preview/${result.experienceId}`;
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', minHeight: '100vh', background: '#fafafa' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <a href="/join" style={{ background: '#111', color: '#fff', padding: '0.4rem 0.9rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Join as expert</a>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Local Experience Butler</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>
          Tell us what you need and we'll connect you with trusted locals on the ground.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {/* ── Route picker ── */}
        {route === 'pick' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button onClick={() => setRoute('delegation-form')} style={{
              padding: '1.25rem 1.5rem', borderRadius: 12, border: '1px solid #e5e7eb',
              background: '#fff', cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 3 }}>✨ Plan everything for me</div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Tell us your destination and dates — we'll handle the full itinerary</div>
            </button>
            <button onClick={() => setRoute('services-form')} style={{
              padding: '1.25rem 1.5rem', borderRadius: 12, border: '1px solid #e5e7eb',
              background: '#fff', cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 3 }}>🎯 I need specific services</div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Pick exactly what you need help with</div>
            </button>
          </div>
        )}

        {/* ── Full Delegation Form ── */}
        {route === 'delegation-form' && (
          <>
            <button onClick={() => setRoute('pick')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.25rem', padding: 0 }}>
              ← Back
            </button>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={labelStyle}>Destination *</label>
                <input style={inputStyle} value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. San Francisco" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Arrival Date *</label>
                  <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Departure Date *</label>
                  <input type="date" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Number of Travelers *</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setNumPeople(n)} style={{
                      width: 42, height: 42, borderRadius: 8, border: numPeople === n ? '2px solid #111' : '1px solid #d1d5db',
                      background: numPeople === n ? '#111' : '#fff', color: numPeople === n ? '#fff' : '#374151',
                      fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                    }}>{n}</button>
                  ))}
                  <button type="button" onClick={() => setNumPeople(6)} style={{
                    padding: '0 0.75rem', height: 42, borderRadius: 8, border: numPeople === 6 ? '2px solid #111' : '1px solid #d1d5db',
                    background: numPeople === 6 ? '#111' : '#fff', color: numPeople === 6 ? '#fff' : '#374151',
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
                  }}>6+</button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Budget *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {BUDGET_OPTIONS.map(b => (
                    <button key={b.value} type="button" onClick={() => setBudget(b.value)} style={{
                      flex: 1, padding: '0.6rem', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                      border: budget === b.value ? '2px solid #111' : '1px solid #d1d5db',
                      background: budget === b.value ? '#111' : '#fff',
                      color: budget === b.value ? '#fff' : '#374151',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{b.label}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: 2 }}>{b.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Your Name *</label>
                  <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="First Last" />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp / Phone *</label>
                  <input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 415 000 0000" />
                </div>
              </div>

              <button onClick={() => submit('full_delegation')} disabled={submitting} style={{
                padding: '0.85rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8,
                fontWeight: 700, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1, marginTop: 4,
              }}>
                {submitting ? 'Building your plan...' : 'Generate my plan →'}
              </button>
            </div>
          </>
        )}

        {/* ── Specific Services Form ── */}
        {route === 'services-form' && (
          <>
            <button onClick={() => setRoute('pick')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.25rem', padding: 0 }}>
              ← Back
            </button>

            {/* Service tile selection */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem', marginBottom: '0.75rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>What do you need help with?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '0.45rem' }}>
                {SERVICES.map(s => (
                  <button key={s.id} type="button" onClick={() => toggleService(s.id)} style={{
                    padding: '0.55rem 0.7rem', borderRadius: 8, cursor: 'pointer',
                    border: selected.includes(s.id) ? '2px solid #111' : '1px solid #e5e7eb',
                    background: selected.includes(s.id) ? '#111' : '#fff',
                    color: selected.includes(s.id) ? '#fff' : '#374151',
                    fontSize: '0.83rem', fontWeight: selected.includes(s.id) ? 700 : 400,
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rest of form */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={labelStyle}>Destination *</label>
                <input style={inputStyle} value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. San Francisco" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Arrival Date *</label>
                  <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Departure Date *</label>
                  <input type="date" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Number of Travelers *</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setNumPeople(n)} style={{
                      width: 42, height: 42, borderRadius: 8, border: numPeople === n ? '2px solid #111' : '1px solid #d1d5db',
                      background: numPeople === n ? '#111' : '#fff', color: numPeople === n ? '#fff' : '#374151',
                      fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                    }}>{n}</button>
                  ))}
                  <button type="button" onClick={() => setNumPeople(6)} style={{
                    padding: '0 0.75rem', height: 42, borderRadius: 8, border: numPeople === 6 ? '2px solid #111' : '1px solid #d1d5db',
                    background: numPeople === 6 ? '#111' : '#fff', color: numPeople === 6 ? '#fff' : '#374151',
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
                  }}>6+</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Your Name *</label>
                  <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="First Last" />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp / Phone *</label>
                  <input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 415 000 0000" />
                </div>
              </div>

              <button
                onClick={() => submit('specific_services')}
                disabled={submitting || selected.length === 0}
                style={{
                  padding: '0.85rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8,
                  fontWeight: 700, fontSize: '1rem',
                  cursor: submitting || selected.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: submitting || selected.length === 0 ? 0.5 : 1, marginTop: 4,
                }}
              >
                {submitting ? 'Building your plan...' : `Build plan for ${selected.length} service${selected.length !== 1 ? 's' : ''} →`}
              </button>
            </div>
          </>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {['Vetted local experts', 'Bay Area coverage', 'No commitment to start'].map(t => (
            <span key={t} style={{ fontSize: '0.8rem', color: '#9ca3af' }}>✓ {t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
