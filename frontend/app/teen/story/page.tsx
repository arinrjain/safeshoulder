'use client';

import { useState } from 'react';
import { TeenHeader } from '@/components/TeenHeader';

const sampleEntries = [
  {
    id: 1,
    date: 'August 15, 2026',
    title: 'Finally stood up for myself!',
    category: 'win',
    preview: 'Today I told Sarah that what she said hurt me. I was nervous, but I did it! She apologized and we talked things through. Feeling proud of myself.',
    icon: '🌟',
  },
  {
    id: 2,
    date: 'August 12, 2026',
    title: 'Rough week at school',
    category: 'bullying',
    preview: 'This week has been tough. Some kids have been leaving me out. I used some coping strategies Aisha taught me. Still hurts, but I\'m handling it.',
    icon: '💙',
  },
  {
    id: 3,
    date: 'August 8, 2026',
    title: 'Joined the debate club!',
    category: 'growth',
    preview: 'I finally did it! Joined debate club even though I was scared. Met some cool people today. This is growth.',
    icon: '💪',
  },
];

export default function StoryPage() {
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState(sampleEntries);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'growth',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    const newEntry = {
      id: entries.length + 1,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      title: formData.title,
      category: formData.category,
      preview: formData.content.substring(0, 100) + '...',
      icon: '📝',
    };

    setEntries([newEntry, ...entries]);
    setFormData({ title: '', content: '', category: 'growth' });
    setShowForm(false);
  };

  const categoryEmoji = {
    bullying: '😢',
    growth: '🌱',
    win: '🌟',
  };

  const categoryLabel = {
    bullying: 'Bullying Experience',
    growth: 'Growth & Learning',
    win: 'Win & Celebration',
  };

  return (
    <div style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', minHeight: '100vh' }}>
      <TeenHeader />
      <div style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>📖 My Story</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
              Your private journal. Track your journey, celebrate wins, process challenges.
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          marginBottom: '2rem',
          borderLeft: '4px solid var(--color-secondary)',
        }}>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
            This journal is <strong>100% private and encrypted</strong>. Only you can read it. Use it to:
          </p>
          <ul style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', paddingLeft: '1.5rem', marginBottom: 0 }}>
            <li>Document your experiences and feelings</li>
            <li>Track patterns and progress over time</li>
            <li>Celebrate wins and milestones</li>
            <li>Process difficult moments</li>
          </ul>
        </div>

        {/* New Entry Button */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              backgroundColor: showForm ? 'var(--color-accent)' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: 'var(--radius-lg)',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {showForm ? '✕ Cancel' : '+ Write New Entry'}
          </button>
        </div>

        {/* New Entry Form */}
        {showForm && (
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            marginBottom: '2rem',
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Give your entry a title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  What's on your mind?
                </label>
                <textarea
                  placeholder="Write freely here. This is your safe space..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    minHeight: '150px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="growth">Growth & Learning</option>
                  <option value="win">Win & Celebration</option>
                  <option value="bullying">Bullying Experience</option>
                </select>
              </div>

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
              >
                Save Entry
              </button>
            </form>
          </div>
        )}

        {/* Entries List */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>
            {entries.length} Entries
          </h2>

          {entries.length === 0 ? (
            <div style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2rem',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}>
              <p>No entries yet. Start writing to capture your story.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.75rem',
                    borderLeft: '4px solid var(--color-secondary)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>
                      {(categoryEmoji as any)[entry.category] || entry.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{entry.title}</h3>
                        <span style={{
                          fontSize: '0.75rem',
                          backgroundColor: 'rgba(6, 182, 212, 0.1)',
                          color: 'var(--color-secondary)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontWeight: '600',
                        }}>
                          {(categoryLabel as any)[entry.category]}
                        </span>
                      </div>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        {entry.date}
                      </p>
                      <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                        {entry.preview}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            Need to talk about what you've written? Aisha is always here to listen.
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
