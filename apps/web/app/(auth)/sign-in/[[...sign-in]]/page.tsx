import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#faf9f6',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', color: '#1a1714', fontFamily: 'Georgia, serif' }}>
          Local Butler
        </a>
        <p style={{ color: '#6f6560', marginTop: '0.4rem', fontSize: '0.88rem' }}>Sign in to your account</p>
      </div>
      <SignIn fallbackRedirectUrl="/portal" />
    </div>
  );
}
