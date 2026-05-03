import { SignUp } from '@clerk/nextjs';

export default function CustomerSignUp() {
  return (
    <div style={{
      minHeight: '100vh', background: '#faf9f6',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', color: '#1a1714', fontFamily: 'Georgia, serif' }}>
          Local Butler
        </a>
        <p style={{ color: '#6f6560', marginTop: '0.4rem', fontSize: '0.88rem' }}>Create an account to track your bookings</p>
      </div>
      <SignUp afterSignUpUrl="/account" signInUrl="/account/sign-in" />
    </div>
  );
}
