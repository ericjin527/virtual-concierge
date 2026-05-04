'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';

const P = '#7C3AED';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

const GLAM_LABELS: Record<string, string> = {
  photographer: 'Photographer', makeup_artist: 'Makeup Artist', hair_stylist: 'Hair Stylist',
  wardrobe_stylist: 'Wardrobe Stylist', rental_partner: 'Outfit Rental',
  cultural_outfit_partner: 'Kimono / Outfit', photo_editor: 'Photo Editor',
  video_creator: 'Video Creator', local_coordinator: 'Local Coordinator',
  transport_partner: 'Transport',
};

interface Review { id: string; rating: number; body?: string; createdAt: string }
interface Expert {
  id: string; name: string; businessName?: string; bio?: string; photoUrl?: string;
  glamCategory?: string; category: string; serviceArea: string; cities: string[];
  services: string[]; specialties: string[]; certifications: string[];
  languages: string[]; rating?: number; completedJobs: number;
  responseTimeMinutes?: number; badges: string[]; reviews: Review[];
  metadata?: Record<string, any>;
}

function Stars({ rating, large }: { rating: number; large?: boolean }) {
  const full = Math.round(rating);
  return (
    <span style={{ color: '#f59e0b', fontSize: large ? '1.1rem' : '0.95rem', letterSpacing: -1 }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

function GalleryHero({ photos, expertName }: { photos: string[]; expertName: string }) {
  const [idx, setIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);

  if (photos.length === 0) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: 420, background: '#111', overflow: 'hidden' }}>
      <img
        src={photos[idx]}
        alt={expertName}
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }}
      />

      {/* Prev/Next */}
      {photos.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)} style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
          }}>‹</button>
          <button onClick={() => setIdx(i => (i + 1) % photos.length)} style={{
            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
          }}>›</button>
        </>
      )}

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div style={{ position: 'absolute', bottom: 52, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
          {photos.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 18 : 6, height: 6, borderRadius: 99, border: 'none', cursor: 'pointer',
              background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)', padding: 0, transition: 'width 0.2s',
            }} />
          ))}
        </div>
      )}

      {/* Show all photos */}
      <button onClick={() => setShowAll(true)} style={{
        position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 99, padding: '6px 18px', fontSize: '0.82rem', fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(4px)',
        color: TEXT,
      }}>
        <span style={{ fontSize: '0.9rem' }}>⊞</span> Show all photos ({photos.length})
      </button>

      {/* All photos modal */}
      {showAll && (
        <div onClick={() => setShowAll(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '1rem',
          overflowY: 'auto',
        }}>
          <button onClick={() => setShowAll(false)} style={{
            position: 'fixed', top: 16, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: '1.2rem', cursor: 'pointer',
          }}>✕</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8, maxWidth: 900, width: '100%' }}>
            {photos.map((p, i) => (
              <img key={i} src={p} alt="" onClick={e => { e.stopPropagation(); setIdx(i); setShowAll(false); }}
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExpertProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (api.getExpert(id) as Promise<Expert>).then(setExpert).catch(() => setExpert(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', textAlign: 'center', color: MUTED }}>Loading...</div>
  );
  if (!expert) return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', textAlign: 'center', color: '#b91c1c' }}>Expert not found.</div>
  );

  const meta = expert.metadata ?? {};
  const galleryPhotos: string[] = Array.isArray(meta.galleryPhotos) ? meta.galleryPhotos : [];
  const allPhotos = [expert.photoUrl, ...galleryPhotos].filter(Boolean) as string[];
  const instagramUrl: string | undefined = meta.instagramUrl;
  const littleRedBookUrl: string | undefined = meta.littleRedBookUrl;
  const instagramHandle: string | undefined = meta.instagramHandle;
  const littleRedBookHandle: string | undefined = meta.littleRedBookHandle;

  const city = expert.cities[0] ?? expert.serviceArea;
  const categoryLabel = expert.glamCategory ? (GLAM_LABELS[expert.glamCategory] ?? expert.glamCategory) : expert.category.replace(/_/g, ' ');
  const avgRating = expert.rating ?? (expert.reviews.length > 0
    ? expert.reviews.reduce((s, r) => s + r.rating, 0) / expert.reviews.length
    : null);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: TEXT, minHeight: '100vh', background: '#fff' }}>

      {/* Gallery hero */}
      <GalleryHero photos={allPhotos} expertName={expert.name} />

      {/* Back link */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1rem 1.5rem 0' }}>
        <a href="/" style={{ fontSize: '0.85rem', color: MUTED, textDecoration: 'none' }}>
          ← View More {categoryLabel}s{city ? ` in ${city}` : ''}
        </a>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.25rem 1.5rem 4rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>

        {/* Left: profile info */}
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', overflow: 'hidden', flexShrink: 0, background: '#f3f4f6' }}>
              {expert.photoUrl
                ? <img src={expert.photoUrl} alt={expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2rem' }}>👤</div>}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>
                {expert.glamCategory ? `Meet ${expert.name}` : expert.name}
                {city ? ` in ${city}` : ''}
              </h1>
              <div style={{ fontSize: '0.84rem', color: MUTED, marginTop: 2 }}>{categoryLabel}</div>
              {avgRating != null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Stars rating={avgRating} large />
                  <span style={{ fontSize: '0.84rem', color: MUTED }}>
                    {avgRating.toFixed(1)} · {expert.reviews.length} review{expert.reviews.length !== 1 ? 's' : ''}
                    {expert.completedJobs > 0 && ` · ${expert.completedJobs} shoots`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Social links */}
          {(instagramUrl || littleRedBookUrl) && (
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  color: '#fff', padding: '0.45rem 1rem', borderRadius: 99,
                  textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
                }}>
                  <span style={{ fontSize: '1rem' }}>📸</span>
                  {instagramHandle ? `@${instagramHandle.replace('@', '')}` : 'Instagram'}
                </a>
              )}
              {littleRedBookUrl && (
                <a href={littleRedBookUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#ff2442', color: '#fff', padding: '0.45rem 1rem', borderRadius: 99,
                  textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
                }}>
                  <span style={{ fontSize: '1rem' }}>📕</span>
                  {littleRedBookHandle ? littleRedBookHandle : '小红书'}
                </a>
              )}
            </div>
          )}

          {/* Bio */}
          {expert.bio && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#374151', lineHeight: 1.8, fontSize: '0.95rem', margin: 0 }}>
                {expert.bio}
              </p>
            </div>
          )}

          {/* Languages */}
          {expert.languages.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Languages</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {expert.languages.map(l => (
                  <span key={l} style={{ background: '#f3f4f6', padding: '3px 12px', borderRadius: 99, fontSize: '0.82rem', color: TEXT }}>
                    {l.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {expert.certifications.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Certifications</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {expert.certifications.map(c => (
                  <span key={c} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 12px', borderRadius: 99, fontSize: '0.82rem', fontWeight: 500 }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div style={{ marginTop: '0.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Reviews {expert.reviews.length > 0 && `(${expert.reviews.length})`}
            </h2>

            {expert.reviews.length === 0 ? (
              <div style={{ color: MUTED, fontSize: '0.88rem', padding: '1rem 0' }}>No reviews yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {expert.reviews.map(r => (
                  <div key={r.id} style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>👤</div>
                        <Stars rating={r.rating} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {r.body && <p style={{ fontSize: '0.88rem', color: '#374151', margin: 0, lineHeight: 1.65 }}>{r.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: booking card */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            {avgRating != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
                <Stars rating={avgRating} />
                <span style={{ fontSize: '0.82rem', color: MUTED }}>{avgRating.toFixed(1)} ({expert.reviews.length})</span>
              </div>
            )}

            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 0.25rem', color: TEXT }}>
              Please choose your ideal date
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: MUTED, marginBottom: '1.25rem' }}>
              <span>📍</span> {city}{expert.cities.length > 1 ? ` + ${expert.cities.length - 1} more` : ''}
            </div>

            {/* Services */}
            {expert.services.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Services</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {expert.services.map(s => (
                    <span key={s} style={{ background: '#f3f4f6', padding: '3px 10px', borderRadius: 99, fontSize: '0.78rem', color: TEXT }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <a href="/travel" style={{
              display: 'block', textAlign: 'center',
              background: 'linear-gradient(135deg, #0F4C7D 0%, #1a6bab 100%)',
              color: '#fff', padding: '0.85rem', borderRadius: 10,
              textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
              marginBottom: '0.75rem',
            }}>
              Plan a shoot →
            </a>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: MUTED }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> Free to inquire
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> Vetted by Local Butler
              </div>
              {expert.responseTimeMinutes && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> Responds in ~{expert.responseTimeMinutes}min
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
