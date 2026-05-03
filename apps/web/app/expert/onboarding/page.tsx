'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExpertApi } from '../../../lib/expert-api';

const A = '#1a1714';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';

const GLAM_CATEGORIES = [
  { value: 'photographer',            icon: '📷', label: 'Photographer' },
  { value: 'makeup_artist',           icon: '💄', label: 'Makeup Artist' },
  { value: 'hair_stylist',            icon: '✂️', label: 'Hair Stylist' },
  { value: 'wardrobe_stylist',        icon: '👗', label: 'Wardrobe Stylist' },
  { value: 'cultural_outfit_partner', icon: '👘', label: 'Kimono / Cultural Outfit' },
  { value: 'rental_partner',          icon: '🛍️', label: 'Rental Partner' },
  { value: 'photo_editor',            icon: '🖼️', label: 'Photo Editor' },
  { value: 'video_creator',           icon: '🎬', label: 'Video / Reels' },
  { value: 'local_coordinator',       icon: '🗺️', label: 'Local Coordinator' },
  { value: 'transport_partner',       icon: '🚗', label: 'Transport' },
];

const TOKYO_AREAS = [
  'Shibuya', 'Harajuku', 'Omotesando', 'Ginza', 'Shinjuku',
  'Asakusa', 'Daikanyama', 'Nakameguro', 'Roppongi', 'Marunouchi',
  'Shimokitazawa', 'Yanaka', 'Ebisu', 'Ueno', 'Odaiba',
];

const STYLE_TAGS_BY_CATEGORY: Record<string, string[]> = {
  photographer:            ['editorial', 'documentary', 'golden-hour', 'street', 'film-look', 'bright-airy', 'couple', 'solo-portrait', 'proposal', 'fashion', 'moody', 'travel-lifestyle'],
  makeup_artist:           ['natural', 'dewy-skin', 'bold-graphic', 'J-beauty', 'K-beauty', 'editorial-glam', 'no-makeup-makeup', 'bridal'],
  hair_stylist:            ['waves', 'updo', 'braids', 'sleek', 'textured', 'vintage', 'editorial'],
  wardrobe_stylist:        ['streetwear', 'minimalist', 'luxe', 'editorial', 'vintage-Japanese', 'contemporary', 'luxury-resort'],
  cultural_outfit_partner: ['kimono', 'yukata', 'furisode', 'hakama', 'traditional', 'modern-fusion'],
  photo_editor:            ['warm-film', 'clean-bright', 'dark-moody', 'desaturated', 'vibrant', 'true-to-life'],
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${BORDER}`,
  borderRadius: 9, fontSize: '0.9rem', boxSizing: 'border-box',
  background: '#fff', outline: 'none', color: A,
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 700,
  color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em',
};

const STEPS = ['Identity', 'Specialty', 'Coverage', 'Portfolio', 'Rates'];

export default function ExpertOnboardingPage() {
  const router = useRouter();
  const expertApi = useExpertApi();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', phone: '', bio: '', instagramHandle: '', websiteUrl: '',
    glamCategory: '',
    styleTags: [] as string[],
    areas: [] as string[],
    languages: ['en'] as string[],
    rateMin: '', rateMax: '', rateCurrency: 'JPY', rateNotes: '',
    portfolioUrls: ['', '', ''],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function toggleTag(tag: string) {
    setForm(f => ({
      ...f,
      styleTags: f.styleTags.includes(tag) ? f.styleTags.filter(t => t !== tag) : [...f.styleTags, tag],
    }));
  }

  function toggleArea(area: string) {
    setForm(f => ({
      ...f,
      areas: f.areas.includes(area) ? f.areas.filter(a => a !== area) : [...f.areas, area],
    }));
  }

  function toggleLanguage(lang: string) {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(lang) ? f.languages.filter(l => l !== lang) : [...f.languages, lang],
    }));
  }

  function validateStep(): string {
    if (step === 1) {
      if (!form.name.trim()) return 'Name is required.';
      if (!form.phone.trim()) return 'Phone number is required.';
    }
    if (step === 2 && !form.glamCategory) return 'Select your primary category.';
    if (step === 3 && form.areas.length === 0) return 'Select at least one area you serve.';
    if (step === 4 && !form.portfolioUrls[0]?.trim()) return 'Add at least one portfolio link.';
    return '';
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  }

  async function save() {
    if (!form.rateMin) { setError('Enter your minimum rate.'); return; }
    setError('');
    setSaving(true);
    try {
      await expertApi.updateMyProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim() || undefined,
        glamCategory: form.glamCategory,
        languages: form.languages,
        cities: form.areas,
        metadata: {
          instagramHandle: form.instagramHandle.trim() || undefined,
          websiteUrl: form.websiteUrl.trim() || undefined,
          styleTags: form.styleTags,
          portfolioUrls: form.portfolioUrls.filter(u => u.trim()),
          rateMin: Number(form.rateMin),
          rateMax: form.rateMax ? Number(form.rateMax) : undefined,
          rateCurrency: form.rateCurrency,
          rateNotes: form.rateNotes.trim() || undefined,
          areasServed: form.areas,
        },
      });
      router.push('/expert/dashboard');
    } catch (e: any) {
      setError(e.message ?? 'Failed to save profile.');
      setSaving(false);
    }
  }

  const availableTags = STYLE_TAGS_BY_CATEGORY[form.glamCategory] ?? [];

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: A, minHeight: '100vh', background: '#faf9f6' }}>
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '1rem 2.5rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', color: A, fontFamily: 'Georgia, serif' }}>
          Local Butler
        </a>
        <span style={{ fontSize: '0.82rem', color: FAINT }}>Expert setup — {step} of {STEPS.length}</span>
      </nav>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '2.5rem' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ height: 3, width: '100%', borderRadius: 99, background: i + 1 <= step ? A : BORDER }} />
              <span style={{ fontSize: '0.65rem', color: i + 1 === step ? A : FAINT, fontWeight: i + 1 === step ? 700 : 400 }}>{s}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: 9, marginBottom: '1.25rem', fontSize: '0.86rem' }}>
            {error}
          </div>
        )}

        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {step === 1 && (
            <>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: A, fontFamily: 'Georgia, serif', margin: '0 0 0.25rem' }}>Tell us who you are</h2>
                <p style={{ color: MUTED, fontSize: '0.85rem', margin: 0 }}>Clients book people, not credentials.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Display name *</label>
                  <input style={inputStyle} value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Yuki M." />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp / Phone *</label>
                  <input type="tel" style={inputStyle} value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="+81 90 0000 0000" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Bio</label>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' } as React.CSSProperties} value={form.bio} onChange={e => setField('bio', e.target.value)} placeholder="Where are you from? How did you find your style? What draws you to destination work?" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Instagram</label>
                  <input style={inputStyle} value={form.instagramHandle} onChange={e => setField('instagramHandle', e.target.value)} placeholder="@yourhandle" />
                </div>
                <div>
                  <label style={labelStyle}>Website</label>
                  <input style={inputStyle} value={form.websiteUrl} onChange={e => setField('websiteUrl', e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Languages</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {([['en', 'English'], ['ja', '日本語'], ['zh', '中文'], ['ko', '한국어'], ['fr', 'Français']] as [string, string][]).map(([code, label]) => (
                    <button key={code} type="button" onClick={() => toggleLanguage(code)} style={{
                      padding: '5px 14px', borderRadius: 99, fontSize: '0.82rem', cursor: 'pointer',
                      background: form.languages.includes(code) ? A : '#fff',
                      color: form.languages.includes(code) ? '#fff' : A,
                      border: `1px solid ${form.languages.includes(code) ? A : BORDER}`,
                      fontWeight: form.languages.includes(code) ? 600 : 400,
                    }}>{label}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: A, fontFamily: 'Georgia, serif', margin: '0 0 0.25rem' }}>Your specialty</h2>
                <p style={{ color: MUTED, fontSize: '0.85rem', margin: 0 }}>Select your primary category. You'll receive tasks that match this.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {GLAM_CATEGORIES.map(c => (
                  <button key={c.value} type="button" onClick={() => { setField('glamCategory', c.value); setField('styleTags', []); }} style={{
                    padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    border: form.glamCategory === c.value ? `2px solid ${A}` : `1px solid ${BORDER}`,
                    background: form.glamCategory === c.value ? A : '#fff',
                    color: form.glamCategory === c.value ? '#fff' : A,
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    fontSize: '0.88rem', fontWeight: 500,
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>

              {form.glamCategory && availableTags.length > 0 && (
                <div>
                  <label style={labelStyle}>Style tags — <span style={{ fontWeight: 400, textTransform: 'none' }}>choose up to 6 that describe your work</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {availableTags.map(tag => {
                      const selected = form.styleTags.includes(tag);
                      const maxed = !selected && form.styleTags.length >= 6;
                      return (
                        <button key={tag} type="button" onClick={() => !maxed && toggleTag(tag)} style={{
                          padding: '4px 12px', borderRadius: 99, fontSize: '0.8rem', cursor: maxed ? 'default' : 'pointer',
                          background: selected ? A : '#fff',
                          color: selected ? '#fff' : A,
                          border: `1px solid ${selected ? A : BORDER}`,
                          opacity: maxed ? 0.35 : 1,
                        }}>{tag}</button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: A, fontFamily: 'Georgia, serif', margin: '0 0 0.25rem' }}>Where do you work?</h2>
                <p style={{ color: MUTED, fontSize: '0.85rem', margin: 0 }}>Select the Tokyo neighborhoods you cover.</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {TOKYO_AREAS.map(area => (
                  <button key={area} type="button" onClick={() => toggleArea(area)} style={{
                    padding: '6px 16px', borderRadius: 99, fontSize: '0.84rem', cursor: 'pointer',
                    background: form.areas.includes(area) ? A : '#fff',
                    color: form.areas.includes(area) ? '#fff' : A,
                    border: `1px solid ${form.areas.includes(area) ? A : BORDER}`,
                    fontWeight: form.areas.includes(area) ? 600 : 400,
                  }}>{area}</button>
                ))}
              </div>
              {form.areas.length > 0 && (
                <p style={{ fontSize: '0.8rem', color: MUTED, margin: 0 }}>
                  {form.areas.length} area{form.areas.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: A, fontFamily: 'Georgia, serif', margin: '0 0 0.25rem' }}>Show your work</h2>
                <p style={{ color: MUTED, fontSize: '0.85rem', margin: 0 }}>Add links to your best work. One great frame tells more than ten generic ones.</p>
              </div>
              {form.portfolioUrls.map((url, i) => (
                <div key={i}>
                  <label style={labelStyle}>Portfolio link {i + 1}{i === 0 ? ' *' : ' (optional)'}</label>
                  <input style={inputStyle} value={url} onChange={e => {
                    const urls = [...form.portfolioUrls];
                    urls[i] = e.target.value;
                    setField('portfolioUrls', urls as [string, string, string]);
                  }} placeholder="Instagram post, Pixieset gallery, Google Drive, or portfolio URL" />
                </div>
              ))}
              <p style={{ fontSize: '0.78rem', color: FAINT, margin: 0 }}>
                Links should be publicly accessible. You can add more after approval.
              </p>
            </>
          )}

          {step === 5 && (
            <>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: A, fontFamily: 'Georgia, serif', margin: '0 0 0.25rem' }}>Your rates</h2>
                <p style={{ color: MUTED, fontSize: '0.85rem', margin: 0 }}>Shows clients a range. You'll propose your exact rate per task.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '0.75rem', alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Min rate *</label>
                  <input type="number" style={inputStyle} value={form.rateMin} onChange={e => setField('rateMin', e.target.value)} placeholder="30000" />
                </div>
                <div>
                  <label style={labelStyle}>Max rate</label>
                  <input type="number" style={inputStyle} value={form.rateMax} onChange={e => setField('rateMax', e.target.value)} placeholder="60000" />
                </div>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.rateCurrency} onChange={e => setField('rateCurrency', e.target.value)}>
                    <option value="JPY">JPY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Rate notes</label>
                <input style={inputStyle} value={form.rateNotes} onChange={e => setField('rateNotes', e.target.value)} placeholder="e.g. Includes 30 edited photos. Rush delivery +¥10,000." />
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          {step > 1 && (
            <button type="button" onClick={() => { setError(''); setStep(s => s - 1); }} style={{
              flex: 1, padding: '0.85rem', background: '#fff', color: A,
              border: `1px solid ${BORDER}`, borderRadius: 9, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}>← Back</button>
          )}
          {step < 5 ? (
            <button type="button" onClick={next} style={{
              flex: 2, padding: '0.85rem', background: A, color: '#fff',
              border: 'none', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            }}>Continue →</button>
          ) : (
            <button type="button" onClick={save} disabled={saving} style={{
              flex: 2, padding: '0.85rem', background: A, color: '#fff',
              border: 'none', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            }}>{saving ? 'Saving...' : 'Submit profile →'}</button>
          )}
        </div>

        {step === 5 && (
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: FAINT }}>
            Your profile goes to admin review. You'll be notified within 48 hours.
          </p>
        )}
      </div>
    </div>
  );
}
