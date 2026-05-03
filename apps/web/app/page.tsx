const HOW_IT_WORKS = [
  { step: '01', title: 'Tell us what you need', desc: 'Choose full service delegation or pick specific tasks. Just a few fields — no long forms.' },
  { step: '02', title: 'We build your plan', desc: 'Our AI drafts a detailed service plan. Chat with the butler to refine anything before confirming.' },
  { step: '03', title: 'Locals execute', desc: 'Vetted Bay Area experts handle each task. You see who\'s working and track progress in real time.' },
  { step: '04', title: 'You receive the result', desc: 'Each expert submits their deliverable — reservation confirmation, photo link, pickup details — directly to you.' },
];

const EXPERT_TYPES = [
  { icon: '🚗', label: 'Drivers' },
  { icon: '🍽️', label: 'Restaurant experts' },
  { icon: '🗺️', label: 'Local guides' },
  { icon: '📷', label: 'Photographers' },
  { icon: '📦', label: 'Errand helpers' },
  { icon: '👨‍🍳', label: 'Private chefs' },
  { icon: '🎉', label: 'Event helpers' },
  { icon: '👨‍👧', label: 'Family support' },
];

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1714', background: '#faf9f6' }}>

      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid #e8e2da', padding: '1rem 2.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#fff', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', color: '#1a1714', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
          Local Butler
        </a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/travel" style={{ color: '#6f6560', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>Plan a visit</a>
          <a href="/expert" style={{ color: '#6f6560', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>For experts</a>
          <a href="/travel" style={{
            background: '#1a1714', color: '#fff', padding: '0.45rem 1.1rem',
            borderRadius: 8, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
          }}>
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '6rem 2.5rem 4rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', background: '#f2ede6', color: '#92400e',
          fontSize: '0.72rem', fontWeight: 700, padding: '4px 14px', borderRadius: 99,
          marginBottom: '1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Bay Area Pilot
        </div>
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.08,
          marginBottom: '1.25rem', letterSpacing: '-0.03em', color: '#1a1714',
          fontFamily: 'Georgia, serif',
        }}>
          A personal concierge<br />for your Bay Area visit.
        </h1>
        <p style={{
          fontSize: '1.05rem', color: '#6f6560', lineHeight: 1.75,
          maxWidth: 520, margin: '0 auto 3rem',
        }}>
          Tell us what you need. We match you with trusted locals, coordinate every detail, and keep you updated until it's done.
        </p>

        {/* Two CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', maxWidth: 620, margin: '0 auto 1.25rem' }}>
          <a href="/travel" style={{
            display: 'block', padding: '2rem', background: '#1a1714', color: '#fff',
            borderRadius: 14, textDecoration: 'none', textAlign: 'left',
          }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>✈️</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>
              Visiting the Bay Area?
            </div>
            <div style={{ color: '#a8a29e', fontSize: '0.84rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              Restaurants, drivers, guides, errands, photographers — we handle your whole stay.
            </div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>Plan your visit →</div>
          </a>
          <a href="/travel" style={{
            display: 'block', padding: '2rem', background: '#fff',
            border: '1px solid #e8e2da', color: '#1a1714', borderRadius: 14, textDecoration: 'none', textAlign: 'left',
          }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🏠</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>
              Hosting someone?
            </div>
            <div style={{ color: '#6f6560', fontSize: '0.84rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              Cleaner, florist, private chef, photographer — we coordinate the perfect hosting experience.
            </div>
            <div style={{ color: '#1a1714', fontWeight: 600, fontSize: '0.88rem' }}>Plan your event →</div>
          </a>
        </div>
        <p style={{ fontSize: '0.76rem', color: '#a8a29e' }}>Free to request · No signup required · Bay Area only for now</p>
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', borderTop: '1px solid #e8e2da', borderBottom: '1px solid #e8e2da', padding: '5rem 2.5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, marginBottom: '3.5rem',
            letterSpacing: '-0.025em', color: '#1a1714', fontFamily: 'Georgia, serif',
          }}>
            How it works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem' }}>
            {HOW_IT_WORKS.map(item => (
              <div key={item.step}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a8a29e', letterSpacing: '0.09em', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
                  {item.step}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', color: '#1a1714', fontFamily: 'Georgia, serif' }}>
                  {item.title}
                </div>
                <div style={{ color: '#6f6560', fontSize: '0.84rem', lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert types */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '5rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h2 style={{
              fontSize: '1.65rem', fontWeight: 700, marginBottom: '1rem',
              letterSpacing: '-0.025em', color: '#1a1714', fontFamily: 'Georgia, serif',
            }}>
              Real locals. Not a marketplace.
            </h2>
            <p style={{ color: '#6f6560', lineHeight: 1.75, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Every expert is personally reviewed before their first job. You see who's doing the work, their track record, and exactly what they'll deliver — before anything is confirmed.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Vetted by our team', 'Bay Area coverage', 'Human concierge review', 'Transparent pricing'].map(b => (
                <span key={b} style={{
                  background: '#f2ede6', padding: '4px 12px', borderRadius: 99,
                  fontSize: '0.76rem', fontWeight: 600, color: '#6f6560',
                }}>
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {EXPERT_TYPES.map(e => (
              <div key={e.label} style={{
                background: '#fff', border: '1px solid #e8e2da', borderRadius: 10,
                padding: '0.75rem 1rem', fontSize: '0.84rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a1714',
              }}>
                <span>{e.icon}</span>
                <span>{e.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert CTA */}
      <section style={{ background: '#1a1714', color: '#fff', padding: '5rem 2.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'Georgia, serif', letterSpacing: '-0.025em' }}>
            Are you a local expert?
          </h2>
          <p style={{ color: '#a8a29e', marginBottom: '2rem', lineHeight: 1.75, fontSize: '0.9rem' }}>
            Get matched with high-intent travelers. Every request comes with a clear brief and fair pay. Founding experts get a free profile.
          </p>
          <a href="/expert" style={{
            background: '#fff', color: '#1a1714', padding: '0.8rem 2rem',
            borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
            display: 'inline-block',
          }}>
            Apply as a founding expert →
          </a>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #2d2926', background: '#1a1714', padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ color: '#6f6560', fontSize: '0.78rem', fontFamily: 'Georgia, serif' }}>Local Butler</span>
        <span style={{ color: '#4a4440', fontSize: '0.76rem' }}>Bay Area pilot · 2025</span>
      </footer>
    </div>
  );
}
