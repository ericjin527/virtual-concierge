'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { s } from '../../../../lib/styles';

interface Business {
  id: string; name: string; publicPhone: string; ownerPhone: string;
  address: string; timezone: string; primaryLanguage: string;
  secondaryLanguage: string; tonePreset: string;
}

export default function EditBusinessPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Business | null>(null);

  useEffect(() => {
    (api.getBusiness(id) as Promise<Business>)
      .then(b => setForm(b))
      .catch(() => setError('Failed to load business'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => f ? { ...f, [k]: e.target.value } : f);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true); setError('');
    try {
      await api.updateBusiness(id, form);
      router.push('/dashboard/businesses');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  }

  if (loading) return <div style={s.page}><p>Loading...</p></div>;
  if (!form) return <div style={s.page}><p style={{ color: '#b91c1c' }}>{error}</p></div>;

  return (
    <div style={s.page}>
      <a href="/dashboard/businesses" style={s.backLink}>← Businesses</a>
      <h1 style={s.h1}>Edit Business</h1>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

      <form onSubmit={submit}>
        <div style={s.card}>
          <h2 style={s.h2}>Business Profile</h2>
          <div style={s.grid2}>
            <div style={s.formGroup}>
              <label style={s.label}>Spa Name *</label>
              <input style={s.input} value={form.name} onChange={set('name')} required />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Public Phone *</label>
              <input style={s.input} value={form.publicPhone} onChange={set('publicPhone')} required placeholder="+14155550100" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Owner Phone (SMS alerts) *</label>
              <input style={s.input} value={form.ownerPhone} onChange={set('ownerPhone')} required placeholder="+14155550101" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Address</label>
              <input style={s.input} value={form.address ?? ''} onChange={set('address')} />
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
              <select style={{ ...s.select, width: '100%' }} value={form.secondaryLanguage ?? ''} onChange={set('secondaryLanguage')}>
                <option value="">None</option>
                <option value="zh">Chinese (Mandarin)</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>
        </div>

        <div style={s.row}>
          <button type="submit" style={s.btnPrimary} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" style={s.btnSecondary} onClick={() => router.push('/dashboard/businesses')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
