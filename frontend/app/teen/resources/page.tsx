'use client';

import Link from 'next/link';
import { TeenHeader } from '@/components/TeenHeader';

const resources = [
  {
    id: 1,
    category: 'Coping Strategies',
    icon: '💪',
    title: 'How to Handle Cyberbullying',
    description: 'Practical steps to deal with online harassment and protect yourself.',
    color: '#06B6D4',
  },
  {
    id: 2,
    category: 'Coping Strategies',
    icon: '🧠',
    title: '10 Coping Strategies That Actually Work',
    description: 'Evidence-based techniques to manage stress and anxiety at school.',
    color: '#06B6D4',
  },
  {
    id: 9,
    category: 'Exam Prep',
    icon: '🎯',
    title: 'Beating Exam Anxiety',
    description: 'What to do before, during, and after exams when the nerves hit hard.',
    color: '#10B981',
  },
  {
    id: 10,
    category: 'Academic Stress',
    icon: '📚',
    title: 'Managing Academic Pressure Without Burning Out',
    description: 'Where the pressure really comes from, and how to carry it without breaking.',
    color: '#10B981',
  },
  {
    id: 11,
    category: 'Peer Pressure',
    icon: '🙅',
    title: 'How to Say No to Peer Pressure',
    description: 'Scripts and strategies for holding your ground without losing your friends.',
    color: '#F59E0B',
  },
  {
    id: 13,
    category: 'Social Anxiety',
    icon: '😰',
    title: 'Navigating Social Anxiety at School',
    description: 'Why crowded hallways and group work feel so hard, and small steps that help.',
    color: '#F59E0B',
  },
  {
    id: 3,
    category: 'Understanding',
    icon: '🤔',
    title: 'Why Do Bullies Bully?',
    description: 'Understanding the psychology behind bullying behavior.',
    color: '#7C3AED',
  },
  {
    id: 4,
    category: 'Communication',
    icon: '💬',
    title: 'How to Talk to Your Parents About Bullying',
    description: 'Tips for having difficult conversations with family members.',
    color: '#EC4899',
  },
  {
    id: 5,
    category: 'Rights & Policies',
    icon: '📋',
    title: 'Know Your School\'s Anti-Bullying Policy',
    description: 'Understand your rights and what your school must do to protect you.',
    color: '#06B6D4',
  },
  {
    id: 6,
    category: 'Support Network',
    icon: '👥',
    title: 'Building Your Support Network',
    description: 'How to identify and strengthen relationships that help you.',
    color: '#EC4899',
  },
  {
    id: 7,
    category: 'Self-Care',
    icon: '🧘',
    title: 'Self-Care When You\'re Under Stress',
    description: 'Simple daily practices to take care of your mental health.',
    color: '#7C3AED',
  },
  {
    id: 12,
    category: 'Study Skills',
    icon: '⏰',
    title: 'Smart Study Habits That Reduce Stress',
    description: 'Why cramming backfires, and what to do instead when exams are close.',
    color: '#10B981',
  },
  {
    id: 8,
    category: 'Crisis Support',
    icon: '🆘',
    title: 'Crisis Helplines & Emergency Support',
    description: 'When you need immediate help – contact these 24/7 services.',
    color: '#EC4899',
    isCrisis: true,
  },
];

const crisisHelplines = [
  {
    name: 'iCall (Tata Institute of Social Sciences)',
    number: '9152 987 821',
    description: '24/7 emotional support, teen-friendly',
    availability: 'Anytime',
  },
  {
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    description: 'Mental health support and crisis intervention',
    availability: 'Anytime',
  },
];

export default function ResourcesPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', minHeight: '100vh' }}>
      <TeenHeader />
      <div style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>📚 Resource Library</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
            Everything you need to navigate bullying, academic pressure, exam stress, peer pressure, and social stress
          </p>
        </div>

        {/* Resources Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {resources.map((resource) => (
            <Link
              key={resource.id}
              href={`/teen/resources/${resource.id}`}
              style={{ textDecoration: 'none' }}
            >
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderLeft: `4px solid ${resource.color}`,
                boxShadow: 'var(--shadow-md)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{resource.icon}</div>
              <div style={{ fontSize: '0.875rem', color: resource.color, fontWeight: '600', marginBottom: '0.5rem' }}>
                {resource.category}
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: '600' }}>{resource.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {resource.description}
              </p>
            </div>
            </Link>
          ))}
        </div>

        {/* Crisis Helplines Section */}
        <div style={{
          backgroundColor: 'var(--color-surface)',
          border: '2px solid var(--color-accent)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginTop: '3rem',
        }}>
          <h2 style={{ fontSize: '1.875rem', marginBottom: '1.5rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
            🆘 Crisis Support - Available 24/7 in India
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.6' }}>
            If you're having thoughts of self-harm or in crisis, please reach out immediately. These services are confidential, free, and always available.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {crisisHelplines.map((helpline, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(236, 72, 153, 0.1)',
                  border: '1px solid var(--color-accent)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                }}
              >
                <h3 style={{ color: 'var(--color-accent)', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {helpline.name}
                </h3>
                <a
                  href={`tel:${helpline.number.replace(/\s/g, '')}`}
                  style={{
                    display: 'inline-block',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--color-primary)',
                    marginBottom: '1rem',
                    textDecoration: 'none',
                  }}
                >
                  {helpline.number}
                </a>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {helpline.description}
                </p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  ⏰ {helpline.availability}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          marginTop: '3rem',
          borderLeft: '4px solid var(--color-primary)',
        }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '1rem' }}>
            You deserve support. Talk to Aisha anytime – she's here 24/7 to listen.
          </p>
          <a
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
            Chat with Aisha →
          </a>
        </div>
        </div>
      </div>
    </div>
  );
}
