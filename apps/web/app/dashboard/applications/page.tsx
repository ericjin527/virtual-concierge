'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { s } from '../../../lib/styles';

interface Application {
  id: string; name: string; businessName?: string; email: string; phone: string;
  category: string; serviceArea: string; services: string[]; notes?: string;
  status: string; createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  appliance_repair: '🔧 Appliance Repair', event_booking: '🎉 Event Booking', parenting_logistics: '👨‍👧 Parenting',
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setApps(await api.getVendorApplications('pending') as Application[]); }
    catch { setApps([]); }
    finally { setLoading(false); }
  }

  async function approve(id: string) {
    setSaving(id);
    await api.approveVendorApplication(id);
    await load();
    setSaving(null);
  }

  async function reject(id: string) {
    setSaving(id);
    await api.rejectVendorApplication(id);
    await load();
    setSaving(null);
  }

  return (
    <div style={s.page}>
      <a href="/dashboard/tasks" style={s.backLink}>← Tasks</a>
      <h1 style={s.h1}>Vendor Applications</h1>

      {loading && <p style={{ color: '#9ca3af' }}>Loading...</p>}

      {!loading && apps.length === 0 && (
        <div style={{ ...s.card, textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No pending applications.</div>
      )}

      {apps.map(app => (
        <div key={app.id} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{app.name}{app.businessName ? ` · ${app.businessName}` : ''}</div>
              <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 2 }}>
                {CATEGORY_LABELS[app.category] ?? app.category} · {app.serviceArea}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>{app.email} · {app.phone}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                {app.services.map(sv => <span key={sv} style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem' }}>{sv}</span>)}
              </div>
              {app.notes && <p style={{ fontSize: '0.82rem', color: '#374151', marginTop: '0.4rem', marginBottom: 0 }}>{app.notes}</p>}
            </div>
            <div style={s.row}>
              <button style={s.btnPrimary} disabled={saving === app.id} onClick={() => approve(app.id)}>Approve</button>
              <button style={s.btnDanger} disabled={saving === app.id} onClick={() => reject(app.id)}>Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
