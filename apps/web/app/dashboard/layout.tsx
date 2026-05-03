import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminNav from '../../components/AdminNav';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/dashboard');

  const adminId = process.env.ADMIN_CLERK_USER_ID;
  if (adminId && userId !== adminId) {
    // User is logged in but not the admin — send them to their own portal
    redirect('/');
  }

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
