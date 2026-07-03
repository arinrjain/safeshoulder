'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TeenNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const navItems = [
    { href: '/teen', label: '🏠 Home', icon: '🏠' },
    { href: '/teen/support', label: '💬 My Support', icon: '💬' },
    { href: '/teen/story', label: '📖 My Story', icon: '📖' },
    { href: '/teen/circles', label: '👥 Peer Circles', icon: '👥' },
    { href: '/teen/resources', label: '📚 Resources', icon: '📚' },
  ];

  return (
    <nav className="teen-nav" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <Link href="/teen" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)', textDecoration: 'none' }}>
          🤗 SafeShoulder
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex" style={{ gap: '2rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: isActive(item.href) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontWeight: isActive(item.href) ? '600' : '400',
                borderBottom: isActive(item.href) ? '2px solid var(--color-primary)' : 'none',
                paddingBottom: '0.5rem',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/profile" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
            👤
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {sidebarOpen && (
        <div style={{ backgroundColor: 'var(--color-background)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              style={{
                color: isActive(item.href) ? 'var(--color-primary)' : 'var(--color-text)',
                textDecoration: 'none',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: isActive(item.href) ? 'var(--color-surface)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
