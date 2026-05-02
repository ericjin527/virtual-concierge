import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ExpertLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/expert/sign-in');
  return <>{children}</>;
}
