'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  {
    slug: 'appliance-repair',
    icon: '🔧',
    title: 'Appliance Repair',
    desc: 'Fridge, washer, dryer, dishwasher, oven — diagnosed and fixed by trusted local technicians.',
    examples: ['My fridge stopped cooling', 'Washer makes a loud noise', 'Dryer won\'t turn on'],
  },
  {
    slug: 'events',
    icon: '🎉',
    title: 'Event Venue Booking',
    desc: 'Birthday dinners, baby showers, company events — we find and coordinate the right local venue.',
    examples: ['Restaurant for 25 people', 'Private room for dinner', 'Kids birthday venue'],
  },
  {
    slug: 'parenting',
    icon: '👨‍👧',
    title: 'Parenting Logistics',
    desc: 'School pickup, after-school care, backup childcare — connected to certified local providers.',
    examples: ['School pickup Friday', 'Recurring after-school care', 'Backup childcare this week'],
  },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Tell the butler', desc: 'Describe what you need in plain language. No forms, no searching.' },
  { step: '2', title: 'We match you', desc: 'AI collects the right details and finds trusted local experts in your area.' },
  { step: '3', title: 'Confirm & book', desc: 'Review your expert\'s profile, approve the quote, and they handle the rest.' },
  { step: '4', title: 'Done & reviewed', desc: 'Job complete. Leave a review that helps others find great local help.' },
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState('');

  function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/request?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/appliance-repair" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>Appliance Repair</a>
          <a href="/events" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>Events</a>
          <a href="/parenting" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>Parenting</a>
          <a href="/join" style={{ background: '#111', color: '#fff', padding: '0.45rem 1rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Join as expert</a>
          <a href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.85rem' }}>Admin</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '5rem 2rem 3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
          A butler in your pocket.<br />Trusted locals at your door.
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>
          Tell us what you need. We collect the right details, match you with a trusted local expert, and coordinate everything.
        </p>
        <form onSubmit={handleRequest} style={{ display: 'flex', gap: '0.5rem', maxWidth: 560, margin: '0 auto' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="My fridge stopped cooling..."
            style={{ flex: 1, padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: '1rem', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '0.75rem 1.25rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Get help →
          </button>
        </form>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.75rem' }}>Free to request · No signup required</p>
      </section>

      {/* How it works */}
      <section style={{ background: '#f9fafb', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, margin: '0 auto 0.75rem' }}>{item.step}</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                <div style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two main products */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>Two ways to use Local Butler</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <a href="/travel" style={{ border: '2px solid #111', borderRadius: 12, padding: '2rem', textDecoration: 'none', color: '#111', display: 'block' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✈️</div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.5rem' }}>Local Experience Butler</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Visiting the Bay Area? We handle the ground experience — restaurants, drivers, guides, errands, family support, and business-trip logistics.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
              {['Business trips', 'Family visits', 'Special occasions', 'Executive stays'].map(ex => (
                <span key={ex} style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', color: '#374151' }}>{ex}</span>
              ))}
            </div>
            <span style={{ background: '#111', color: '#fff', padding: '0.5rem 1.1rem', borderRadius: 8, fontSize: '0.88rem', fontWeight: 700 }}>Plan your visit →</span>
          </a>
          <a href="/request" style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '2rem', textDecoration: 'none', color: '#111', display: 'block' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏠</div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.5rem' }}>Home & Local Services</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Need something fixed or sorted at home? Appliance repair, event help, parenting logistics — handled by trusted local experts.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
              {['Appliance repair', 'Event booking', 'Parenting logistics'].map(ex => (
                <span key={ex} style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', color: '#374151' }}>{ex}</span>
              ))}
            </div>
            <span style={{ background: '#f3f4f6', color: '#111', padding: '0.5rem 1.1rem', borderRadius: 8, fontSize: '0.88rem', fontWeight: 700 }}>Get help →</span>
          </a>
        </div>
      </section>

      {/* Services detail */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 2rem 3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center', color: '#6b7280' }}>More ways we help</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {CATEGORIES.map(cat => (
            <a key={cat.slug} href={`/${cat.slug}`} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', textDecoration: 'none', color: '#111', display: 'block' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>{cat.title}</div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>{cat.desc}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {cat.examples.map(ex => (
                  <span key={ex} style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', color: '#374151' }}>{ex}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section style={{ background: '#f9fafb', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Trust is the product</h2>
          <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: '1.5rem' }}>Every expert on Local Butler is reviewed and vetted. You see who's doing the work, their certifications, and their reviews — before you confirm anything.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['Verified profiles', 'Licensed & certified', 'Transparent pricing', 'Secure payments', 'Human escalation'].map(t => (
              <span key={t} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '0.4rem 0.9rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600 }}>✓ {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Expert CTA */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>Are you a local expert?</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.25rem', lineHeight: 1.6 }}>Get better-qualified leads, reduce back-and-forth, and build your local reputation. Founding experts get a free profile and early access to customers.</p>
        <a href="/join" style={{ background: '#111', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', display: 'inline-block' }}>
          Apply as an expert →
        </a>
      </section>

      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '1.5rem 2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
        Local Butler Network · Bay Area pilot · <a href="/trust" style={{ color: '#9ca3af' }}>Trust & Safety</a>
      </footer>
    </div>
  );
}
