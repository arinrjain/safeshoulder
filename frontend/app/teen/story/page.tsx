'use client';

import { useState, useEffect } from 'react';
import { TeenHeader } from '@/components/TeenHeader';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface StoryEntry {
  id: string;
  title: string;
  content: string;
  category: 'bullying' | 'growth' | 'win';
  created_at: string;
}

export default function StoryPage() {
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState<StoryEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({
    teacherName: '',
    shareToken: '',
  });
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'growth' as const,
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndEntries();
  }, []);

  const loadUserAndEntries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setUserId(session.user.id);
      loadEntries(session.user.id);
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('story_entries')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        // Silently fail - table might not exist yet
        setEntries([]);
        return;
      }
      setEntries(data || []);
    } catch (err) {
      console.error('Failed to load entries:', err);
      setEntries([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !userId) return;

    try {
      const { data, error } = await supabase
        .from('story_entries')
        .insert({
          user_id: userId,
          title: formData.title,
          content: formData.content,
          category: formData.category,
        })
        .select();

      if (error) throw error;

      setFormData({ title: '', content: '', category: 'growth' });
      setShowForm(false);
      await loadEntries(userId);
    } catch (err) {
      console.error('Failed to save entry:', err);
    }
  };

  const toggleEntrySelection = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareData.teacherName.trim() || selectedEntries.size === 0 || !userId) return;

    setShareLoading(true);
    setShareMessage('');
    setShareSuccess(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const selectedIds = Array.from(selectedEntries);

      const response = await fetch('/api/story/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          teacherName: shareData.teacherName,
          entryIds: selectedIds,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to generate report');
      }

      const result = await response.json();

      // Auto-download PDF
      if (result.download_link) {
        const downloadUrl = `${window.location.origin}${result.download_link}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `SafeShoulder_Report_${shareData.teacherName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setShareMessage(`✓ Report generated and downloaded! You can now share it with ${shareData.teacherName}.`);
      setShareSuccess(true);
      setSelectedEntries(new Set());
      setShareData({ teacherName: '', shareToken: '' });
      setTimeout(() => setShowShareModal(false), 3000);
    } catch (err: any) {
      setShareMessage(`✗ Error: ${err.message}`);
    } finally {
      setShareLoading(false);
    }
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', minHeight: '100vh' }}>
      <TeenHeader />
      <div style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '0.5rem', fontWeight: 'bold' }}>📖 My Story</h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.95rem, 2vw, 1.125rem)' }}>
                Your private journal. Track your journey, celebrate wins, process challenges.
              </p>
            </div>
            {selectedEntries.size > 0 && (
              <button
                onClick={() => setShowShareModal(true)}
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                📧 Share ({selectedEntries.size})
              </button>
            )}
          </div>

          {/* Info Section */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(1rem, 5vw, 1.75rem)',
            marginBottom: '2rem',
            borderLeft: '4px solid var(--color-secondary)',
          }}>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              This journal is <strong>100% private and encrypted</strong>. Only you can read it. Use it to:
            </p>
            <ul style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', paddingLeft: '1.5rem', marginBottom: 0, fontSize: 'clamp(0.95rem, 2vw, 1rem)' }}>
              <li>Document your experiences and feelings</li>
              <li>Track patterns and progress over time</li>
              <li>Celebrate wins and milestones</li>
              <li>Share incidents with teachers if needed</li>
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
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
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
            <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', marginBottom: '1.5rem', fontWeight: '600' }}>
              {entries.length} Entries
            </h2>

            {loading ? (
              <div style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 2rem',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
              }}>
                <p>Loading your entries...</p>
              </div>
            ) : entries.length === 0 ? (
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
                      border: selectedEntries.has(entry.id) ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.75rem',
                      borderLeft: '4px solid var(--color-secondary)',
                      transition: 'all 0.2s ease',
                      opacity: selectedEntries.size > 0 && !selectedEntries.has(entry.id) ? 0.6 : 1,
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
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(entry.id)}
                        onChange={() => toggleEntrySelection(entry.id)}
                        style={{
                          width: '1.25rem',
                          height: '1.25rem',
                          cursor: 'pointer',
                          marginTop: '0.25rem',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ fontSize: '1.5rem' }}>
                        {(categoryEmoji as any)[entry.category]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem', gap: '1rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', fontWeight: '600' }}>{entry.title}</h3>
                          <span style={{
                            fontSize: '0.75rem',
                            backgroundColor: 'rgba(6, 182, 212, 0.1)',
                            color: 'var(--color-secondary)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                          }}>
                            {(categoryLabel as any)[entry.category]}
                          </span>
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.8rem, 1.5vw, 0.85rem)', marginBottom: '0.75rem' }}>
                          {formatDate(entry.created_at)}
                        </p>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                          {entry.content.substring(0, 150)}{entry.content.length > 150 ? '...' : ''}
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
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: 'clamp(0.95rem, 2vw, 1rem)' }}>
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

      {/* Share Modal */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
              📥 Download Your Report
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Download {selectedEntries.size} selected entries as a PDF report. You can then share it with your teacher.
            </p>

            <form onSubmit={handleShare}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Who are you sharing this with? (e.g., Ms. Smith, Mr. Johnson)
                </label>
                <input
                  type="text"
                  placeholder="Teacher's name..."
                  value={shareData.teacherName}
                  onChange={(e) => setShareData({ ...shareData, teacherName: e.target.value })}
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
                  required
                />
              </div>

              {shareMessage && (
                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '1rem',
                  backgroundColor: shareSuccess ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: shareSuccess ? '#059669' : '#dc2626',
                  fontSize: '0.9rem',
                }}>
                  {shareMessage}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={shareLoading || selectedEntries.size === 0}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    border: 'none',
                    padding: '0.875rem 2rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: '600',
                    cursor: shareLoading ? 'not-allowed' : 'pointer',
                    opacity: shareLoading ? 0.6 : 1,
                  }}
                >
                  {shareLoading ? 'Sending...' : 'Send Report'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareMessage('');
                    setShareSuccess(false);
                  }}
                  style={{
                    backgroundColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    border: 'none',
                    padding: '0.875rem 2rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
