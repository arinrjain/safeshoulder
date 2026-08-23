'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase auth should already be handled by the session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Redirect to teen portal after successful auth
          router.push('/teen');
        } else {
          // If no session, go back to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-600">Completing sign-in...</p>
    </div>
  );
}
