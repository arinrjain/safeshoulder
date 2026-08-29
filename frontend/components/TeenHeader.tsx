'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

const ADMIN_EMAILS = ['arinrjain@gmail.com', 'rinishjain@yahoo.com'];

export function TeenHeader() {
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

  return (
    <header style={{
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: '1rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/teen" style={{ textDecoration: 'none', fontWeight: 'bold', color: 'var(--color-text)', fontSize: '1.25rem' }}>
          ← SafeShoulder
        </Link>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/teen/support" style={{ textDecoration: 'none', color: 'var(--color-text)', fontSize: '0.95rem', transition: 'all 0.2s' }}>Chat</Link>
          <Link href="/teen/resources" style={{ textDecoration: 'none', color: 'var(--color-text)', fontSize: '0.95rem', transition: 'all 0.2s' }}>Resources</Link>
          <Link href="/teen/circles" style={{ textDecoration: 'none', color: 'var(--color-text)', fontSize: '0.95rem', transition: 'all 0.2s' }}>Circles</Link>
          <Link href="/teen/story" style={{ textDecoration: 'none', color: 'var(--color-text)', fontSize: '0.95rem', transition: 'all 0.2s' }}>Story</Link>
          {isAdmin && (
            <Link href="/admin" style={{
              textDecoration: 'none',
              color: 'white',
              backgroundColor: '#dc2626',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}>
              🔧 Admin
            </Link>
          )}
          <button
            onClick={handleSignOut}
            style={{
              backgroundColor: 'var(--color-text-secondary)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-text-secondary)';
            }}
          >
            Sign Out
          </button>
        </nav>
      </div>
    </header>
  );
}
