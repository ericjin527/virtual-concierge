'use client';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

const NAV_GROUPS = [
  {
    section: null,
    items: [{ href: '/dashboard', label: 'Overview', exact: true }],
  },
  {
    section: 'Butler Network',
    items: [
      { href: '/dashboard/experts', label: 'Experts', exact: false },
      { href: '/dashboard/tasks', label: 'Tasks', exact: false },
      { href: '/dashboard/experiences', label: 'Experiences', exact: false },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 232, background: '#fff', borderRight: '1px solid #e8e2da',
      display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 20,
    }}>
      <div style={{ padding: '1.5rem 1.5rem 1.25rem', borderBottom: '1px solid #e8e2da' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a1714', letterSpacing: '-0.02em', fontFamily: 'Georgia, serif' }}>
            Local Butler
          </div>
          <div style={{ fontSize: '0.68rem', color: '#a8a29e', letterSpacing: '0.09em', textTransform: 'uppercase', marginTop: 2, fontFamily: 'system-ui, sans-serif' }}>
            Admin
          </div>
        </a>
      </div>

      <nav style={{ flex: 1, padding: '1.25rem 0.75rem', overflowY: 'auto', fontFamily: 'system-ui, sans-serif' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '1.5rem' }}>
            {group.section && (
              <div style={{
                fontSize: '0.67rem', fontWeight: 700, color: '#a8a29e',
                letterSpacing: '0.09em', textTransform: 'uppercase',
                padding: '0 0.75rem', marginBottom: '0.35rem',
              }}>
                {group.section}
              </div>
            )}
            {group.items.map(item => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <a key={item.href} href={item.href} style={{
                  display: 'block', padding: '0.45rem 0.75rem', borderRadius: 7,
                  textDecoration: 'none', fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#1a1714' : '#6f6560',
                  background: active ? '#f2ede6' : 'transparent',
                  marginBottom: '0.1rem', transition: 'background 0.1s',
                }}>
                  {item.label}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e8e2da', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <UserButton />
        <span style={{ fontSize: '0.78rem', color: '#a8a29e', fontFamily: 'system-ui, sans-serif' }}>Admin</span>
      </div>
    </aside>
  );
}
