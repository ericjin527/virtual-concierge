'use client';
import { useState } from 'react';
import { api } from '../../lib/api';

const CATEGORIES = [
  { value: 'driver',            label: '🚗 Driver / Transportation' },
  { value: 'restaurant_expert', label: '🍽️ Restaurant & Dining Expert' },
  { value: 'local_guide',       label: '🗺️ Local Guide' },
  { value: 'photographer',      label: '📷 Photographer / Videographer' },
  { value: 'errand_helper',     label: '📦 Errand Helper' },
  { value: 'private_chef',      label: '👨‍🍳 Private Chef / Caterer' },
  { value: 'family_helper',     label: '👨‍👧 Family & Childcare Support' },
  { value: 'party_helper',      label: '🎉 Event & Party Helper' },
  { value: 'florist',           label: '💐 Florist / Decorator' },
  { value: 'cleaner',           label: '🧹 Cleaning Professional' },
];

const SERVICES_BY_CATEGORY: Record<string, string[]> = {
  driver: ['Airport pickups', 'City transfers', 'Day hire', 'Event transport', 'Business travel'],
  restaurant_expert: ['Reservation sourcing', 'Private dining', 'Group bookings', 'Pop-up dinners', 'Chef table access'],
  local_guide: ['City tours', 'Neighborhood walks', 'Food tours', 'Cultural experiences', 'Hidden gems'],
  photographer: ['Event photography', 'Portrait sessions', 'Travel photography', 'Video coverage', 'Drone footage'],
  errand_helper: ['Grocery runs', 'Dry cleaning', 'Gift sourcing', 'Printing & shipping', 'Pharmacy runs'],
  private_chef: ['In-home dinners', 'Meal prep', 'Event catering', 'Breakfast service', 'Dietary-specific menus'],
  family_helper: ['School pickup', 'Childcare assistance', 'Activity coordination', 'Babysitting', 'Family logistics'],
  party_helper: ['Setup & cleanup', 'Day-of coordination', 'Styling & decor', 'Guest management', 'Venue prep'],
  florist: ['Event arrangements', 'Table florals', 'Gift bouquets', 'Home styling', 'Seasonal decor'],
  cleaner: ['Home cleaning', 'Post-event cleanup', 'Deep cleaning', 'Laundry & linen', 'Move-in/out cleaning'],
};

const blank = { name: '', businessName: '', email: '', phone: '', category: 'driver', serviceArea: '', services: [] as string[], notes: '' };

export default function JoinPage() {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function toggleService(s: string) {
    setForm(f => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.submitVendorApplication(form);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally { setSaving(false); }
  }

  if (done) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 520, margin: '5rem auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Application submitted!</h1>
        <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          We review every application personally. We&apos;ll be in touch within 1–2 business days. Welcome to the Local Butler Network.
        </p>
        <a href="/" style={{ display: 'inline-block', color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to home</a>
      </div>
    );
  }

  const services = SERVICES_BY_CATEGORY[form.category] ?? [];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#111', maxWidth: 640, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <a href="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.85rem' }}>← Local Butler</a>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1rem', marginBottom: '0.25rem' }}>Apply as a local expert</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>
        Get matched with high-intent local customers. Every request comes with a clear brief — no random back-and-forth. Founding experts join free.
      </p>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Your name *</label>
            <input style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }} value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Business name</label>
            <input style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }} value={form.businessName} onChange={set('businessName')} placeholder="Optional" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Email *</label>
            <input type="email" style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }} value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Phone *</label>
            <input type="tel" style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }} value={form.phone} onChange={set('phone')} required placeholder="+14155550100" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Your expertise *</label>
          <select style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, services: [] }))}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Service area *</label>
          <input style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }} value={form.serviceArea} onChange={set('serviceArea')} required placeholder="e.g. San Francisco, Peninsula, South Bay" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Services you offer *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {services.map(s => (
              <button key={s} type="button" onClick={() => toggleService(s)} style={{
                padding: '5px 12px', borderRadius: 99, fontSize: '0.82rem', cursor: 'pointer',
                background: form.services.includes(s) ? '#111' : '#f3f4f6',
                color: form.services.includes(s) ? '#fff' : '#374151',
                border: form.services.includes(s) ? '1px solid #111' : '1px solid #d1d5db',
              }}>
                {form.services.includes(s) ? '✓ ' : ''}{s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Tell us about yourself</label>
          <textarea style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', minHeight: 90, boxSizing: 'border-box', resize: 'vertical' }} value={form.notes} onChange={set('notes')} placeholder="Years of experience, certifications, languages spoken, anything relevant..." />
        </div>

        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>By applying you agree to our service standards. We review every application and respond within 1–2 business days.</p>

        <button type="submit" disabled={saving || form.services.length === 0} style={{ padding: '0.8rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '1rem', cursor: saving || form.services.length === 0 ? 'not-allowed' : 'pointer', opacity: form.services.length === 0 ? 0.5 : 1 }}>
          {saving ? 'Submitting...' : 'Submit application →'}
        </button>
      </form>
    </div>
  );
}
