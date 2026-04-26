'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../../lib/api';
import { s } from '../../../../../lib/styles';

interface Service { id: string; name: string; category: string }
interface Skill { id: string; service: Service }
interface Therapist { id: string; name: string; languages: string[]; gender?: string; active: boolean; skills: Skill[] }

const blank = { name: '', languages: 'en', gender: '' };

export default function TherapistsPage() {
  const { id: businessId } = useParams<{ id: string }>();
  const router = useRouter();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [businessId]);

  async function load() {
    const [t, sv] = await Promise.all([
      api.getTherapists(businessId).catch(() => []),
      api.getServices(businessId).catch(() => []),
    ]);
    setTherapists(t as Therapist[]);
    setServices(sv as Service[]);
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.createTherapist(businessId, {
        ...form,
        languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
      });
      setForm(blank);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  }

  async function toggleSkill(therapistId: string, serviceId: string, hasSkill: boolean) {
    if (hasSkill) {
      await api.removeSkill(businessId, therapistId, serviceId);
    } else {
      await api.assignSkill(businessId, therapistId, serviceId);
    }
    await load();
  }

  return (
    <div style={s.page}>
      <a href={`/dashboard/businesses/${businessId}/services`} style={s.backLink}>← Services</a>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ ...s.h1, marginBottom: 0 }}>Therapists</h1>
        <a href="/dashboard/businesses" style={{ ...s.btnPrimary, textDecoration: 'none', display: 'inline-block' } as React.CSSProperties}>
          Done ✓
        </a>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem' }}>{error}</div>}

      {/* Add form */}
      <div style={s.card}>
        <h2 style={s.h2}>Add Therapist</h2>
        <form onSubmit={submit}>
          <div style={s.grid2}>
            <div style={s.formGroup}>
              <label style={s.label}>Name *</label>
              <input style={s.input} value={form.name} onChange={set('name')} required placeholder="Sarah Chen" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Gender (optional)</label>
              <select style={{ ...s.select, width: '100%' }} value={form.gender} onChange={set('gender')}>
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="nonbinary">Non-binary</option>
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Languages (comma-separated)</label>
              <input style={s.input} value={form.languages} onChange={set('languages')} placeholder="en, zh" />
            </div>
          </div>
          <button type="submit" style={s.btnPrimary} disabled={saving}>{saving ? 'Adding...' : 'Add Therapist'}</button>
        </form>
      </div>

      {/* Therapist list with skill assignment */}
      {therapists.filter(t => t.active).map(t => (
        <div key={t.id} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontWeight: 600 }}>{t.name}</div>
            <a href={`/dashboard/businesses/${businessId}/therapists/${t.id}/shifts`} style={s.link}>Shifts →</a>
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: 10 }}>
            {t.languages.join(', ')} {t.gender ? `· ${t.gender}` : ''}
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Services this therapist can perform:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {services.map(svc => {
              const has = t.skills.some(sk => sk.service.id === svc.id);
              return (
                <button
                  key={svc.id}
                  onClick={() => toggleSkill(t.id, svc.id, has)}
                  style={{
                    padding: '4px 12px', borderRadius: 99, fontSize: '0.8rem', cursor: 'pointer',
                    background: has ? '#dcfce7' : '#f3f4f6',
                    color: has ? '#166534' : '#374151',
                    border: has ? '1px solid #86efac' : '1px solid #d1d5db',
                  }}
                >
                  {has ? '✓ ' : ''}{svc.name}
                </button>
              );
            })}
            {services.length === 0 && <span style={{ color: '#9ca3af' }}>Add services first</span>}
          </div>
        </div>
      ))}

      {therapists.filter(t => t.active).length === 0 && (
        <div style={{ color: '#9ca3af', textAlign: 'center', padding: '1.5rem' }}>No therapists yet — add your first one above.</div>
      )}
    </div>
  );
}
