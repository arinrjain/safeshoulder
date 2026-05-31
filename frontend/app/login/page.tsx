"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="mb-6 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-200">
            <Logo size={34} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SafeShoulder</h1>
          <p className="text-slate-600 text-sm mt-1">A safe space to talk and be heard</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-slate-700 font-medium">Check your email</p>
            <p className="text-slate-500 text-sm mt-1">
              We sent a magic link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-800 block mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg py-2 text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>

            <p className="text-xs text-slate-500 text-center">
              No password needed. We&apos;ll email you a sign-in link.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
