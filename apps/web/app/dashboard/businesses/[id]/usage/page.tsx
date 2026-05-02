'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../../lib/api';
import { s } from '../../../../../lib/styles';

interface MonthlyUsage {
  month: string;
  totalCalls: number;
  totalCallMinutes: number;
  bookingRequestsCreated: number;
  callbacksCreated: number;
  smsSent: number;
  estimatedTwilioCostUsd: number;
  estimatedOpenAiCostUsd: number;
  estimatedTotalCostUsd: number;
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ ...s.card, textAlign: 'center', marginBottom: 0 }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function UsagePage() {
  const { id: businessId } = useParams<{ id: string }>();
  const [usage, setUsage] = useState<MonthlyUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (api.getMonthlyUsage(businessId) as Promise<MonthlyUsage>)
      .then(setUsage)
      .catch(() => setUsage(null))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) return <div style={s.page}><p>Loading...</p></div>;
  if (!usage) return <div style={s.page}><p style={{ color: '#b91c1c' }}>Failed to load usage data.</p></div>;

  const planPrice = 199;
  const grossMargin = planPrice - usage.estimatedTotalCostUsd;
  const marginPct = planPrice > 0 ? Math.round((grossMargin / planPrice) * 100) : 0;

  return (
    <div style={s.page}>
      <a href="/dashboard/businesses" style={s.backLink}>← Businesses</a>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ ...s.h1, marginBottom: 0 }}>Usage & Costs</h1>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{usage.month}</span>
      </div>

      {/* Activity */}
      <h2 style={s.h2}>Activity</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Stat label="Total Calls" value={usage.totalCalls} />
        <Stat label="Call Minutes" value={usage.totalCallMinutes} />
        <Stat label="Booking Requests" value={usage.bookingRequestsCreated} />
        <Stat label="Callbacks" value={usage.callbacksCreated} />
        <Stat label="SMS Sent" value={usage.smsSent} />
      </div>

      {/* Costs */}
      <h2 style={s.h2}>Estimated Variable Costs</h2>
      <div style={s.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '0.5rem 0', color: '#374151' }}>Twilio (voice + SMS)</td>
              <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 600 }}>${usage.estimatedTwilioCostUsd.toFixed(2)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '0.5rem 0', color: '#374151' }}>OpenAI (gpt-4o-mini)</td>
              <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 600 }}>${usage.estimatedOpenAiCostUsd.toFixed(4)}</td>
            </tr>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <td style={{ padding: '0.6rem 0', fontWeight: 700 }}>Total Variable Cost</td>
              <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 700 }}>${usage.estimatedTotalCostUsd.toFixed(2)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '0.5rem 0', color: '#374151' }}>Plan price (est.)</td>
              <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>${planPrice}/mo</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem 0', fontWeight: 700, color: grossMargin >= 0 ? '#166534' : '#b91c1c' }}>
                Est. Gross Margin
              </td>
              <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 700, color: grossMargin >= 0 ? '#166534' : '#b91c1c' }}>
                ${grossMargin.toFixed(2)} ({marginPct}%)
              </td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem', marginBottom: 0 }}>
          Estimates based on $0.013/min voice, $0.0079/SMS, $0.000135/AI turn. Actual costs may vary.
        </p>
      </div>
    </div>
  );
}
