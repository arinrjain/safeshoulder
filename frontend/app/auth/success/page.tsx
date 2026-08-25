'use client';

export default function SuccessPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>✅ OAuth Success!</h1>
      <p>The callback route was called successfully.</p>
      <p>If you see this page, the OAuth flow worked.</p>
      <button onClick={() => window.location.href = '/teen/support'}>
        Go to Chat
      </button>
    </div>
  );
}
