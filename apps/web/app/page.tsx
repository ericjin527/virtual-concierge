import { SignedIn, SignedOut } from '@clerk/nextjs';

const P = '#7C3AED';
const P2 = '#A855F7';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

const HOW_IT_WORKS = [
  { step: '01', title: 'Tell us your trip', desc: 'Share your destination, dates, and the look you\'re going for. Takes 2 minutes.' },
  { step: '02', title: 'AI designs your shoot', desc: 'We plan the concept, glam direction, locations, and expert lineup — tailored to your occasion and vibe.' },
  { step: '03', title: 'Local experts execute', desc: 'Vetted makeup artists, photographers, and stylists handle every detail on the ground.' },
  { step: '04', title: 'You receive the gallery', desc: 'Edited photos, video reels, and social-ready content delivered within days.' },
];

const EXPERT_TYPES = [
  { icon: '📷', label: 'Photographers' },
  { icon: '💄', label: 'Makeup artists' },
  { icon: '💇', label: 'Hair stylists' },
  { icon: '👗', label: 'Wardrobe stylists' },
  { icon: '👘', label: 'Kimono / outfit rental' },
  { icon: '🎨', label: 'Creative directors' },
  { icon: '🖼️', label: 'Photo editors' },
  { icon: '🎬', label: 'Video creators' },
];

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: TEXT }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .hero-text { animation: fadeUp 0.7s ease both; }
        .hero-sub { animation: fadeUp 0.7s 0.12s ease both; }
        .hero-cta { animation: fadeUp 0.7s 0.22s ease both; }
      `}</style>

      {/* Nav */}
      <nav style={{
        padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(10px)', borderBottom: `1px solid ${BORDER}`,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', color: P, letterSpacing: '-0.03em' }}>
          Local Butler
        </a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <SignedIn>
            <a href="/portal" style={{ color: MUTED, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>My portal</a>
          </SignedIn>
          <a href="/expert" style={{ color: MUTED, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Expert portal</a>
          <SignedOut>
            <a href="/sign-in" style={{ color: MUTED, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Sign in</a>
          </SignedOut>
          <a href="/travel" style={{
            background: `linear-gradient(135deg, ${P}, ${P2})`,
            color: '#fff', padding: '0.45rem 1.1rem',
            borderRadius: 8, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
          }}>
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'radial-gradient(ellipse at 20% 0%, #FDE8F0 0%, #FFF7ED 50%, #FFFBEA 100%)',
        padding: '7rem 2rem 6rem', textAlign: 'center', minHeight: '70vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="hero-text" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(124,58,237,0.08)', color: P,
          fontSize: '0.72rem', fontWeight: 700, padding: '5px 14px', borderRadius: 99,
          marginBottom: '1.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          border: '1px solid rgba(124,58,237,0.2)',
        }}>
          ✦ Destination Glam + Shoot
        </div>

        <h1 className="hero-text" style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1,
          marginBottom: '1.5rem', letterSpacing: '-0.03em', maxWidth: 700,
          background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #EC4899 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Pack less. Look iconic.<br />Your AI-powered destination shoot.
        </h1>

        <p className="hero-sub" style={{
          fontSize: '1.05rem', color: MUTED, lineHeight: 1.75,
          maxWidth: 520, margin: '0 auto 2.75rem',
        }}>
          Travel light. Look editorial. Get magazine-style photos in your destination.
          We match you with vetted local experts for makeup, hair, styling, and photography.
        </p>

        <div className="hero-cta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/travel" style={{
            background: `linear-gradient(135deg, ${P}, ${P2})`,
            color: '#fff', padding: '0.9rem 2.5rem',
            borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
            boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            display: 'inline-block',
          }}>
            Plan your shoot →
          </a>
          <p style={{ fontSize: '0.78rem', color: MUTED }}>Free to submit</p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: P, letterSpacing: '0.09em', textTransform: 'uppercase' as const, marginBottom: '0.75rem' }}>
              How it works
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.2 }}>
              Magazine shoots, handled end to end.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '3rem' }}>
            {HOW_IT_WORKS.map(item => (
              <div key={item.step}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: P, letterSpacing: '0.09em', textTransform: 'uppercase' as const, marginBottom: '0.75rem' }}>
                  {item.step}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.6rem', color: TEXT, lineHeight: 1.3 }}>
                  {item.title}
                </div>
                <div style={{ color: MUTED, fontSize: '0.84rem', lineHeight: 1.75 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert network */}
      <section style={{
        background: 'radial-gradient(ellipse at 80% 50%, #FDE8F0 0%, #FFF7ED 60%, #FFFBEA 100%)',
        padding: '5rem 2rem',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: P, letterSpacing: '0.09em', textTransform: 'uppercase' as const, marginBottom: '0.75rem' }}>
              Our network
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.025em', color: TEXT, lineHeight: 1.2 }}>
              Curated locals.<br />Not a marketplace.
            </h2>
            <p style={{ color: MUTED, lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Every expert is personally reviewed before their first booking. You see their portfolio, style, and track record — before anything is confirmed.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Vetted by our team', 'Portfolio + style review', 'Transparent pricing', 'No commitment to start'].map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: MUTED }}>
                  <span style={{ color: P, fontWeight: 700 }}>✓</span>{b}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {EXPERT_TYPES.map(e => (
              <div key={e.label} style={{
                background: 'rgba(255,255,255,0.85)', border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: '0.85rem 1rem', fontSize: '0.84rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '0.6rem', color: TEXT,
                backdropFilter: 'blur(4px)',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{e.icon}</span>
                <span>{e.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert CTA */}
      <section style={{
        background: `linear-gradient(135deg, ${P} 0%, #6D28D9 50%, #4C1D95 100%)`,
        color: '#fff', padding: '6rem 2rem', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.09em', textTransform: 'uppercase' as const, marginBottom: '1rem' }}>
            For local creatives
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Are you a local expert?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2.5rem', lineHeight: 1.8, fontSize: '0.9rem' }}>
            Get matched with travelers who need your skills. Every booking comes with a full creative brief, clear deliverables, and fair pay.
          </p>
          <a href="/expert" style={{
            background: '#fff', color: P, padding: '0.85rem 2rem',
            borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
            display: 'inline-block',
          }}>
            Apply as an expert →
          </a>
        </div>
      </section>

      <footer style={{
        background: '#0F0A1E', borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', fontWeight: 600 }}>Local Butler</span>
        <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.76rem', textDecoration: 'none' }}>Admin</a>
      </footer>
    </div>
  );
}
