'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../../lib/api';
import { s } from '../../../../../lib/styles';

interface Room { id: string; name: string; compatibleCategories: string[] }

export default function RoomsPage() {
  const { id: businessId } = useParams<{ id: string }>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState('');
  const [categories, setCategories] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    (api.getRooms(businessId) as Promise<Room[]>).then(setRooms).finally(() => setLoading(false));

  useEffect(() => { load(); }, [businessId]);

  const startEdit = (r: Room) => {
    setEditId(r.id); setName(r.name); setCategories(r.compatibleCategories.join(', '));
  };

  const save = async () => {
    const payload = { name, compatibleCategories: categories.split(',').map(c => c.trim()).filter(Boolean) };
    if (editId) {
      await api.updateRoom(businessId, editId, payload);
    } else {
      await api.createRoom(businessId, payload);
    }
    setName(''); setCategories(''); setEditId(null);
    load();
  };

  const remove = async (id: string) => {
    await api.deleteRoom(businessId, id);
    load();
  };

  if (loading) return <div style={s.page}><p>Loading...</p></div>;

  return (
    <div style={s.page}>
      <a href={`/dashboard/businesses`} style={s.backLink}>← Businesses</a>
      <h1 style={s.h1}>Rooms</h1>

      <div style={s.card}>
        <h2 style={s.h2}>{editId ? 'Edit Room' : 'Add Room'}</h2>
        <div style={s.formGroup}>
          <label style={s.label}>Room Name</label>
          <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="Treatment Room 1" />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Compatible Categories (comma-separated)</label>
          <input style={s.input} value={categories} onChange={e => setCategories(e.target.value)} placeholder="massage, facial, body" />
        </div>
        <div style={s.row}>
          <button style={s.btnPrimary} onClick={save} disabled={!name}>{editId ? 'Update' : 'Add Room'}</button>
          {editId && <button style={s.btnSecondary} onClick={() => { setEditId(null); setName(''); setCategories(''); }}>Cancel</button>}
        </div>
      </div>

      {rooms.map(r => (
        <div key={r.id} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{r.name}</div>
              {r.compatibleCategories.length > 0 && (
                <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 4 }}>
                  {r.compatibleCategories.join(' · ')}
                </div>
              )}
            </div>
            <div style={s.row}>
              <button style={s.btnSecondary} onClick={() => startEdit(r)}>Edit</button>
              <button style={s.btnDanger} onClick={() => remove(r.id)}>Remove</button>
            </div>
          </div>
        </div>
      ))}

      {rooms.length === 0 && <p style={{ color: '#6b7280' }}>No rooms yet.</p>}
    </div>
  );
}
