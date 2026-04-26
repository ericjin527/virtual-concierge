'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../../lib/api';
import { s } from '../../../../../lib/styles';

interface Service { id: string; name: string; category: string; durationMinutes: number; price: number; bestFor?: string; active: boolean }

const CATEGORIES = ['Massage', 'Facial', 'Body Treatment', 'Couples', 'Prenatal', 'Sports', 'Other'];

const blank = { name: '', category: 'Massage', durationMinutes: 60, price: 0, description: '', bestFor: '', notBestFor: '' };

export default function ServicesPage() {
  const { id: businessId } = useParams<{ id: string }>();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [businessId]);

  async function load() {
    try { setServices(await api.getServices(businessId) as Service[]); }
    catch { setServices([]); }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: k === 'durationMinutes' || k === 'price' ? Number(e.target.value) : e.target.value }));

  function startEdit(svc: Service) {
    setEditId(svc.id);
    setForm({ name: svc.name, category: svc.category, durationMinutes: svc.durationMinutes, price: svc.price, description: '', bestFor: svc.bestFor ?? '', notBestFor: '' });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editId) {
        await api.updateService(businessId, editId, form);
        setEditId(null);
      } else {
        await api.createService(businessId, form);
      }
      setForm(blank);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  }

  async function deactivate(id: string) {
    await api.deleteService(businessId, id);
    await load();
  }

  return (
    <div style={s.page}>
      <a href="/dashboard/businesses" style={s.backLink}>← Businesses</a>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ ...s.h1, marginBottom: 0 }}>Services</h1>
        <a href={`/dashboard/businesses/${businessId}/therapists`} style={s.btnPrimary as React.CSSProperties & { textDecoration: string }}>
          Next: Therapists →
        </a>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem' }}>{error}</div>}

      {/* Form */}
      <div style={s.card}>
        <h2 style={s.h2}>{editId ? 'Edit Service' : 'Add Service'}</h2>
        <form onSubmit={submit}>
          <div style={s.grid2}>
            <div style={s.formGroup}>
              <label style={s.label}>Service Name *</label>
              <input style={s.input} value={form.name} onChange={set('name')} required placeholder="60-min Deep Tissue Massage" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Category *</label>
              <select style={{ ...s.select, width: '100%' }} value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Duration (min) *</label>
              <input style={s.input} type="number" min={15} step={15} value={form.durationMinutes} onChange={set('durationMinutes')} required />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Price ($) *</label>
              <input style={s.input} type="number" min={0} step={5} value={form.price} onChange={set('price')} required />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Best for (AI uses this to recommend)</label>
              <input style={s.input} value={form.bestFor} onChange={set('bestFor')} placeholder="muscle tension, stress relief, athletes" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Not best for</label>
              <input style={s.input} value={form.notBestFor} onChange={set('notBestFor')} placeholder="sensitive skin, pregnancy" />
            </div>
          </div>
          <div style={s.row}>
            <button type="submit" style={s.btnPrimary} disabled={saving}>{saving ? 'Saving...' : editId ? 'Update Service' : 'Add Service'}</button>
            {editId && <button type="button" style={s.btnSecondary} onClick={() => { setEditId(null); setForm(blank); }}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* List */}
      {services.filter(s => s.active).map(svc => (
        <div key={svc.id} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{svc.name}</div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 4 }}>
                {svc.category} · {svc.durationMinutes}min · ${svc.price}
                {svc.bestFor && <> · <em>Best for: {svc.bestFor}</em></>}
              </div>
            </div>
            <div style={s.row}>
              <button style={s.btnSecondary} onClick={() => startEdit(svc)}>Edit</button>
              <button style={s.btnDanger} onClick={() => deactivate(svc.id)}>Remove</button>
            </div>
          </div>
        </div>
      ))}

      {services.filter(s => s.active).length === 0 && (
        <div style={{ color: '#9ca3af', textAlign: 'center', padding: '1.5rem' }}>No services yet — add your first one above.</div>
      )}
    </div>
  );
}
