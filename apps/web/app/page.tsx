const HOW_IT_WORKS = [
  { step: '01', title: 'Tell us what you need', desc: 'Choose full delegation or pick specific services. A few quick fields — no long forms.' },
  { step: '02', title: 'We build your plan', desc: 'Our AI drafts a detailed itinerary. Chat with your butler to refine anything before confirming.' },
  { step: '03', title: 'Locals execute', desc: 'Vetted local experts handle each task. You see who\'s doing the work and track progress in real time.' },
  { step: '04', title: 'You receive the result', desc: 'Each expert delivers — reservation confirmations, photo links, pickup details — sent directly to you.' },
];

const EXPERT_TYPES = [
  { icon: '🚗', label: 'Drivers' },
  { icon: '🍽️', label: 'Restaurant experts' },
  { icon: '🗺️', label: 'Local guides' },
  { icon: '📷', label: 'Photographers' },
  { icon: '📦', label: 'Errand helpers' },
  { icon: '👨‍🍳', label: 'Private chefs' },
  { icon: '🎉', label: 'Event helpers' },
  { icon: '💐', label: 'Florists' },
];

const A = '#1a1714';
const MUTED = '#6f6560';
const FAINT = '#a8a29e';
const BORDER = '#e8e2da';

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: A, background: '#faf9f6' }}>

      {/* Nav */}
      <nav style={{
        borderBottom: `1px solid ${BORDER}`, padding: '1rem 2.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#fff', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', color: A, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
          Local Butler
        </a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/travel" style={{ color: MUTED, textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>Plan a visit</a>
          <a href="/account" style={{ color: MUTED, textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>My bookings</a>
          <a href="/expert" style={{ color: MUTED, textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>Expert portal</a>
          <a href="/travel" style={{
            background: A, color: '#fff', padding: '0.45rem 1.1rem',
            borderRadius: 8, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
          }}>
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '7rem 2.5rem 5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', background: '#f2ede6', color: '#92400e',
          fontSize: '0.72rem', fontWeight: 700, padding: '4px 14px', borderRadius: 99,
          marginBottom: '1.75rem', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Local travel, handled
        </div>
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.75rem)', fontWeight: 700, lineHeight: 1.06,
          marginBottom: '1.5rem', letterSpacing: '-0.03em', color: A,
          fontFamily: 'Georgia, serif',
        }}>
          Your personal butler,<br />wherever you travel.
        </h1>
        <p style={{
          fontSize: '1.1rem', color: MUTED, lineHeight: 1.8,
          maxWidth: 500, margin: '0 auto 3rem',
        }}>
          Tell us what you need. We match you with trusted locals, coordinate every detail, and keep you updated until it's done.
        </p>

        <a href="/travel" style={{
          display: 'inline-block', background: A, color: '#fff',
          padding: '0.9rem 2.5rem', borderRadius: 10,
          textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
          letterSpacing: '-0.01em',
        }}>
          Plan your visit →
        </a>
        <p style={{ fontSize: '0.76rem', color: FAINT, marginTop: '1rem' }}>
          Free to request · No signup required
        </p>
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '5rem 2.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: FAINT, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              The process
            </div>
            <h2 style={{
              fontSize: '2rem', fontWeight: 700, color: A,
              letterSpacing: '-0.025em', fontFamily: 'Georgia, serif', margin: 0,
            }}>
              Concierge-quality service,<br />without the overhead.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '3rem' }}>
            {HOW_IT_WORKS.map(item => (
              <div key={item.step}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: FAINT, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  {item.step}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.6rem', color: A, fontFamily: 'Georgia, serif', lineHeight: 1.3 }}>
                  {item.title}
                </div>
                <div style={{ color: MUTED, fontSize: '0.84rem', lineHeight: 1.75 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert network */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '5rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: FAINT, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Our network
            </div>
            <h2 style={{
              fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem',
              letterSpacing: '-0.025em', color: A, fontFamily: 'Georgia, serif', lineHeight: 1.2,
            }}>
              Real locals.<br />Not a marketplace.
            </h2>
            <p style={{ color: MUTED, lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Every expert is personally reviewed before their first job. You see who's doing the work, their track record, and exactly what they'll deliver — before anything is confirmed.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Vetted by our team', 'Human concierge review', 'Transparent pricing', 'No commitment to start'].map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: MUTED }}>
                  <span style={{ color: '#065f46', fontWeight: 700 }}>✓</span>
                  {b}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {EXPERT_TYPES.map(e => (
              <div key={e.label} style={{
                background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: '0.85rem 1rem', fontSize: '0.84rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '0.6rem', color: A,
              }}>
                <span style={{ fontSize: '1.1rem' }}>{e.icon}</span>
                <span>{e.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert CTA */}
      <section style={{ background: A, color: '#fff', padding: '6rem 2.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6f6560', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            For locals
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'Georgia, serif', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Are you a local expert?
          </h2>
          <p style={{ color: '#a8a29e', marginBottom: '2.5rem', lineHeight: 1.8, fontSize: '0.9rem' }}>
            Get matched with travelers who need exactly your skills. Every request comes with a clear brief. Fair, transparent pay.
          </p>
          <a href="/expert" style={{
            background: '#fff', color: A, padding: '0.85rem 2rem',
            borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
            display: 'inline-block',
          }}>
            Apply as an expert →
          </a>
        </div>
      </section>

      <footer style={{ background: A, borderTop: '1px solid #2d2926', padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ color: '#4a4440', fontSize: '0.78rem', fontFamily: 'Georgia, serif' }}>Local Butler</span>
        <a href="/dashboard" style={{ color: '#4a4440', fontSize: '0.76rem', textDecoration: 'none' }}>Admin</a>
      </footer>
    </div>
  );
}
