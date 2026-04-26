'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../../lib/api';
import { s } from '../../../../../lib/styles';

interface Policy {
  cancellationPolicy?: string;
  lateArrivalPolicy?: string;
  parking?: string;
  depositPolicy?: string;
  refundRule?: string;
  medicalDisclaimer?: string;
  doNotSayRules?: string[];
}

const EMPTY: Policy = {
  cancellationPolicy: '', lateArrivalPolicy: '', parking: '',
  depositPolicy: '', refundRule: '', medicalDisclaimer: '', doNotSayRules: [],
};

export default function PolicyPage() {
  const { id: businessId } = useParams<{ id: string }>();
  const [form, setForm] = useState<Policy>(EMPTY);
  const [doNotSay, setDoNotSay] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (api.getPolicy(businessId) as Promise<Policy | null>).then(p => {
      if (p) { setForm(p); setDoNotSay((p.doNotSayRules ?? []).join('\n')); }
    }).finally(() => setLoading(false));
  }, [businessId]);

  const set = (field: keyof Policy) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const save = async () => {
    const payload = { ...form, doNotSayRules: doNotSay.split('\n').map(s => s.trim()).filter(Boolean) };
    await api.upsertPolicy(businessId, payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div style={s.page}><p>Loading...</p></div>;

  const field = (label: string, key: keyof Policy, placeholder: string) => (
    <div style={s.formGroup}>
      <label style={s.label}>{label}</label>
      <textarea style={{ ...s.input, height: 72, resize: 'vertical' }} value={form[key] as string ?? ''} onChange={set(key)} placeholder={placeholder} />
    </div>
  );

  return (
    <div style={s.page}>
      <a href={`/dashboard/businesses`} style={s.backLink}>← Businesses</a>
      <h1 style={s.h1}>Policies</h1>

      <div style={s.card}>
        {field('Cancellation Policy', 'cancellationPolicy', '24-hour cancellation required...')}
        {field('Late Arrival Policy', 'lateArrivalPolicy', 'Appointments may be shortened...')}
        {field('Parking', 'parking', 'Free parking in the lot behind the building...')}
        {field('Deposit Policy', 'depositPolicy', '50% deposit required for first-time clients...')}
        {field('Refund Rule', 'refundRule', 'No refunds after service is completed...')}
        {field('Medical Disclaimer', 'medicalDisclaimer', 'Please consult your physician if...')}

        <div style={s.formGroup}>
          <label style={s.label}>Do-Not-Say Rules (one per line)</label>
          <textarea
            style={{ ...s.input, height: 100, resize: 'vertical' }}
            value={doNotSay}
            onChange={e => setDoNotSay(e.target.value)}
            placeholder={"Never mention competitor names\nNever quote prices without checking"}
          />
        </div>

        <button style={s.btnPrimary} onClick={save}>{saved ? '✓ Saved' : 'Save Policies'}</button>
      </div>
    </div>
  );
}
