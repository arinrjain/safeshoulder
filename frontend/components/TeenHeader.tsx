'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

const ADMIN_EMAILS = ['arinrjain@gmail.com', 'rinishjain@yahoo.com'];

const NAV_LINKS = [
  { href: '/teen/support', label: 'Chat' },
  { href: '/teen/resources', label: 'Resources' },
  { href: '/teen/circles', label: 'Circles' },
  { href: '/teen/story', label: 'Story' },
  { href: '/teen/profile', label: '👤 Profile' },
];

export function TeenHeader() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
        padding: '1rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/teen" style={{ textDecoration: 'none', fontWeight: 'bold', color: 'var(--color-text)', fontSize: '1.25rem' }}>
          ← SafeShoulder
        </Link>

        {/* Desktop nav - hidden below md breakpoint */}
        <nav className="hidden md:flex" style={{ gap: '2rem', alignItems: 'center' }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={linkStyle}>
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" style={{
              textDecoration: 'none', color: 'white', backgroundColor: '#dc2626',
              padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: '600',
            }}>
              🔧 Admin
            </Link>
          )}
          <button
            onClick={handleSignOut}
            style={{
              backgroundColor: 'var(--color-text-secondary)', color: 'white', border: 'none',
              padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </nav>

        {/* Mobile hamburger toggle - hidden at md and up */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            lineHeight: 1,
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav
          className="md:hidden"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ ...linkStyle, padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)' }}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: 'none', color: 'white', backgroundColor: '#dc2626',
                padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: '600',
                textAlign: 'center', marginTop: '0.5rem',
              }}
            >
              🔧 Admin
            </Link>
          )}
          <button
            onClick={handleSignOut}
            style={{
              backgroundColor: 'var(--color-text-secondary)', color: 'white', border: 'none',
              padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', fontWeight: '600',
              cursor: 'pointer', marginTop: '0.5rem', textAlign: 'center',
            }}
          >
            Sign Out
          </button>
        </nav>
      )}
    </header>
  );
}
