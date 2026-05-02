const HOW_IT_WORKS = [
  { icon: '💬', title: 'Tell the butler', desc: 'Select what you need and share a few quick details. No long forms.' },
  { icon: '🧠', title: 'We plan it', desc: 'AI creates a task breakdown. Our team reviews and sources trusted local experts.' },
  { icon: '🤝', title: 'Locals execute', desc: 'Verified experts handle each task. You track progress in real time.' },
  { icon: '✅', title: 'Receive your agenda', desc: 'Once everything is confirmed, you get a complete itinerary.' },
];

const TRUST_BADGES = ['Vetted local experts', 'Bay Area coverage', 'Human concierge review', 'Transparent pricing', 'No commitment to start'];

const EXPERT_TYPES = ['🚗 Drivers', '🍽️ Restaurant experts', '🗺️ Local guides', '📷 Photographers', '📦 Errand helpers', '👨‍🍳 Private chefs', '🎉 Event helpers', '👨‍👧 Family support'];

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', flexWrap: 'wrap', gap: '0.75rem' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.15rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/travel" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Plan a visit</a>
          <a href="/join" style={{ background: '#111', color: '#fff', padding: '0.45rem 1rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Join as expert</a>
          <a href="/dashboard" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.8rem' }}>Admin</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '5rem 2rem 3.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#f3f4f6', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, padding: '4px 12px', borderRadius: 99, marginBottom: '1.25rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Bay Area Pilot
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.1rem', letterSpacing: '-0.02em' }}>
          A butler in your pocket.<br />Trusted locals at your door.
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 2.5rem' }}>
          Tell us what you need. We match you with trusted Bay Area locals, coordinate everything, and keep you updated until it&apos;s done.
        </p>

        {/* Two product CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', maxWidth: 620, margin: '0 auto' }}>
          <a href="/travel" style={{ display: 'block', padding: '1.75rem', background: '#111', color: '#fff', borderRadius: 12, textDecoration: 'none', textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>✈️</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>Visiting the Bay Area?</div>
            <div style={{ color: '#9ca3af', fontSize: '0.87rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Restaurants, drivers, guides, errands, photographers — we handle your whole stay.
            </div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Plan your visit →</div>
          </a>
          <a href="/travel" style={{ display: 'block', padding: '1.75rem', background: '#fff', border: '2px solid #111', color: '#111', borderRadius: 12, textDecoration: 'none', textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>🏠</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>Hosting someone?</div>
            <div style={{ color: '#6b7280', fontSize: '0.87rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Cleaner, florist, private chef, photographer — we coordinate the perfect hosting moment.
            </div>
            <div style={{ color: '#111', fontWeight: 700, fontSize: '0.9rem' }}>Plan your event →</div>
          </a>
        </div>

        <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '1.25rem' }}>Free to request · No signup required · Bay Area only (for now)</p>
      </section>

      {/* How it works */}
      <section style={{ background: '#f9fafb', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.95rem' }}>{item.title}</div>
                <div style={{ color: '#6b7280', fontSize: '0.84rem', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert network */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Real locals. Not a marketplace.</h2>
            <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.92rem' }}>
              Every expert is reviewed and vetted by our team before their first job. You see who&apos;s doing the work, their reviews, and what they&apos;ll do — before anything is confirmed.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {TRUST_BADGES.map(b => (
                <span key={b} style={{ background: '#f3f4f6', padding: '3px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600 }}>✓ {b}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {EXPERT_TYPES.map(e => (
              <div key={e} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.6rem 0.75rem', fontSize: '0.83rem', fontWeight: 500 }}>{e}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert CTA */}
      <section style={{ background: '#111', color: '#fff', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Are you a local expert?</h2>
          <p style={{ color: '#9ca3af', marginBottom: '1.75rem', lineHeight: 1.7, fontSize: '0.92rem' }}>
            Get matched with high-intent local customers. Every request comes with a clear brief. Founding experts get a free profile.
          </p>
          <a href="/join" style={{ background: '#fff', color: '#111', padding: '0.75rem 1.75rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', display: 'inline-block' }}>
            Apply as a founding expert →
          </a>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '1.5rem 2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.78rem' }}>
        Local Butler Network · Bay Area pilot · <a href="/dashboard" style={{ color: '#9ca3af' }}>Admin</a>
      </footer>
    </div>
  );
}
