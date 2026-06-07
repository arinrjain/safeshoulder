"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

const DOMAIN_LABELS: Record<string, string> = {
  school_bullying: "🏫 School",
  heartbreak: "💔 Heartbreak",
  domestic: "🏠 Family",
  financial: "💸 Financial",
  workplace: "💼 Workplace",
};

type User = {
  id: string;
  email: string;
  name?: string;
  domain?: string;
  free_queries_used: number;
  message_credits: number;
  created_at: string;
  is_blocked: boolean;
};

type Stats = {
  users: { total: number; new_today: number; new_week: number; new_month: number; subscribed: number; free_exhausted: number };
  messages: { total: number; today: number; week: number };
  sessions: { total: number; by_domain: Record<string, number> };
  revenue: { total_inr: number; today_inr: number; week_inr: number; orders_total: number; by_pack: Record<string, number> };
  recent_users: { email: string; name: string; domain: string; free_queries_used: number; message_credits: number; created_at: string }[];
};

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color ?? "text-slate-800"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function DomainBar({ domain, count, max }: { domain: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-32 text-slate-600">{DOMAIN_LABELS[domain] ?? domain}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium text-slate-700 w-8 text-right">{count}</span>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [backendUp, setBackendUp] = useState<boolean | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      const token = data.session.access_token;

      // Check backend health
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
        .then(r => setBackendUp(r.ok))
        .catch(() => setBackendUp(false));

      // Fetch stats
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) { setError("You don't have admin access."); setLoading(false); return; }
      if (!res.ok) { setError("Failed to load stats."); setLoading(false); return; }

      setStats(await res.json());

      // Fetch all users for management
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAllUsers(usersData.users || []);
      }

      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading dashboard…</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  if (!stats) return null;

  const maxDomain = Math.max(...Object.values(stats.sessions.by_domain));

  async function handleBlockUser(userId: string, email: string) {
    if (!confirm(`Block ${email}? They won't be able to login or re-register with this email.`)) return;

    setActionInProgress(userId);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) { alert("Not authenticated"); return; }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/block`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("User blocked successfully");
        setAllUsers(allUsers.map(u => u.id === userId ? { ...u, is_blocked: true } : u));
      } else {
        alert("Failed to block user");
      }
    } catch (err) {
      alert("Error blocking user");
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleUnblockUser(userId: string, email: string) {
    if (!confirm(`Unblock ${email}? They will be able to login and re-register.`)) return;

    setActionInProgress(userId);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) { alert("Not authenticated"); return; }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/unblock`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("User unblocked successfully");
        setAllUsers(allUsers.map(u => u.id === userId ? { ...u, is_blocked: false } : u));
      } else {
        alert("Failed to unblock user");
      }
    } catch (err) {
      alert("Error unblocking user");
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleDeleteUser(userId: string, email: string) {
    if (!confirm(`Delete ${email}? All their data will be removed and they can re-register fresh.`)) return;
    if (!confirm(`⚠️ This is permanent. Are you absolutely sure?`)) return;

    setActionInProgress(userId);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) { alert("Not authenticated"); return; }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("User deleted successfully - they can now re-register");
        setAllUsers(allUsers.filter(u => u.id !== userId));
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      alert("Error deleting user");
    } finally {
      setActionInProgress(null);
    }
  }

  const filteredUsers = allUsers.filter(u =>
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Logo size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">SafeShoulder</p>
              <p className="text-white/60 text-xs">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${backendUp ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${backendUp ? "bg-green-400" : "bg-red-400"}`} />
              {backendUp === null ? "Checking…" : backendUp ? "Backend up" : "Backend down"}
            </div>
            <button onClick={() => router.push("/admin/knowledge")} className="text-white/70 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-lg">📚 Knowledge Base</button>
            <button onClick={() => router.push("/chat")} className="text-white/70 hover:text-white text-xs">← Back to chat</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Users */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Users</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total" value={stats.users.total} color="text-indigo-600" />
            <StatCard label="New today" value={stats.users.new_today} sub="last 24h" />
            <StatCard label="This week" value={stats.users.new_week} sub="last 7 days" />
            <StatCard label="This month" value={stats.users.new_month} sub="last 30 days" />
            <StatCard label="Subscribed" value={stats.users.subscribed} color="text-violet-600" />
            <StatCard label="Free used up" value={stats.users.free_exhausted} sub="converted to paid?" color="text-orange-500" />
          </div>
        </section>

        {/* Messages */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Messages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Total messages" value={stats.messages.total.toLocaleString()} color="text-indigo-600" />
            <StatCard label="Today" value={stats.messages.today} sub="last 24h" />
            <StatCard label="This week" value={stats.messages.week} sub="last 7 days" />
          </div>
        </section>

        {/* Revenue */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Revenue</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total revenue" value={`₹${stats.revenue.total_inr.toLocaleString()}`} color="text-green-600" />
            <StatCard label="Today" value={`₹${stats.revenue.today_inr}`} sub="last 24h" />
            <StatCard label="This week" value={`₹${stats.revenue.week_inr}`} sub="last 7 days" />
            <StatCard label="Total orders" value={stats.revenue.orders_total} />
          </div>
          {Object.keys(stats.revenue.by_pack).length > 0 && (
            <div className="mt-3 bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Pack breakdown</p>
              <div className="flex gap-6">
                {Object.entries(stats.revenue.by_pack).map(([pack, count]) => (
                  <div key={pack} className="text-center">
                    <p className="text-xl font-bold text-slate-800">{count}</p>
                    <p className="text-xs text-slate-400 capitalize">{pack}</p>
                    <p className="text-xs text-slate-500">{pack === "small" ? "₹99" : pack === "medium" ? "₹249" : "₹599"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Domain breakdown */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Sessions by Domain</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3">
            {Object.entries(stats.sessions.by_domain)
              .sort((a, b) => b[1] - a[1])
              .map(([domain, count]) => (
                <DomainBar key={domain} domain={domain} count={count} max={maxDomain} />
              ))}
            {Object.keys(stats.sessions.by_domain).length === 0 && (
              <p className="text-sm text-slate-400">No sessions yet.</p>
            )}
          </div>
        </section>

        {/* Recent signups */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Recent Signups</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Domain</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Free used</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Credits</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_users.map((u, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{u.name || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">{DOMAIN_LABELS[u.domain] ?? u.domain ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (u.free_queries_used / 20) * 100)}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{u.free_queries_used}/20</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${u.message_credits > 0 ? "text-green-600" : "text-slate-400"}`}>
                          {u.message_credits > 0 ? `${u.message_credits} credits` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* User Management */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">User Management</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <input
                type="text"
                placeholder="Search users by email or name…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Domain</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Joined</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className={`border-b border-slate-50 transition-colors ${u.is_blocked ? "bg-red-50" : "hover:bg-slate-50"}`}>
                        <td className={`px-4 py-3 font-medium ${u.is_blocked ? "text-red-800" : "text-slate-800"}`}>
                          {u.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs break-all">
                          <div className="flex items-center gap-2">
                            <span>{u.email}</span>
                            {u.is_blocked && (
                              <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-800 text-xs font-semibold">BLOCKED</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{DOMAIN_LABELS[u.domain ?? ""] ?? u.domain ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            {u.is_blocked ? (
                              <button
                                onClick={() => handleUnblockUser(u.id, u.email)}
                                disabled={actionInProgress === u.id}
                                className="text-xs px-2.5 py-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 font-medium"
                              >
                                ✅ Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlockUser(u.id, u.email)}
                                disabled={actionInProgress === u.id}
                                className="text-xs px-2.5 py-1.5 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors disabled:opacity-50 font-medium"
                              >
                                🚫 Block
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              disabled={actionInProgress === u.id}
                              className="text-xs px-2.5 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 font-medium"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            💡 <strong>Block:</strong> Prevents login & re-registration. Can unblock later. | <strong>Delete:</strong> Removes all data, allows fresh re-registration.
          </p>
        </section>
      </div>
    </div>
  );
}
