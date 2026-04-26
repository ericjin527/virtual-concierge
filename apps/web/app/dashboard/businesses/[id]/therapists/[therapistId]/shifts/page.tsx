'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../../../../lib/api';
import { s } from '../../../../../../../lib/styles';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Shift { id: string; dayOfWeek: number | null; date: string | null; startTime: string; endTime: string }

export default function ShiftsPage() {
  const { id: businessId, therapistId } = useParams<{ id: string; therapistId: string }>();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(true);

  const load = () =>
    (api.getShifts(businessId, therapistId) as Promise<Shift[]>).then(setShifts).finally(() => setLoading(false));

  useEffect(() => { load(); }, [therapistId]);

  const add = async () => {
    await api.createShift(businessId, therapistId, { dayOfWeek: Number(dayOfWeek), startTime, endTime });
    load();
  };

  const remove = async (shiftId: string) => {
    await api.deleteShift(businessId, therapistId, shiftId);
    load();
  };

  if (loading) return <div style={s.page}><p>Loading...</p></div>;

  return (
    <div style={s.page}>
      <a href={`/dashboard/businesses/${businessId}/therapists`} style={s.backLink}>← Therapists</a>
      <h1 style={s.h1}>Weekly Schedule</h1>

      <div style={s.card}>
        <h2 style={s.h2}>Add Shift</h2>
        <div style={{ ...s.row, alignItems: 'flex-end', gap: '1rem' }}>
          <div>
            <label style={s.label}>Day</label>
            <select style={s.select} value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Start</label>
            <input type="time" style={s.select} value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div>
            <label style={s.label}>End</label>
            <input type="time" style={s.select} value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
          <button style={s.btnPrimary} onClick={add}>Add</button>
        </div>
      </div>

      {DAYS.map((day, i) => {
        const dayShifts = shifts.filter(sh => sh.dayOfWeek === i);
        if (dayShifts.length === 0) return null;
        return (
          <div key={i} style={s.card}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{day}</div>
            {dayShifts.map(sh => (
              <div key={sh.id} style={{ ...s.row, justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem' }}>{sh.startTime} – {sh.endTime}</span>
                <button style={s.btnDanger} onClick={() => remove(sh.id)}>Remove</button>
              </div>
            ))}
          </div>
        );
      })}

      {shifts.length === 0 && <p style={{ color: '#6b7280' }}>No shifts yet. Add availability above.</p>}
    </div>
  );
}
