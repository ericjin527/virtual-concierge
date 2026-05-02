'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExpertApi } from '../../../lib/expert-api';

const CATEGORIES = [
  { value: 'restaurant_expert', label: '🍽️ Restaurant & Dining' },
  { value: 'driver',            label: '🚗 Driver / Transport' },
  { value: 'local_guide',       label: '🗺️ Local Guide' },
  { value: 'photographer',      label: '📷 Photography' },
  { value: 'errand_helper',     label: '📦 Errand Helper' },
  { value: 'private_chef',      label: '👨‍🍳 Private Chef' },
  { value: 'family_helper',     label: '👨‍👧 Family Support' },
  { value: 'party_helper',      label: '🎉 Event Help' },
  { value: 'florist',           label: '💐 Florist' },
  { value: 'cleaner',           label: '🧹 Cleaning' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db',
  borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none',
};

export default function ExpertOnboardingPage() {
  const router = useRouter();
  const expertApi = useExpertApi();

  const [form, setForm] = useState({
    name: '', phone: '', bio: '', photoUrl: '',
    categories: [] as string[], cities: [] as string[],
    cityInput: '', languages: ['en'],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleCategory(val: string) {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(val) ? f.categories.filter(c => c !== val) : [...f.categories, val],
    }));
  }

  function addCity() {
    const city = form.cityInput.trim();
    if (city && !form.cities.includes(city)) {
      setForm(f => ({ ...f, cities: [...f.cities, city], cityInput: '' }));
    }
  }

  async function save() {
    setError('');
    if (!form.name.trim()) return setError('Name is required.');
    if (!form.phone.trim()) return setError('Phone is required.');
    if (form.categories.length === 0) return setError('Select at least one category.');
    if (form.cities.length === 0) return setError('Add at least one city you serve.');

    setSaving(true);
    try {
      await expertApi.updateMyProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim() || undefined,
        photoUrl: form.photoUrl.trim() || undefined,
        categories: form.categories,
        cities: form.cities,
        languages: form.languages,
      });
      router.push('/expert/dashboard');
    } catch (e: any) {
      setError(e.message ?? 'Failed to save profile.');
      setSaving(false);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#111', minHeight: '100vh', background: '#fafafa' }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '0.85rem 1.5rem', background: '#fff', fontWeight: 800, fontSize: '1rem' }}>
        Local Butler — Expert Setup
      </nav>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Set up your expert profile</h1>
          <p style={{ color: '#6b7280', margin: '0.3rem 0 0', fontSize: '0.88rem' }}>This is shown to travelers when you claim a task.</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.88rem' }}>{error}</div>}

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Full Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>WhatsApp / Phone *</label>
              <input type="tel" style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 415 000 0000" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Bio</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell travelers about your expertise, years of experience, what makes you great..." />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Photo URL</label>
            <input style={inputStyle} value={form.photoUrl} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))} placeholder="https://..." />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Expertise * <span style={{ color: '#6b7280', fontWeight: 400 }}>(select all that apply)</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {CATEGORIES.map(c => (
                <button key={c.value} type="button" onClick={() => toggleCategory(c.value)} style={{
                  padding: '5px 12px', borderRadius: 99, fontSize: '0.82rem', cursor: 'pointer',
                  background: form.categories.includes(c.value) ? '#111' : '#f3f4f6',
                  color: form.categories.includes(c.value) ? '#fff' : '#374151',
                  border: form.categories.includes(c.value) ? '1px solid #111' : '1px solid #d1d5db',
                }}>{c.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>Cities You Serve *</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={form.cityInput} onChange={e => setForm(f => ({ ...f, cityInput: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addCity()} placeholder="e.g. San Francisco" />
              <button type="button" onClick={addCity} style={{ padding: '0.6rem 0.9rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>Add</button>
            </div>
            {form.cities.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {form.cities.map(c => (
                  <span key={c} style={{ background: '#111', color: '#fff', padding: '2px 10px', borderRadius: 99, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {c}
                    <button onClick={() => setForm(f => ({ ...f, cities: f.cities.filter(x => x !== c) }))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: '0.75rem' }}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button onClick={save} disabled={saving} style={{
          padding: '0.85rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8,
          fontWeight: 700, fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving...' : 'Save profile & continue →'}
        </button>
      </div>
    </div>
  );
}
