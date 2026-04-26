'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { s } from '../../../../lib/styles';

export default function NewBusinessPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', publicPhone: '', ownerPhone: '', address: '',
    timezone: 'America/Los_Angeles', primaryLanguage: 'en',
    secondaryLanguage: 'zh', tonePreset: 'warm', clerkOwnerId: 'owner-placeholder',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const business = await api.createBusiness(form) as { id: string };
      // Store in localStorage for list page
      const stored = JSON.parse(localStorage.getItem('vc_businesses') ?? '[]');
      localStorage.setItem('vc_businesses', JSON.stringify([...stored, { ...form, id: business.id, active: true }]));
      router.push(`/dashboard/businesses/${business.id}/services`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create business');
      setSaving(false);
    }
  }

  return (
    <div style={s.page}>
      <a href="/dashboard/businesses" style={s.backLink}>← Businesses</a>
      <h1 style={s.h1}>New Spa Business</h1>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

      <form onSubmit={submit}>
        <div style={{ ...s.card }}>
          <h2 style={s.h2}>Business Profile</h2>
          <div style={s.grid2}>
            <div style={s.formGroup}>
              <label style={s.label}>Spa Name *</label>
              <input style={s.input} value={form.name} onChange={set('name')} required placeholder="Lotus Spa" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Public Phone *</label>
              <input style={s.input} value={form.publicPhone} onChange={set('publicPhone')} required placeholder="+14155550100" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Owner Phone (for SMS alerts) *</label>
              <input style={s.input} value={form.ownerPhone} onChange={set('ownerPhone')} required placeholder="+14155550101" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Address</label>
              <input style={s.input} value={form.address} onChange={set('address')} placeholder="123 Main St, San Francisco CA" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Timezone</label>
              <select style={{ ...s.select, width: '100%' }} value={form.timezone} onChange={set('timezone')}>
                <option value="America/Los_Angeles">Pacific (LA)</option>
                <option value="America/New_York">Eastern (NY)</option>
                <option value="America/Chicago">Central (Chicago)</option>
                <option value="America/Denver">Mountain (Denver)</option>
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Tone Preset</label>
              <select style={{ ...s.select, width: '100%' }} value={form.tonePreset} onChange={set('tonePreset')}>
                <option value="warm">Warm</option>
                <option value="premium">Premium</option>
                <option value="efficient">Efficient</option>
                <option value="bilingual">Bilingual</option>
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Primary Language</label>
              <select style={{ ...s.select, width: '100%' }} value={form.primaryLanguage} onChange={set('primaryLanguage')}>
                <option value="en">English</option>
                <option value="zh">Chinese (Mandarin)</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Secondary Language</label>
              <select style={{ ...s.select, width: '100%' }} value={form.secondaryLanguage} onChange={set('secondaryLanguage')}>
                <option value="">None</option>
                <option value="zh">Chinese (Mandarin)</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>
        </div>

        <div style={s.row}>
          <button type="submit" style={s.btnPrimary} disabled={saving}>
            {saving ? 'Creating...' : 'Create Business →'}
          </button>
          <button type="button" style={s.btnSecondary} onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
