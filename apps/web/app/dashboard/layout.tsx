import AdminNav from '../../components/AdminNav';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#faf9f6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <AdminNav />
      <main style={{ flex: 1, marginLeft: 232, padding: '2.5rem 3rem', minWidth: 0 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
