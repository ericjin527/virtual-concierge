import { UserButton } from '@clerk/nextjs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
          Virtual Concierge
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <a href="/dashboard">Overview</a>
          <a href="/dashboard/businesses">Businesses</a>
          <a href="/dashboard/booking-requests">Bookings</a>
          <a href="/dashboard/usage">Usage</a>
          <UserButton afterSignOutUrl="/sign-in" />
        </nav>
      </header>
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
    </div>
  );
}
