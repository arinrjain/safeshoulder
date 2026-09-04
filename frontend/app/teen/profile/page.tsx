'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TeenHeader } from '@/components/TeenHeader';
import { createClient } from '@/lib/supabase';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [educationStatus, setEducationStatus] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setEmail(session.user.email || '');

        const { data } = await supabase
          .from('users')
          .select('name,age_range,gender,education_status')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setName(data.name || '');
          setAgeRange(data.age_range || '');
          setGender(data.gender || '');
          setEducationStatus(data.education_status || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('users')
        .update({
          name,
          age_range: ageRange,
          gender,
          education_status: educationStatus,
        })
        .eq('id', session.user.id);

      if (error) throw error;
      setMessage('✅ Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('❌ Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <TeenHeader />
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading profile...
        </div>
      </>
    );
  }

  return (
    <>
      <TeenHeader />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: 'var(--color-text)', marginBottom: '2rem' }}>Edit Profile</h1>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Email (read-only) */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-secondary)',
                cursor: 'not-allowed',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Cannot be changed
            </p>
          </div>

          {/* Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500' }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontSize: '1rem',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            />
          </div>

          {/* Age Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500' }}>
              Age Range
            </label>
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontSize: '1rem',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <option value="">Select age range</option>
              <option value="13-15">13-15</option>
              <option value="16-18">16-18</option>
              <option value="19-22">19-22</option>
              <option value="23+">23+</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500' }}>
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontSize: '1rem',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          {/* Education Status */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500' }}>
              What's your current education status?
            </label>
            <select
              value={educationStatus}
              onChange={(e) => setEducationStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontSize: '1rem',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <option value="">Select education status</option>
              <option value="Middle School">Middle School</option>
              <option value="High School">High School</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Private Academics or Sports Coaching">Private Academics or Sports Coaching</option>
            </select>
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: '1rem',
              backgroundColor: message.includes('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-md)',
              color: message.includes('✅') ? '#22c55e' : '#ef4444',
              fontSize: '0.9rem',
            }}>
              {message}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: '0.875rem 1.75rem',
                backgroundColor: saving ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/teen/support"
              style={{
                flex: 1,
                padding: '0.875rem 1.75rem',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                fontWeight: '600',
                textDecoration: 'none',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
            >
              Back to Chat
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
