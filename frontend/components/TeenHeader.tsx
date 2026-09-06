'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

const ADMIN_EMAILS = ['arinrjain@gmail.com', 'rinishjain@yahoo.com'];

const NAV_LINKS = [
  { href: '/teen/support', label: 'Chat' },
  { href: '/teen/resources', label: 'Resources' },
  { href: '/teen/circles', label: 'Circles' },
  { href: '/teen/story', label: 'Story' },
];

export function TeenHeader() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email && ADMIN_EMAILS.includes(data.session.user.email)) {
        setIsAdmin(true);
      }
    });
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const linkStyle = {
    textDecoration: 'none',
    color: 'var(--color-text)',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.75rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top row: back, home, and (desktop only) full nav + account actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              title="Go back"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text)',
                fontSize: '1.75rem',
                cursor: 'pointer',
                padding: '0.15rem 0.4rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ←
            </button>
            <Link href="/teen" title="Home" style={{ textDecoration: 'none', fontWeight: 'bold', color: 'var(--color-text)', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🏠</span>
              <span className="hidden md:inline">SafeShoulder</span>
            </Link>
          </div>

          {/* Desktop nav - hidden below md breakpoint, primary links shown directly */}
          <nav className="hidden md:flex" style={{ gap: '1.5rem', alignItems: 'center' }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} style={linkStyle}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAdmin && (
              <Link href="/admin" title="Admin" style={{
                textDecoration: 'none', color: 'white', backgroundColor: '#dc2626',
                padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: '600',
              }}>
                🔧<span className="hidden md:inline"> Admin</span>
              </Link>
            )}
            <Link href="/teen/profile" title="Profile" style={{ textDecoration: 'none', color: 'var(--color-text)', fontSize: '1.3rem', display: 'flex', alignItems: 'center' }}>
              👤
            </Link>
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{
                border: 'none',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                padding: 0,
              }}
            >
              <span
                className="md:hidden"
                style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', background: 'none' }}
              >
                🚪
              </span>
              <span
                className="hidden md:inline"
                style={{
                  backgroundColor: 'var(--color-text-secondary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                Sign Out
              </span>
            </button>
          </div>
        </div>

        {/* Second row: primary nav, always visible on mobile - no hamburger, no digging */}
        <nav
          className="flex md:hidden"
          style={{
            justifyContent: 'space-between',
            marginTop: '0.65rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ ...linkStyle, fontSize: '0.85rem', textAlign: 'center', flex: 1, padding: '0.25rem' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
