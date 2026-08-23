'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { TeenHeader } from '@/components/TeenHeader';

const circlesData: Record<number, any> = {
  1: {
    id: 1,
    name: 'Social Anxiety Support Squad',
    emoji: '😰',
    members: 4,
    ambassadors: 2,
    focus: 'Social anxiety, shyness, making friends',
    description: 'A safe space for teens dealing with social anxiety to share experiences and support each other.',
    ambassadorNames: ['Alex', 'Jordan'],
  },
  2: {
    id: 2,
    name: 'Bullying Survivors\' Circle',
    emoji: '💪',
    members: 8,
    ambassadors: 2,
    focus: 'Bullying, harassment, recovery',
    description: 'For teens who have experienced bullying. Share stories, strategies, and find strength in community.',
    ambassadorNames: ['Sam', 'Casey'],
  },
  3: {
    id: 3,
    name: 'New at School Support',
    emoji: '🆕',
    members: 6,
    ambassadors: 1,
    focus: 'New student challenges, fitting in',
    description: 'Just joined a new school? Connect with others navigating the same transition.',
    ambassadorNames: ['Morgan'],
  },
  4: {
    id: 4,
    name: 'LGBTQ+ Peer Support',
    emoji: '🌈',
    members: 5,
    ambassadors: 2,
    focus: 'Identity, acceptance, belonging',
    description: 'A confidential space for LGBTQ+ teens to connect and support each other.',
    ambassadorNames: ['Riley', 'Drew'],
  },
  5: {
    id: 5,
    name: 'Academic Stress & Pressure',
    emoji: '📚',
    members: 9,
    ambassadors: 2,
    focus: 'Exam pressure, grades, college stress',
    description: 'Dealing with academic pressure? Share tips and support each other through stressful times.',
    ambassadorNames: ['Taylor', 'Blake'],
  },
  6: {
    id: 6,
    name: 'Self-Esteem & Body Image',
    emoji: '💜',
    members: 7,
    ambassadors: 2,
    focus: 'Body image, self-worth, confidence',
    description: 'Building confidence and self-love in a supportive community.',
    ambassadorNames: ['Skylar', 'Avery'],
  },
};

const sampleMessages = [
  {
    id: 1,
    author: 'You',
    timestamp: '2 hours ago',
    message: 'Hi everyone! Just joined and really excited to be here.',
    avatar: '👤',
  },
  {
    id: 2,
    author: 'Alex (Ambassador)',
    timestamp: '1 hour ago',
    message: 'Welcome! We\'re so glad you joined. This is a judgment-free space where we support each other. Feel free to share anytime you need to talk.',
    avatar: '⭐',
  },
  {
    id: 3,
    author: 'Jordan',
    timestamp: '30 min ago',
    message: 'I\'ve been dealing with social anxiety for years and this community really helps. You\'re in good hands here.',
    avatar: '👤',
  },
];

export default function CircleDetailPage() {
  const params = useParams();
  const circleId = Number(params.id);
  const circle = circlesData[circleId];
  const [messages, setMessages] = useState(sampleMessages);
  const [newMessage, setNewMessage] = useState('');

  if (!circle) {
    return (
      <div style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', minHeight: '100vh' }}>
        <TeenHeader />
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <p>Circle not found</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      author: 'You',
      timestamp: 'just now',
      message: newMessage,
      avatar: '👤',
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', minHeight: '100vh' }}>
      <TeenHeader />
      <div style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Circle Header */}
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '3rem' }}>{circle.emoji}</div>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{circle.name}</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                  👥 {circle.members} members • ⭐ {circle.ambassadors} ambassadors
                </p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  <strong>Ambassadors:</strong> {circle.ambassadorNames.join(', ')}
                </p>
              </div>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{circle.description}</p>
          </div>

          {/* Messages Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Circle Discussion</h2>

            {/* Messages List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '1.25rem' }}>{msg.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ color: 'var(--color-text)' }}>{msg.author}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{msg.timestamp}</span>
                      </div>
                      <p style={{ color: 'var(--color-text)', lineHeight: '1.6', margin: 0 }}>{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your thoughts with the circle..."
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 2rem',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: '600',
                  cursor: 'pointer',
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
                Send
              </button>
            </form>
          </div>

          {/* Info Box */}
          <div style={{
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginTop: '2rem',
          }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              💜 <strong>Circle Guidelines:</strong> Be respectful, keep things confidential, support each other without judgment. Ambassadors are here to help and moderate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
