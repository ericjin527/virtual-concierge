import { UserButton } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
          Virtual Concierge
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <a href="/dashboard">Overview</a>
          <a href="/dashboard/experiences">Experiences</a>
          <a href="/dashboard/tasks">Tasks</a>
          <a href="/dashboard/applications">Applications</a>
          <a href="/dashboard/businesses">Businesses</a>
          <UserButton />
        </nav>
      </header>
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
    </div>
  );
}
