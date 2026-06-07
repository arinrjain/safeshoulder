"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Illustrations } from "./Illustrations";
import { LogoWithName } from "@/components/Logo";
import { VoiceButton } from "@/components/VoiceButton";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const DOMAINS = [
  { value: "school_bullying", icon: "🏫", label: "School / College" },
  { value: "heartbreak", icon: "💔", label: "Heartbreak" },
  { value: "domestic", icon: "🏠", label: "Family Conflict" },
  { value: "financial", icon: "💸", label: "Financial Stress" },
  { value: "workplace", icon: "💼", label: "Workplace" },
];

type Message = { role: "user" | "assistant"; content: string };
type Session = { id: string; domain: string; created_at: string; summary: string | null };

export default function ChatPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null); // always-fresh token ref
  const [domain, setDomain] = useState("workplace");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState<number | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [pendingSuggestedDomain, setPendingSuggestedDomain] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep tokenRef in sync so callbacks don't need token in deps
  useEffect(() => { tokenRef.current = token; }, [token]);

  useEffect(() => {
    setDark(localStorage.getItem("ss-theme") === "dark");
  }, []);

  function toggleDark() {
    setDark(d => { localStorage.setItem("ss-theme", !d ? "dark" : "light"); return !d; });
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      const t = data.session.access_token;
      tokenRef.current = t;
      setToken(t);

      // Fetch profile + sessions in parallel
      const [profileRes, sessionsRes] = await Promise.all([
        supabase.from("users").select("domain,name").eq("id", data.session.user.id).single(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/`, { headers: { Authorization: `Bearer ${t}` } }),
      ]);

      const profile = profileRes.data;
      if (!profile?.domain) { router.push("/onboarding"); return; }

      setUser({ id: data.session.user.id, email: data.session.user.email!, name: profile.name });
      setDomain(profile.domain);

      const allSessions: Session[] = sessionsRes.ok ? await sessionsRes.json() : [];
      setSessions(allSessions);

      const lastSession = allSessions.find((s: Session) => s.domain === profile.domain);
      if (lastSession) {
        // Restore session messages — don't await, show UI immediately
        _restoreSession(lastSession.id, t);
      } else {
        _generateWelcome(t);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Internal functions use ref so no stale closures, no re-creation on render
  function _restoreSession(sid: string, t?: string) {
    const useToken = t || tokenRef.current;
    if (!useToken) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sid}/messages`, {
      headers: { Authorization: `Bearer ${useToken}` },
    }).then(res => {
      if (res.ok) res.json().then(msgs => {
        setMessages(msgs.map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content })));
        setSessionId(sid);
        setSidebarOpen(false);
      });
    });
  }

  function _generateWelcome(t?: string) {
    const useToken = t || tokenRef.current;
    if (!useToken) return;
    setStreaming(true);
    setMessages([{ role: "assistant", content: "" }]);
    let text = "";
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/welcome`, {
      method: "POST",
      headers: { Authorization: `Bearer ${useToken}` },
    }).then(async res => {
      if (!res.ok) { setMessages([]); setStreaming(false); return; }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const chunk = line.slice(6);
          if (chunk === "[DONE]") break;
          text += chunk;
          setMessages([{ role: "assistant", content: text }]);
        }
      }
      setStreaming(false);
    }).catch(() => { setMessages([]); setStreaming(false); });
  }

  const loadSessions = useCallback(async (t?: string): Promise<Session[]> => {
    const useToken = t || tokenRef.current;
    if (!useToken) return [];
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/`, {
      headers: { Authorization: `Bearer ${useToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      setSessions(data);
      return data;
    }
    return [];
  }, []);

  const restoreSession = useCallback((sid: string, t?: string) => {
    _restoreSession(sid, t);
  }, []);

  const loadSessionMessages = useCallback((sid: string) => {
    _restoreSession(sid);
    setSidebarOpen(false);
  }, []);

  const generateWelcome = useCallback((t?: string) => {
    _generateWelcome(t);
  }, []);

  function startNewChat() {
    setMessages([]);
    setSessionId(null);
    setBlocked(false);
    setShowCrisis(false);
    setSidebarOpen(false);
    _generateWelcome();
  }

  function changeDomain(newDomain: string) {
    // Update UI instantly — fire-and-forget DB update
    setDomain(newDomain);
    setShowDomainPicker(false);
    setMessages([]);
    setSessionId(null);
    setBlocked(false);
    setShowCrisis(false);
    setPendingSuggestedDomain(null);

    // Save to DB in background — don't await
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        supabase.from("users").update({ domain: newDomain }).eq("id", data.session.user.id);
      }
    });

    // Check if existing session for this domain
    const existing = sessions.find(s => s.domain === newDomain);
    if (existing) {
      _restoreSession(existing.id);
    } else {
      _generateWelcome();
    }
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streaming]);

  async function sendMessage() {
    if (!input.trim() || streaming || !token) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setStreaming(true);
    setShowCrisis(false);
    let assistantText = "";
    let metaSuggestedDomain: string | null = null;
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: userMsg, domain, session_id: sessionId }),
      });

      if (res.status === 402) { setBlocked(true); setMessages(prev => prev.slice(0, -1)); setStreaming(false); return; }

      const newSid = res.headers.get("x-session-id");
      if (newSid && newSid !== sessionId) { setSessionId(newSid); loadSessions(); }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          if (data.startsWith("[META]")) {
            const meta = JSON.parse(data.slice(6));
            setFreeRemaining(meta.free_remaining);
            setCredits(meta.credits);
            if (meta.suggested_domain) metaSuggestedDomain = meta.suggested_domain;
            continue;
          }
          assistantText += data;
          setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: assistantText }; return u; });
        }
      }
      if (assistantText.includes("crisis helpline") || assistantText.includes("988")) setShowCrisis(true);
      if (metaSuggestedDomain) setPendingSuggestedDomain(metaSuggestedDomain);

      // Auto-speak response in voice mode
      if (voiceMode && assistantText) {
        const speak = (window as Window & { safeshoulderSpeak?: (t: string) => void }).safeshoulderSpeak;
        if (speak) {
          const clean = assistantText
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/^[-*]\s+/gm, "")
            .replace(/#{1,3}\s+/g, "");
          speak(clean);
        }
      }
    } catch (err) {
      console.error("sendMessage error:", err);
      setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: "Something went wrong. Please try again." }; return u; });
    }
    setStreaming(false);
  }

  async function signOut() { await supabase.auth.signOut(); router.push("/login"); }

  const currentDomain = DOMAINS.find(dm => dm.value === domain);
  const d = dark;

  // Memoize grouped sessions — only recomputes when sessions array changes
  const groupedSessions = useMemo(() =>
    DOMAINS.filter(dm => sessions.some(s => s.domain === dm.value)).map(dm => ({
      domain: dm,
      sessions: sessions.filter(s => s.domain === dm.value),
    }))
  , [sessions]);

  if (!user) return null;

  return (
    <div className={`flex h-screen transition-colors duration-300 ${d ? "bg-gray-950" : "bg-indigo-50"}`}>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 flex flex-col transition-transform duration-300 border-r ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"} ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${d ? "border-gray-800" : "border-slate-100"}`}>
          <span className={`font-semibold text-sm ${d ? "text-white" : "text-slate-800"}`}>SafeShoulder</span>
          <button onClick={() => setSidebarOpen(false)} className={`text-lg ${d ? "text-gray-400 hover:text-gray-200" : "text-slate-400 hover:text-slate-600"}`}>✕</button>
        </div>

        {/* User info + profile link */}
        <div className={`px-4 py-3 border-b ${d ? "border-gray-800" : "border-slate-100"}`}>
          <p className={`text-sm font-medium ${d ? "text-gray-200" : "text-slate-700"}`}>{user.name || "You"}</p>
          <p className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-slate-400"}`}>{user.email}</p>
          <button onClick={() => router.push("/profile")}
            className={`mt-2 text-xs font-medium text-indigo-500 hover:text-indigo-400`}>
            ✏️ Edit profile & survey
          </button>
        </div>

        {/* Domain switcher */}
        <div className={`px-4 py-3 border-b ${d ? "border-gray-800" : "border-slate-100"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${d ? "text-gray-500" : "text-slate-400"}`}>Topic</p>
          <div className="flex flex-col gap-1">
            {DOMAINS.map(dm => (
              <button key={dm.value} onClick={() => changeDomain(dm.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${domain === dm.value ? "bg-indigo-600 text-white" : d ? "text-gray-300 hover:bg-gray-800" : "text-slate-600 hover:bg-slate-50"}`}>
                <span>{dm.icon}</span> {dm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions — grouped by domain */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase tracking-wide ${d ? "text-gray-500" : "text-slate-400"}`}>Past chats</p>
            <button onClick={startNewChat} className="text-xs text-indigo-500 hover:text-indigo-400 font-medium">+ New</button>
          </div>
          {sessions.length === 0 && (
            <p className={`text-xs ${d ? "text-gray-600" : "text-slate-400"}`}>No past chats yet.</p>
          )}
          {groupedSessions.map(({ domain: dm, sessions: domainSessions }) => (
            <div key={dm.value} className="mb-4">
              <button onClick={() => { setDomain(dm.value); setSidebarOpen(false); _restoreSession(domainSessions[0].id); }}
                className="flex items-center gap-1.5 px-1 mb-1 w-full text-left">
                <span className="text-sm">{dm.icon}</span>
                <p className={`text-xs font-semibold ${domain === dm.value ? "text-indigo-500" : d ? "text-gray-400" : "text-slate-500"}`}>{dm.label}</p>
                <span className={`text-xs ml-auto px-1.5 py-0.5 rounded-full ${d ? "bg-gray-800 text-gray-500" : "bg-slate-100 text-slate-400"}`}>
                  {domainSessions.length}
                </span>
              </button>
              {domainSessions.map((s, i) => {
                const date = new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                return (
                  <button key={s.id} onClick={() => { setDomain(dm.value); loadSessionMessages(s.id); }}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-0.5 transition-all ${s.id === sessionId ? "bg-indigo-600 text-white" : d ? "hover:bg-gray-800 text-gray-300" : "hover:bg-slate-50 text-slate-600"}`}>
                    <p className={`text-xs truncate ${s.id === sessionId ? "text-white" : d ? "text-gray-300" : "text-slate-700"}`}>
                      {s.summary ? s.summary.slice(0, 45) + (s.summary.length > 45 ? "…" : "") : `Chat ${i + 1}`}
                    </p>
                    <p className={`text-xs mt-0.5 ${s.id === sessionId ? "text-indigo-200" : d ? "text-gray-600" : "text-slate-400"}`}>{date}</p>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sign out */}
        <div className={`px-4 py-3 border-t ${d ? "border-gray-800" : "border-slate-100"}`}>
          <button onClick={signOut} className={`text-xs ${d ? "text-gray-500 hover:text-gray-300" : "text-slate-400 hover:text-slate-600"}`}>Sign out</button>
        </div>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className={`relative flex items-center justify-between px-4 py-3 border-b ${d ? "bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 border-indigo-900" : "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 border-transparent"}`}>
          {/* Decorative blobs — clipped separately so they don't affect dropdown */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/5 blur-xl" />
            <div className="absolute -bottom-8 right-32 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
          </div>

          <div className="flex items-center gap-2 relative">
            <button onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              ☰
            </button>

            <LogoWithName size={24} />

            {/* Domain pill — hidden on very small screens */}
            <div className="relative hidden sm:block">
              <button onClick={() => setShowDomainPicker(p => !p)}
                className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium bg-white/20 hover:bg-white/30 text-white transition-colors">
                {currentDomain?.icon} <span className="hidden md:inline">{currentDomain?.label}</span> <span className="opacity-70">▾</span>
              </button>
              {showDomainPicker && (
                <div className={`absolute top-9 left-0 z-50 w-52 rounded-xl shadow-lg border overflow-hidden ${d ? "bg-gray-900 border-gray-700" : "bg-white border-slate-200"}`}>
                  {DOMAINS.map(dm => (
                    <button key={dm.value} onClick={() => changeDomain(dm.value)}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${dm.value === domain ? "bg-indigo-600 text-white" : d ? "text-gray-300 hover:bg-gray-800" : "text-slate-700 hover:bg-slate-50"}`}>
                      {dm.icon} {dm.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleDark}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 text-white transition-colors">
              {d ? "☀️" : "🌙"}
            </button>
            <button onClick={startNewChat}
              className="hidden sm:flex text-xs font-medium px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors">
              + New chat
            </button>
          </div>

          <div className="flex items-center gap-2 relative">
            {freeRemaining !== null && (
              <span className="hidden sm:inline text-xs text-white/60">{freeRemaining} free left</span>
            )}
            <button onClick={signOut}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        </header>

        {/* Disclaimer */}
        <div className={`px-4 py-1.5 text-xs text-center border-b ${d ? "bg-gray-900 border-gray-800 text-gray-500" : "bg-orange-50 border-orange-200 text-orange-700 font-medium"}`}>
          Not a licensed therapy service. In a crisis, contact a helpline immediately.
        </div>

        {/* Chat window */}
        <div className="flex-1 overflow-hidden flex items-start justify-center px-2 py-2 sm:px-4 sm:py-5 relative" style={{
          background: d
            ? "radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.15) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse at 15% 85%, rgba(165,180,252,0.55) 0%, transparent 50%), radial-gradient(ellipse at 85% 15%, rgba(216,180,254,0.45) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(238,242,255,0.8) 0%, transparent 65%), radial-gradient(ellipse at 70% 90%, rgba(253,230,244,0.4) 0%, transparent 40%)"
        }}>

          <div className="hidden md:block"><Illustrations dark={d} /></div>

          <div className={`w-full max-w-2xl h-full flex flex-col rounded-none sm:rounded-2xl shadow-none sm:shadow-xl overflow-hidden border-0 sm:border ${d ? "bg-gray-900 sm:border-gray-800" : "bg-white sm:border-slate-200"}`}>
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className={`text-center text-sm mt-16 ${d ? "text-gray-500" : "text-slate-400"}`}>
                  <p className="text-3xl mb-3">💬</p>
                  <p className="font-medium">Hey{user?.name ? ` ${user.name}` : ""}, I&apos;m here.</p>
                  <p className="mt-1 text-xs">What&apos;s on your mind? No rush.</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600">🤗</div>
                  )}
                  <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm whitespace-pre-wrap"
                      : d ? "bg-gray-800 text-gray-50 rounded-bl-sm border border-gray-600"
                        : "bg-indigo-50 text-slate-900 rounded-bl-sm border border-indigo-100"
                  }`}>
                    {msg.role === "user" ? msg.content : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-snug">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          h3: ({ children }) => <h3 className="font-semibold text-sm mt-2 mb-1">{children}</h3>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    {msg.role === "assistant" && streaming && i === messages.length - 1 && <span className="animate-pulse ml-0.5">▍</span>}
                  </div>
                </div>
              ))}

              {showCrisis && (
                <div className={`rounded-xl p-4 text-sm border ${d ? "bg-red-950 border-red-800 text-red-300" : "bg-red-50 border-red-200 text-red-800"}`}>
                  <strong>If you&apos;re in crisis, please reach out now:</strong><br />
                  India: iCall — <strong>9152987821</strong> &nbsp;|&nbsp; Vandrevala — <strong>1860-2662-345</strong><br />
                  International: <strong>findahelpline.com</strong>
                </div>
              )}

              {pendingSuggestedDomain && !streaming && (() => {
                const suggested = DOMAINS.find(dm => dm.value === pendingSuggestedDomain);
                return suggested ? (
                  <div className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm border ${d ? "bg-indigo-950 border-indigo-800 text-indigo-200" : "bg-indigo-50 border-indigo-200 text-indigo-800"}`}>
                    <span>Switch to <strong>{suggested.icon} {suggested.label}</strong> mode for deeper support?</span>
                    <div className="flex gap-2 ml-3 flex-shrink-0">
                      <button
                        onClick={() => changeDomain(pendingSuggestedDomain)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                        Switch
                      </button>
                      <button
                        onClick={() => setPendingSuggestedDomain(null)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${d ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"}`}>
                        Stay
                      </button>
                    </div>
                  </div>
                ) : null;
              })()}

              {blocked && (
                <div className={`rounded-xl p-4 text-sm text-center ${d ? "bg-gray-800 text-gray-300" : "bg-slate-100 text-slate-700"}`}>
                  You&apos;ve used all your free messages.{" "}
                  <a href="/billing" className="text-indigo-500 font-medium underline">Buy credits</a> to continue.
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className={`px-3 py-3 sm:px-4 border-t ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-100"}`}>
              {/* Voice mode banner */}
              {voiceMode && (
                <div className={`flex items-center justify-between mb-2 px-1 text-xs ${d ? "text-indigo-300" : "text-indigo-600"}`}>
                  <span>🎙️ Voice mode on — tap mic to speak</span>
                  <button onClick={() => setVoiceMode(false)} className="underline opacity-70 hover:opacity-100">Turn off</button>
                </div>
              )}
              <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2 items-end">
                {/* Voice button */}
                {/* Mode toggle or Voice button */}
                {token && (
                  voiceMode ? (
                    <VoiceButton
                      token={token}
                      dark={d}
                      disabled={streaming || blocked}
                      voiceMode={voiceMode}
                      onTranscript={(text) => {
                        setInput(text);
                        // Auto-send after getting transcript
                        setTimeout(() => {
                          if (text.trim() && !streaming && !blocked) {
                            const form = document.querySelector("form") as HTMLFormElement;
                            form?.dispatchEvent(new Event("submit", { bubbles: true }));
                          }
                        }, 100);
                      }}
                      onAssistantText={() => {}}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setVoiceMode(true)}
                      title="Switch to voice mode"
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${d ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
                    >
                      🎙️
                    </button>
                  )
                )}

                {/* Text input — disabled in voice mode */}
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={streaming || blocked || voiceMode}
                  placeholder={blocked ? "No messages remaining" : voiceMode ? "Mic is listening…" : "Share what's on your mind…"}
                  className={`flex-1 rounded-xl px-4 py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${d ? "bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500 disabled:opacity-40" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 disabled:opacity-50"}`}
                />
                <button type="submit" disabled={streaming || blocked || !input.trim() || voiceMode}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 sm:px-5 py-3 text-sm font-medium transition-colors disabled:opacity-40 shadow-sm min-w-[64px]">
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
