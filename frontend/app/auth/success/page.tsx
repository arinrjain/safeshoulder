'use client';

import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    // Check what's in localStorage
    const token = localStorage.getItem('sb-aovdmocxjglpiokiximn-auth-token');
    setSessionInfo({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 100) : 'none',
    });
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'monospace' }}>
      <h1>✅ OAuth Success!</h1>
      <p>The callback route was called successfully.</p>

      <div style={{ textAlign: 'left', backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h3>Session Debug Info:</h3>
        <p>Has Token: {sessionInfo?.hasToken ? '✅ YES' : '❌ NO'}</p>
        <p>Token Length: {sessionInfo?.tokenLength}</p>
        <p>Token Preview: {sessionInfo?.tokenPreview}</p>
      </div>

      <button
        onClick={() => window.location.href = '/teen/support'}
        style={{
          padding: '1rem 2rem',
          marginTop: '2rem',
          fontSize: '1rem',
          backgroundColor: '#7C3AED',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Go to Chat
      </button>
    </div>
  );
}
