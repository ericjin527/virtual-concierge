import { UserButton } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#fafafa' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 2rem', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="/" style={{ fontWeight: 800, fontSize: '1rem', textDecoration: 'none', color: '#111', letterSpacing: '-0.01em' }}>Local Butler</a>
          <nav style={{ display: 'flex', gap: '1.25rem', fontSize: '0.875rem' }}>
            <a href="/dashboard/experiences" style={{ color: '#374151', textDecoration: 'none', fontWeight: 500 }}>Experiences</a>
            <a href="/dashboard/tasks" style={{ color: '#374151', textDecoration: 'none', fontWeight: 500 }}>Tasks</a>
            <a href="/dashboard/applications" style={{ color: '#374151', textDecoration: 'none', fontWeight: 500 }}>Applications</a>
          </nav>
        </div>
        <UserButton />
      </header>
      <main style={{ flex: 1, padding: '2rem', maxWidth: 1100, width: '100%', margin: '0 auto' }}>{children}</main>
    </div>
  );
}
