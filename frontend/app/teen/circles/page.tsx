'use client';

import { useState, useEffect } from 'react';
import { TeenHeader } from '@/components/TeenHeader';

const circles = [
  {
    id: 5,
    name: 'Academic Stress & Pressure',
    emoji: '📚',
    members: 9,
    ambassadors: 2,
    focus: 'Exam pressure, grades, college stress',
    description: 'Dealing with academic pressure? Share tips and support each other through stressful times.',
    nextMeeting: 'Weekly on Sundays, 5 PM',
    status: 'Active',
  },
  {
    id: 1,
    name: 'Social Anxiety Support Squad',
    emoji: '😰',
    members: 4,
    ambassadors: 2,
    focus: 'Social anxiety, shyness, making friends',
    description: 'A safe space for teens dealing with social anxiety to share experiences and support each other.',
    nextMeeting: 'Weekly on Thursdays, 6 PM',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Bullying Survivors\' Circle',
    emoji: '💪',
    members: 8,
    ambassadors: 2,
    focus: 'Bullying, harassment, recovery',
    description: 'For teens who have experienced bullying. Share stories, strategies, and find strength in community.',
    nextMeeting: 'Weekly on Tuesdays, 5 PM',
    status: 'Active',
  },
  {
    id: 3,
    name: 'New at School Support',
    emoji: '🆕',
    members: 6,
    ambassadors: 1,
    focus: 'New student challenges, fitting in',
    description: 'Just joined a new school? Connect with others navigating the same transition.',
    nextMeeting: 'Bi-weekly on Saturdays, 4 PM',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Self-Esteem & Body Image',
    emoji: '💜',
    members: 7,
    ambassadors: 2,
    focus: 'Body image, self-worth, confidence',
    description: 'Building confidence and self-love in a supportive community.',
    nextMeeting: 'Bi-weekly on Fridays, 6 PM',
    status: 'Active',
  },
  {
    id: 4,
    name: 'LGBTQ+ Peer Support',
    emoji: '🌈',
    members: 5,
    ambassadors: 2,
    focus: 'Identity, acceptance, belonging',
    description: 'A confidential space for LGBTQ+ teens to connect and support each other.',
    nextMeeting: 'Weekly on Wednesdays, 7 PM',
    status: 'Active',
  },
];

export default function CirclesPage() {
  const [selectedCircle, setSelectedCircle] = useState<number | null>(null);
  const [joinedCircles, setJoinedCircles] = useState<Set<number>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('joinedCircles');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setJoinedCircles(new Set(arr));
      } catch (e) {
        console.error('Failed to load joined circles:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleJoinCircle = (circleId: number) => {
    const newJoined = new Set(joinedCircles);
    if (newJoined.has(circleId)) {
      newJoined.delete(circleId);
    } else {
      newJoined.add(circleId);
    }
    setJoinedCircles(newJoined);
    localStorage.setItem('joinedCircles', JSON.stringify(Array.from(newJoined)));
  };

  return (
    <div style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', minHeight: '100vh' }}>
      <TeenHeader />
      <div style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>👥 Peer Support Circles</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
            Safe communities led by trained student ambassadors. You're not alone.
          </p>
        </div>

        {/* My Circles Section */}
        {isLoaded && joinedCircles.size > 0 && (
          <div style={{
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            marginBottom: '2rem',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>My Circles</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {circles.filter(c => joinedCircles.has(c.id)).map(circle => (
                <a
                  key={circle.id}
                  href={`/teen/circles/${circle.id}`}
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {circle.emoji} {circle.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          marginBottom: '2rem',
          borderLeft: '4px solid var(--color-primary)',
        }}>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
            Our peer support circles bring teens together around shared experiences. Each circle is led by trained student ambassadors who create a confidential, judgment-free space where you can share, listen, and grow together.
          </p>
        </div>

        {/* Circles Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {circles.map((circle) => (
            <div
              key={circle.id}
              onClick={() => setSelectedCircle(selectedCircle === circle.id ? null : circle.id)}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: selectedCircle === circle.id ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: selectedCircle === circle.id ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                borderTop: selectedCircle === circle.id ? '3px solid var(--color-primary)' : '1px solid var(--color-border)',
              }}
            >
              {/* Circle Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>{circle.emoji}</div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {circle.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      <span>👥 {circle.members} members</span>
                      <span>🌟 {circle.ambassadors} ambassador{circle.ambassadors > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  color: 'var(--color-secondary)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}>
                  {circle.status}
                </div>
              </div>

              {/* Focus */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <strong>Focus:</strong> {circle.focus}
                </p>
              </div>

              {/* Description - Always visible */}
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                {circle.description}
              </p>

              {/* Expanded content */}
              {selectedCircle === circle.id && (
                <div style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-border)',
                  marginTop: '1rem',
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                      <strong>Next Meeting:</strong> {circle.nextMeeting}
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoinCircle(circle.id)}
                    style={{
                      backgroundColor: joinedCircles.has(circle.id) ? '#dc2626' : 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {joinedCircles.has(circle.id) ? 'Leave Circle' : 'Join Circle'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          borderLeft: '4px solid var(--color-secondary)',
        }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            Don't see your circle?
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '1rem' }}>
            Tell Aisha what you'd like to talk about. We might start a new circle around your needs.
          </p>
          <a
            href="/teen/support"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-secondary)',
              color: 'white',
              padding: '1rem 2.5rem',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.125rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Chat with Aisha →
          </a>
        </div>
        </div>
      </div>
    </div>
  );
}
