'use client';

import Link from 'next/link';

export function TeenHeader() {
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
        </nav>
      </div>
    </header>
  );
}
