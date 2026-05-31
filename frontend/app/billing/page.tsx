"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

const PACKS = [
  {
    id: "small",
    messages: 100,
    price: 99,
    label: "Starter",
    desc: "Good for occasional support",
    color: "from-indigo-500 to-violet-500",
    popular: false,
  },
  {
    id: "medium",
    messages: 300,
    price: 249,
    label: "Regular",
    desc: "Most popular — great value",
    color: "from-violet-500 to-purple-600",
    popular: true,
  },
  {
    id: "large",
    messages: 800,
    price: 599,
    label: "Unlimited Feel",
    desc: "For when you need ongoing support",
    color: "from-purple-600 to-indigo-600",
    popular: false,
  },
];

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function BillingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [usage, setUsage] = useState<{ free_remaining: number; message_credits: number; is_subscribed: boolean } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem("ss-theme") === "dark");
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      setToken(data.session.access_token);
      setUserEmail(data.session.user.email ?? "");
      fetchUsage(data.session.access_token);
    });

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  async function fetchUsage(t: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/usage`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (res.ok) setUsage(await res.json());
  }

  async function handleBuy(packId: string) {
    if (!token) return;
    setLoading(packId);

    try {
      // Step 1 — create order on backend
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pack: packId }),
      });

      if (!orderRes.ok) { setLoading(null); return; }
      const { order } = await orderRes.json();
      const payload = order.client_payload;

      // Step 2 — open Razorpay checkout
      const rzp = new window.Razorpay({
        ...payload,
        prefill: { email: userEmail },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          // Step 3 — verify payment on backend
          const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ payload: response }),
          });

          if (verifyRes.ok) {
            setSuccess(true);
            fetchUsage(token);
          }
          setLoading(null);
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      });
      rzp.open();
    } catch {
      setLoading(null);
    }
  }

  const d = dark;

  return (
    <div className={`min-h-screen transition-colors ${d ? "bg-gray-950" : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"}`}>

      {/* Header */}
      <header className={`flex items-center justify-between px-5 py-3 border-b ${d ? "bg-gray-900 border-gray-800" : "bg-white/80 backdrop-blur border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/chat")} className={`text-sm ${d ? "text-gray-400 hover:text-gray-200" : "text-slate-400 hover:text-slate-700"}`}>← Back to chat</button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Logo size={16} className="text-white" />
            </div>
            <span className={`font-semibold text-sm ${d ? "text-white" : "text-slate-800"}`}>SafeShoulder</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Usage summary */}
        {usage && (
          <div className={`rounded-2xl border p-5 mb-10 flex items-center justify-between ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
            <div>
              <p className={`text-sm font-medium ${d ? "text-gray-200" : "text-slate-700"}`}>Your current balance</p>
              <p className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-slate-400"}`}>Credits never expire</p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className={`text-2xl font-bold ${d ? "text-indigo-400" : "text-indigo-600"}`}>{usage.free_remaining}</p>
                <p className={`text-xs ${d ? "text-gray-500" : "text-slate-400"}`}>Free left</p>
              </div>
              <div className={`w-px ${d ? "bg-gray-800" : "bg-slate-200"}`} />
              <div>
                <p className={`text-2xl font-bold ${d ? "text-violet-400" : "text-violet-600"}`}>{usage.message_credits}</p>
                <p className={`text-xs ${d ? "text-gray-500" : "text-slate-400"}`}>Paid credits</p>
              </div>
            </div>
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8 text-center">
            <p className="text-green-700 font-medium">🎉 Credits added to your account! You&apos;re all set.</p>
          </div>
        )}

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className={`text-3xl font-bold mb-2 ${d ? "text-white" : "text-slate-900"}`}>Get more messages</h1>
          <p className={`text-sm ${d ? "text-gray-400" : "text-slate-500"}`}>One-time purchase. No subscription. Credits never expire.</p>
        </div>

        {/* Packs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {PACKS.map(pack => (
            <div key={pack.id} className={`relative rounded-2xl border overflow-hidden transition-all ${pack.popular ? "ring-2 ring-violet-500 scale-[1.02]" : ""} ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
              {pack.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold text-center py-1">
                  Most popular
                </div>
              )}
              <div className={`p-6 ${pack.popular ? "pt-8" : ""}`}>
                {/* Gradient icon */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pack.color} flex items-center justify-center text-white text-lg mb-4`}>
                  💬
                </div>
                <p className={`font-semibold text-lg ${d ? "text-white" : "text-slate-800"}`}>{pack.label}</p>
                <p className={`text-xs mt-0.5 mb-4 ${d ? "text-gray-500" : "text-slate-400"}`}>{pack.desc}</p>
                <div className="mb-4">
                  <span className={`text-3xl font-bold ${d ? "text-white" : "text-slate-900"}`}>₹{pack.price}</span>
                  <span className={`text-sm ml-1 ${d ? "text-gray-500" : "text-slate-400"}`}>one-time</span>
                </div>
                <p className={`text-sm font-medium mb-5 ${d ? "text-indigo-400" : "text-indigo-600"}`}>
                  {pack.messages} messages
                </p>
                <button
                  onClick={() => handleBuy(pack.id)}
                  disabled={loading === pack.id}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${pack.popular
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90"
                    : d ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}>
                  {loading === pack.id ? "Opening…" : `Buy for ₹${pack.price}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <div className={`text-center text-xs ${d ? "text-gray-600" : "text-slate-400"}`}>
          <p>🔒 Payments secured by Razorpay &nbsp;·&nbsp; UPI, cards, netbanking accepted &nbsp;·&nbsp; No auto-renewals</p>
        </div>
      </div>
    </div>
  );
}
