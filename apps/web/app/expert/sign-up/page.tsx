import { SignUp } from '@clerk/nextjs';

export default function ExpertSignUp() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', color: '#111' }}>Local Butler</a>
        <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.9rem' }}>Create your expert account</p>
      </div>
      <SignUp afterSignUpUrl="/expert/onboarding" signInUrl="/expert/sign-in" />
    </div>
  );
}
