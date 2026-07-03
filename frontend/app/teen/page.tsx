'use client';

import Link from 'next/link';
import { useState } from 'react';

const features = [
  {
    id: 1,
    icon: '📋',
    title: 'Daily Safety Check-Ins',
    description: 'Track how safe, supported, and resilient you feel each day. AI learns your patterns and offers personalized coping strategies.',
    color: '#06B6D4',
  },
  {
    id: 2,
    icon: '📖',
    title: 'My Story',
    description: 'Keep a private journal of your experiences, wins, and growth. See patterns in your journey and celebrate progress.',
    color: '#7C3AED',
  },
  {
    id: 3,
    icon: '🤗',
    title: 'Nidhi Companion',
    description: '24/7 AI trained to listen, validate, and help you navigate bullying, peer pressure, and social challenges. Always here.',
    color: '#7C3AED',
  },
  {
    id: 4,
    icon: '👥',
    title: 'Peer Support Circles',
    description: 'Safe groups with trained student ambassadors. Share experiences, support each other, know you\'re not alone.',
    color: '#EC4899',
  },
  {
    id: 5,
    icon: '📊',
    title: 'Pattern Detection',
    description: 'ML model identifies escalation signs early. Get alerts and resources before things get worse.',
    color: '#06B6D4',
  },
  {
    id: 6,
    icon: '📈',
    title: 'School Dashboard',
    description: 'Real-time wellness insights for counselors and administrators. Support more students, catch issues early.',
    color: '#06B6D4',
  },
  {
    id: 7,
    icon: '💜',
    title: 'Parent Guide',
    description: 'Help your parents understand bullying and how to support you. Weekly updates (privacy-protected).',
    color: '#EC4899',
  },
  {
    id: 8,
    icon: '📚',
    title: 'Resource Library',
    description: 'Strategies, school policies, hotlines, articles. Everything you need to navigate peer challenges.',
    color: '#06B6D4',
  },
];

export default function TeenHomePage() {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  return (
    <div style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      {/* Hero Section */}
      <section style={{ padding: '4rem 1.5rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: '9999px', marginBottom: '1rem', color: '#7C3AED', fontSize: '0.875rem', fontWeight: '600' }}>
            ✨ Always Online
          </div>

          <h1 style={{ fontSize: 'var(--font-size-heading-xl)', marginBottom: '1.5rem', color: 'var(--color-text)' }}>
            Meet Nidhi —<br />
            Your 24/7 Bullying Support Companion
          </h1>

          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: '1.8', maxWidth: '700px', margin: '0 auto 2rem' }}>
            Not just a chatbot. Nidhi is trained to listen, validate, and help you navigate peer challenges, bullying, and social stress. You're not alone.
          </p>

          <Link
            href="/teen/support"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              padding: '1rem 2.5rem',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.125rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#6D28D9';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Start Talking to Nidhi →
          </Link>

          {/* Demo Chat */}
          <div
            style={{
              marginTop: '3rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              border: '1px solid var(--color-border)',
              maxWidth: '600px',
              margin: '3rem auto 0',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '70%',
                  borderBottomLeftRadius: 0,
                }}
              >
                I feel like everyone hates me at school
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--color-surface-hover)',
                  color: 'var(--color-text)',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '70%',
                  borderBottomRightRadius: 0,
                  border: '1px solid var(--color-border)',
                }}
              >
                That feeling is really painful, and I hear you. You're reaching out, which takes courage. Let's figure out what's actually going on. 💙
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '70%',
                  borderBottomLeftRadius: 0,
                }}
              >
                How do I deal with this?
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start' }}>
              <div
                style={{
                  backgroundColor: 'var(--color-surface-hover)',
                  color: 'var(--color-text)',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '70%',
                  borderBottomRightRadius: 0,
                  border: '1px solid var(--color-border)',
                }}
              >
                <strong>Here's what we can do:</strong>
                <div style={{ marginTop: '0.5rem', textAlign: 'left' }}>
                  • Figure out what's really happening (facts vs. feelings)<br />
                  • Build your support squad<br />
                  • Learn ways to handle it
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'var(--font-size-heading-lg)', marginBottom: '0.5rem' }}>Everything You Need</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
              Support, resources, and community—all in one place
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {features.map((feature) => (
              <div
                key={feature.id}
                onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderLeft: `4px solid ${feature.color}`,
                  transform: selectedFeature === feature.id ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: selectedFeature === feature.id ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          padding: '4rem 1.5rem',
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>10K+</div>
            <p style={{ color: 'var(--color-text-secondary)' }}>Students Supported</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>500+</div>
            <p style={{ color: 'var(--color-text-secondary)' }}>Peer Circles</p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>100+</div>
            <p style={{ color: 'var(--color-text-secondary)' }}>Resources</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'var(--font-size-heading-lg)', marginBottom: '1rem' }}>Ready to Get Support?</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
            You deserve to feel safe and supported. Let's talk.
          </p>
          <Link
            href="/teen/support"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              padding: '1rem 2.5rem',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.125rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#6D28D9';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Start Your Journey →
          </Link>
        </div>
      </section>

      {/* Safety Notice */}
      <section
        style={{
          padding: '3rem 1.5rem',
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.8' }}>
            ✨ <strong>Your privacy is protected</strong> — All conversations are confidential and encrypted. You can talk freely.
            <br />
            💙 <strong>Professional support available</strong> — If you need more help, connect with a certified therapist anytime.
            <br />
            🆘 <strong>Crisis support</strong> — If you're in crisis, we'll connect you with emergency resources immediately.
          </p>
        </div>
      </section>
    </div>
  );
}
