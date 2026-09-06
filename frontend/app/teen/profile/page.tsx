'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TeenHeader } from '@/components/TeenHeader';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

const AGE_RANGES = ['13-15', '16-18', '19-22', '23+'];
const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];
const EDUCATION_STATUSES = [
  'Middle School',
  'High School',
  'Undergraduate',
  'Private Academics or Sports Coaching',
];

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
              backgroundColor: selected ? 'var(--color-primary)' : 'var(--color-surface)',
              color: selected ? '#fff' : 'var(--color-text)',
              transition: 'all 0.15s ease',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: '0.625rem' }}>
      <label style={{ display: 'block', color: 'var(--color-text)', fontWeight: 600, fontSize: '0.95rem' }}>
        {children}
      </label>
      {hint && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [educationStatus, setEducationStatus] = useState('');
  const [email, setEmail] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect immediately once we know for sure there's no active session -
  // previously this page just rendered an empty form for signed-out users
  // instead of checking auth at all.
  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [authLoading, session, router]);

  useEffect(() => {
    if (!session) return;

    const loadProfile = async () => {
      try {
        setEmail(session.user.email || '');

        const supabase = createClient();
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
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    setMessage('');

    try {
      const supabase = createClient();
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
      setMessage('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <>
        <TeenHeader />
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading profile...
        </div>
      </>
    );
  }

  if (!session) {
    return null; // redirect effect above is already sending them to /login
  }

  return (
    <>
      <TeenHeader />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Edit Profile</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          This helps Aisha understand your context so support feels personal, not generic.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <FieldLabel hint="Cannot be changed">Email Address</FieldLabel>
              <input
                type="email"
                value={email}
                disabled
                className="input"
                style={{ width: '100%', boxSizing: 'border-box', cursor: 'not-allowed', color: 'var(--color-text-secondary)' }}
              />
            </div>

            <div>
              <FieldLabel>Name</FieldLabel>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <FieldLabel>Age range</FieldLabel>
              <ChipGroup
                options={AGE_RANGES.map((a) => ({ value: a, label: a }))}
                value={ageRange}
                onChange={setAgeRange}
              />
            </div>

            <div>
              <FieldLabel hint="Optional">Gender</FieldLabel>
              <ChipGroup options={GENDERS} value={gender} onChange={setGender} />
            </div>

            <div>
              <FieldLabel hint="Optional">What's your current education status?</FieldLabel>
              <ChipGroup
                options={EDUCATION_STATUSES.map((e) => ({ value: e, label: e }))}
                value={educationStatus}
                onChange={setEducationStatus}
              />
            </div>
          </div>

          {message && (
            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: message === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: message === 'success' ? 'var(--color-success)' : 'var(--color-error)',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              {message === 'success' ? '✓ Profile updated successfully' : '✗ Failed to save profile — please try again'}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                backgroundColor: saving ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <Link
              href="/teen/support"
              className="button"
              style={{
                flex: 1,
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Back to chat
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
