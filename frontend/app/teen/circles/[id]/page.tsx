'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TeenHeader } from '@/components/TeenHeader';
import { useAuth } from '@/lib/AuthContext';

const circlesData: Record<number, any> = {
  1: {
    id: 1,
    name: 'Social Anxiety Support Squad',
    emoji: '😰',
    members: 4,
    ambassadors: 2,
    focus: 'Social anxiety, shyness, making friends',
    description: 'A safe space for teens dealing with social anxiety to share experiences and support each other.',
    ambassadorNames: ['Arjun', 'Priya'],
  },
  2: {
    id: 2,
    name: 'Bullying Survivors\' Circle',
    emoji: '💪',
    members: 8,
    ambassadors: 2,
    focus: 'Bullying, harassment, recovery',
    description: 'For teens who have experienced bullying. Share stories, strategies, and find strength in community.',
    ambassadorNames: ['Anika', 'Rohan'],
  },
  3: {
    id: 3,
    name: 'New at School Support',
    emoji: '🆕',
    members: 6,
    ambassadors: 1,
    focus: 'New student challenges, fitting in',
    description: 'Just joined a new school? Connect with others navigating the same transition.',
    ambassadorNames: ['Kavya'],
  },
  4: {
    id: 4,
    name: 'LGBTQ+ Peer Support',
    emoji: '🌈',
    members: 5,
    ambassadors: 2,
    focus: 'Identity, acceptance, belonging',
    description: 'A confidential space for LGBTQ+ teens to connect and support each other.',
    ambassadorNames: ['Aditi', 'Vikram'],
  },
  5: {
    id: 5,
    name: 'Academic Stress & Pressure',
    emoji: '📚',
    members: 9,
    ambassadors: 2,
    focus: 'Exam pressure, grades, college stress',
    description: 'Dealing with academic pressure? Share tips and support each other through stressful times.',
    ambassadorNames: ['Shreya', 'Nikhil'],
  },
  6: {
    id: 6,
    name: 'Self-Esteem & Body Image',
    emoji: '💜',
    members: 7,
    ambassadors: 2,
    focus: 'Body image, self-worth, confidence',
    description: 'Building confidence and self-love in a supportive community.',
    ambassadorNames: ['Divya', 'Rishav'],
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
    author: 'Arjun (Ambassador)',
    timestamp: '1 hour ago',
    message: 'Welcome! We\'re so glad you joined. This is a safe, judgment-free space where we support each other. Feel free to share anytime you need to talk.',
    avatar: '⭐',
  },
  {
    id: 3,
    author: 'Priya',
    timestamp: '30 min ago',
    message: 'I\'ve been dealing with social anxiety for years and this community really helps. You\'re in good hands here. We all understand what you\'re going through.',
    avatar: '👤',
  },
];

export default function CircleDetailPage() {
  const params = useParams();
  const circleId = Number(params.id);
  const circle = circlesData[circleId];
  const { token, loading } = useAuth();
  const [messages, setMessages] = useState(sampleMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState('');

  const loadCircleData = useCallback(
    async (accessToken: string) => {
      try {
        // Join circle
        const joinResponse = await fetch(`https://safeshoulder-production.up.railway.app/circles/${circleId}/join`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!joinResponse.ok && joinResponse.status !== 409) {
          const error = await joinResponse.json().catch(() => ({}));
          setError(`Failed to join: ${error.detail || joinResponse.statusText}`);
          return;
        }

        setIsJoined(true);

        // Load messages
        const messagesResponse = await fetch(`https://safeshoulder-production.up.railway.app/circles/${circleId}/messages`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          const formattedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            author: msg.user_name || msg.user_id?.substring(0, 8) || 'Anonymous',
            timestamp: new Date(msg.created_at).toLocaleDateString(),
            message: msg.content,
            avatar: '👤',
          }));
          setMessages(formattedMessages);
          setError('');
        } else if (messagesResponse.status === 403) {
          setError('You do not have access to this circle');
        } else {
          setError(`Failed to load messages: ${messagesResponse.statusText}`);
        }
      } catch (e: any) {
        setError(`Error: ${e.message}`);
      }
    },
    [circleId]
  );

  // Load circle data when token is available
  useEffect(() => {
    if (!loading) {
      if (token) {
        setError('');
        loadCircleData(token);
      } else {
        setError('Please log in to access circles');
      }
    }
  }, [token, loading, loadCircleData]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !token) return;

    try {
      const response = await fetch(`https://safeshoulder-production.up.railway.app/circles/${circleId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(`Failed to send: ${err.detail || response.statusText}`);
        return;
      }

      setNewMessage('');
      setError('');

      // Reload messages
      const messagesResponse = await fetch(`https://safeshoulder-production.up.railway.app/circles/${circleId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (messagesResponse.ok) {
        const data = await messagesResponse.json();
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          author: msg.users?.name || msg.user_id?.substring(0, 8) || 'Unknown',
          timestamp: new Date(msg.created_at).toLocaleDateString(),
          message: msg.content,
          avatar: '👤',
        }));
        setMessages(formattedMessages);
      }
    } catch (e: any) {
      setError(`Error sending message: ${e.message}`);
    }
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

          {/* Error Display */}
          {error && (
            <div style={{
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              marginBottom: '2rem',
              color: '#c33'
            }}>
              {error}
            </div>
          )}

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
