import { auth, currentUser } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Manage your spa businesses, review booking requests, and track usage.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Businesses', href: '/dashboard/businesses', desc: 'Configure spas, services, and staff' },
          { label: 'Booking Requests', href: '/dashboard/booking-requests', desc: 'Confirm, decline, or suggest alternatives' },
          { label: 'Skills Files', href: '/dashboard/skills', desc: 'Generate and publish AI skills' },
          { label: 'Usage & Costs', href: '/dashboard/usage', desc: 'Track calls, SMS, and AI costs' },
        ].map((card) => (
          <a
            key={card.href}
            href={card.href}
            style={{
              display: 'block',
              padding: '1.25rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{card.label}</div>
            <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{card.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
