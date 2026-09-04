"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const AGE_RANGES = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"];

const EDUCATION_STATUS = [
  "Middle School",
  "High School",
  "Undergraduate",
  "Private Academics or Sports Coaching",
];

const DOMAINS = [
  { value: "school_bullying", icon: "🏫", label: "School / College life", desc: "Bullying, peer pressure, exam pressure, performance anxiety, academic stress" },
  { value: "relationship_issues", icon: "💔", label: "Relationship Issues", desc: "Breakups, rejection, communication, loneliness" },
  { value: "domestic", icon: "🏠", label: "Family stuff", desc: "Conflict at home, difficult relationships" },
  { value: "financial", icon: "💸", label: "Money & work stress", desc: "Financial pressure, job anxiety" },
  { value: "workplace", icon: "💼", label: "Workplace", desc: "Burnout, toxic environment, career worries" },
];

const IMPACT_OPTIONS = [
  { value: "sleep", label: "😴 Can't sleep properly" },
  { value: "appetite", label: "🍽️ Eating more or less" },
  { value: "focus", label: "🧠 Hard to concentrate" },
  { value: "motivation", label: "🪫 Lost motivation" },
  { value: "relationships", label: "🫂 Pulling away from people" },
  { value: "work", label: "💻 Affecting work or studies" },
  { value: "mood", label: "🌧️ Mood swings or feeling low" },
  { value: "physical", label: "😣 Headaches, fatigue, tension" },
];

const SUPPORT_TYPES = [
  { value: "vent", icon: "🗣️", label: "I just need to vent" },
  { value: "advice", icon: "💡", label: "I want advice" },
  { value: "perspective", icon: "🔭", label: "Give me perspective" },
  { value: "all", icon: "🤝", label: "All of the above" },
];

type GlobalProfile = {
  name: string; age_range: string; gender: string; education_status: string;
  previous_therapy: string; current_support: string; domain: string;
};

type DomainProfile = {
  situation: string; duration: string; severity: number;
  impact: string[]; support_type: string; goals: string;
};

const emptyDomain: DomainProfile = {
  situation: "", duration: "", severity: 5, impact: [], support_type: "", goals: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [global, setGlobal] = useState<GlobalProfile>({
    name: "", age_range: "", gender: "", education_status: "", previous_therapy: "", current_support: "", domain: "",
  });
  const [activeDomain, setActiveDomain] = useState("workplace");
  const [domainProfiles, setDomainProfiles] = useState<Record<string, DomainProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem("ss-theme") === "dark");
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      const uid = data.session.user.id;
      setUserId(uid);

      // Load global profile
      const { data: p } = await supabase.from("users").select("*").eq("id", uid).single();
      if (p) {
        setGlobal({
          name: p.name || "", age_range: p.age_range || "", gender: p.gender || "",
          education_status: p.education_status || "", previous_therapy: p.previous_therapy || "",
          current_support: p.current_support || "", domain: p.domain || "workplace",
        });
        setActiveDomain(p.domain || "workplace");
      }

      // Load all domain profiles
      const { data: dps } = await supabase.from("user_domain_profiles").select("*").eq("user_id", uid);
      if (dps) {
        const map: Record<string, DomainProfile> = {};
        dps.forEach((dp: DomainProfile & { domain: string }) => {
          map[dp.domain] = {
            situation: dp.situation || "", duration: dp.duration || "",
            severity: dp.severity || 5, impact: dp.impact || [],
            support_type: dp.support_type || "", goals: dp.goals || "",
          };
        });
        setDomainProfiles(map);
      }
      setLoading(false);
    });
  }, []);

  const currentDomainData: DomainProfile = domainProfiles[activeDomain] ?? { ...emptyDomain };

  function setD(key: keyof DomainProfile, value: unknown) {
    setDomainProfiles(prev => ({
      ...prev,
      [activeDomain]: { ...(prev[activeDomain] ?? emptyDomain), [key]: value },
    }));
  }

  function toggleImpact(val: string) {
    const current = currentDomainData.impact;
    setD("impact", current.includes(val) ? current.filter(v => v !== val) : [...current, val]);
  }

  function setG(key: keyof GlobalProfile, value: string) {
    setGlobal(p => ({ ...p, [key]: value }));
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);

    // Save global profile
    await supabase.from("users").update({ ...global, domain: activeDomain }).eq("id", userId);

    // Save current domain profile
    await supabase.from("user_domain_profiles").upsert({
      user_id: userId,
      domain: activeDomain,
      ...currentDomainData,
    }, { onConflict: "user_id,domain" });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const d = dark;
  const getChipStyle = (active: boolean) => ({
    backgroundColor: active ? "#4F46E5" : "transparent",
    color: active ? "white" : d ? "#D1D5DB" : "#475569",
    borderColor: active ? "#4F46E5" : d ? "#374151" : "#CBD5E1",
    borderWidth: "1px",
    borderStyle: "solid",
    transition: "all 0.2s",
    padding: "6px 12px",
    borderRadius: "9999px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "500",
  });

  const activeDomainInfo = DOMAINS.find(dm => dm.value === activeDomain);

  if (loading) return null;

  return (
    <div className={`min-h-screen transition-colors ${d ? "bg-gray-950 text-gray-100" : "bg-slate-50 text-slate-800"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/teen/support")} className={`text-sm ${d ? "text-gray-400 hover:text-gray-200" : "text-slate-400 hover:text-slate-700"}`}>← Back to support</button>
          <span className={`font-semibold ${d ? "text-white" : "text-slate-800"}`}>Your Profile</span>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors disabled:opacity-50">
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* About you — global */}
        <section>
          <h2 className={`text-xs font-semibold uppercase tracking-widest mb-4 ${d ? "text-gray-500" : "text-slate-400"}`}>About you</h2>
          <div className={`rounded-2xl border p-5 flex flex-col gap-5 ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
            <div>
              <label className={`text-sm font-medium block mb-1.5 ${d ? "text-gray-300" : "text-slate-700"}`}>What would you like to be called?</label>
              <p className={`text-xs mb-2 ${d ? "text-gray-500" : "text-slate-400"}`}>Use a nickname to keep your identity private in chat.</p>
              <input type="text" value={global.name} onChange={e => setG("name", e.target.value)} placeholder="e.g. Alex, Sky…"
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${d ? "bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
            </div>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>Age range</label>
              <div className="flex flex-wrap gap-2">
                {AGE_RANGES.map(a => <button key={a} onClick={() => setG("age_range", a)} style={getChipStyle(global.age_range === a)}>{a}</button>)}
              </div>
            </div>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>Gender <span className={d ? "text-gray-600 font-normal" : "text-slate-400 font-normal"}>— optional</span></label>
              <div className="flex flex-wrap gap-2">
                {["He/him", "She/her", "They/them", "Prefer not to say"].map(g => <button key={g} onClick={() => setG("gender", g)} style={getChipStyle(global.gender === g)}>{g}</button>)}
              </div>
            </div>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>What's your current education status? <span className={d ? "text-gray-600 font-normal" : "text-slate-400 font-normal"}>— optional</span></label>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_STATUS.map(e => <button key={e} onClick={() => setG("education_status", e)} style={getChipStyle(global.education_status === e)}>{e}</button>)}
              </div>
            </div>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>Have you talked to anyone about this?</label>
              <div className="flex flex-wrap gap-2">
                {["Not really", "Friends or family", "Seen a therapist before", "Currently in therapy"].map(o => <button key={o} onClick={() => setG("previous_therapy", o)} style={getChipStyle(global.previous_therapy === o)}>{o}</button>)}
              </div>
            </div>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>People you can lean on right now?</label>
              <div className="flex flex-wrap gap-2">
                {["Yes, a few", "One or two people", "Not really", "Feels very alone"].map(o => <button key={o} onClick={() => setG("current_support", o)} style={getChipStyle(global.current_support === o)}>{o}</button>)}
              </div>
            </div>
          </div>
        </section>

        {/* Domain tabs */}
        <section>
          <h2 className={`text-xs font-semibold uppercase tracking-widest mb-4 ${d ? "text-gray-500" : "text-slate-400"}`}>What you're dealing with</h2>
          <p className={`text-xs mb-3 ${d ? "text-gray-600" : "text-slate-400"}`}>Each topic is saved separately — switch between them to update your details for each one.</p>

          {/* Domain switcher tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {DOMAINS.map(dm => (
              <button key={dm.value} onClick={() => setActiveDomain(dm.value)}
                style={getChipStyle(activeDomain === dm.value)}
                className="flex items-center gap-1.5">
                {dm.icon} {dm.label.split(" ")[0]}
                {domainProfiles[dm.value]?.situation ? " ✓" : ""}
              </button>
            ))}
          </div>

          {/* Domain-specific fields */}
          <div className={`rounded-2xl border p-5 flex flex-col gap-5 ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
            <div className={`flex items-center gap-2 pb-3 border-b ${d ? "border-gray-800" : "border-slate-100"}`}>
              <span className="text-xl">{activeDomainInfo?.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${d ? "text-gray-200" : "text-slate-800"}`}>{activeDomainInfo?.label}</p>
                <p className={`text-xs ${d ? "text-gray-500" : "text-slate-400"}`}>{activeDomainInfo?.desc}</p>
              </div>
            </div>

            <div>
              <label className={`text-sm font-medium block mb-1.5 ${d ? "text-gray-300" : "text-slate-700"}`}>What's been going on?</label>
              <textarea rows={3} value={currentDomainData.situation} onChange={e => setD("situation", e.target.value)}
                placeholder={`Tell me about what's happening with ${activeDomainInfo?.label.toLowerCase()}…`}
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${d ? "bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
            </div>

            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>How long has this been going on?</label>
              <div className="flex flex-wrap gap-2">
                {["Just started", "A few weeks", "A few months", "Over a year", "Most of my life"].map(dur => (
                  <button key={dur} onClick={() => setD("duration", dur)} style={getChipStyle(currentDomainData.duration === dur)}>{dur}</button>
                ))}
              </div>
            </div>

            <div>
              <label className={`text-sm font-medium block mb-1 ${d ? "text-gray-300" : "text-slate-700"}`}>How heavy does it feel? <span className="text-indigo-500 font-semibold">{currentDomainData.severity}/10</span></label>
              <input type="range" min={1} max={10} value={currentDomainData.severity}
                onChange={e => setD("severity", Number(e.target.value))} className="w-full accent-indigo-600 mt-2" />
            </div>

            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>How is it affecting you day-to-day?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {IMPACT_OPTIONS.map(o => {
                  const isSelected = currentDomainData.impact.includes(o.value);
                  return (
                    <button key={o.value} onClick={() => toggleImpact(o.value)}
                      style={{
                        padding: "10px",
                        borderRadius: "12px",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        textAlign: "left",
                        fontSize: "14px",
                        transition: "all 0.2s",
                        backgroundColor: isSelected ? (d ? "#312e81" : "#eef2ff") : "transparent",
                        borderColor: isSelected ? "#6366f1" : (d ? "#374151" : "#cbd5e1"),
                        color: isSelected ? (d ? "#a5b4fc" : "#4f46e5") : (d ? "#d1d5db" : "#475569"),
                        cursor: "pointer",
                      }}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>What kind of support helps for this?</label>
              <div className="flex flex-col gap-2">
                {SUPPORT_TYPES.map(s => {
                  const isSelected = currentDomainData.support_type === s.value;
                  return (
                    <button key={s.value} onClick={() => setD("support_type", s.value)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        borderRadius: "12px",
                        borderWidth: "2px",
                        borderStyle: "solid",
                        textAlign: "left",
                        transition: "all 0.2s",
                        backgroundColor: isSelected ? (d ? "#312e81" : "#eef2ff") : "transparent",
                        borderColor: isSelected ? "#6366f1" : (d ? "#374151" : "#cbd5e1"),
                        cursor: "pointer",
                      }}>
                      <span style={{ fontSize: "18px" }}>{s.icon}</span>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: isSelected ? (d ? "#a5b4fc" : "#4f46e5") : (d ? "#d1d5db" : "#1f2937"),
                      }}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={`text-sm font-medium block mb-1.5 ${d ? "text-gray-300" : "text-slate-700"}`}>What would feeling better look like?</label>
              <textarea rows={2} value={currentDomainData.goals} onChange={e => setD("goals", e.target.value)}
                placeholder="e.g. I want to feel less anxious when I go to work…"
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${d ? "bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
            </div>
          </div>
        </section>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-50 mb-4">
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
