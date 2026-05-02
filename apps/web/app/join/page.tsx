'use client';
import { useState } from 'react';
import { api } from '../../lib/api';

const CATEGORIES = [
  { value: 'appliance_repair', label: 'Appliance Repair' },
  { value: 'event_booking', label: 'Event Venue Booking' },
  { value: 'parenting_logistics', label: 'Parenting Logistics' },
];

const SERVICES_BY_CATEGORY: Record<string, string[]> = {
  appliance_repair: ['Refrigerator', 'Washer', 'Dryer', 'Dishwasher', 'Oven/Stove', 'Microwave', 'Freezer', 'HVAC'],
  event_booking: ['Birthday parties', 'Baby showers', 'Corporate dinners', 'Private dining', 'Kids parties', 'Wedding receptions'],
  parenting_logistics: ['School pickup/drop-off', 'After-school care', 'Backup childcare', 'Activity transport', 'Daycare'],
};

const blank = { name: '', businessName: '', email: '', phone: '', category: 'appliance_repair', serviceArea: '', services: [] as string[], notes: '' };

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
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 560, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Application submitted!</h1>
        <p style={{ color: '#6b7280', lineHeight: 1.7 }}>We'll review your application and reach out within 1–2 business days. Welcome to the Local Butler Network.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to home</a>
      </div>
    );
  }

  const services = SERVICES_BY_CATEGORY[form.category] ?? [];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#111', maxWidth: 620, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <a href="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.85rem' }}>← Local Butler</a>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1rem', marginBottom: '0.25rem' }}>Apply as an expert</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>Get better-qualified leads, reduce back-and-forth, and build your local reputation. Founding experts join free.</p>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Your name *</label>
            <input style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }} value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Business name</label>
            <input style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }} value={form.businessName} onChange={set('businessName')} placeholder="Optional" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Email *</label>
            <input type="email" style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }} value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Phone *</label>
            <input type="tel" style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }} value={form.phone} onChange={set('phone')} required placeholder="+14155550100" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Category *</label>
          <select style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, services: [] }))}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Service area *</label>
          <input style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }} value={form.serviceArea} onChange={set('serviceArea')} required placeholder="e.g. San Mateo, Burlingame, Foster City" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Services you offer *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {services.map(s => (
              <button key={s} type="button" onClick={() => toggleService(s)} style={{
                padding: '4px 12px', borderRadius: 99, fontSize: '0.8rem', cursor: 'pointer',
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
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Anything else to share?</label>
          <textarea style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', minHeight: 80, boxSizing: 'border-box', resize: 'vertical' }} value={form.notes} onChange={set('notes')} placeholder="Certifications, years of experience, languages spoken..." />
        </div>

        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>By applying you agree to our service standards. We'll review your application and reach out within 1–2 business days.</p>

        <button type="submit" disabled={saving || form.services.length === 0} style={{ padding: '0.75rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
          {saving ? 'Submitting...' : 'Submit application →'}
        </button>
      </form>
    </div>
  );
}
