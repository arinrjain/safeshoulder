"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const AGE_RANGES = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"];

const DOMAINS = [
  { value: "school_bullying", icon: "🏫", label: "School / College life" },
  { value: "heartbreak", icon: "💔", label: "Relationships & heartbreak" },
  { value: "domestic", icon: "🏠", label: "Family stuff" },
  { value: "financial", icon: "💸", label: "Money & work stress" },
  { value: "workplace", icon: "💼", label: "Workplace" },
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

type Profile = {
  name: string; age_range: string; gender: string; domain: string;
  situation: string; duration: string; severity: number; impact: string[];
  previous_therapy: string; current_support: string; support_type: string; goals: string;
};

const empty: Profile = {
  name: "", age_range: "", gender: "", domain: "", situation: "",
  duration: "", severity: 5, impact: [], previous_therapy: "",
  current_support: "", support_type: "", goals: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem("ss-theme") === "dark");
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      const { data: p } = await supabase.from("users").select("*").eq("id", data.session.user.id).single();
      if (p) setProfile({ ...empty, ...p, impact: p.impact || [], severity: p.severity || 5 });
      setLoading(false);
    });
  }, []);

  const set = (key: keyof Profile, value: unknown) => setProfile((p) => ({ ...p, [key]: value }));
  const toggleImpact = (val: string) =>
    set("impact", profile.impact.includes(val) ? profile.impact.filter(v => v !== val) : [...profile.impact, val]);

  async function handleSave() {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("users").update(profile).eq("id", session.user.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const d = dark;
  const chip = (active: boolean) =>
    active ? "bg-indigo-600 text-white border-indigo-600" : d ? "border-gray-700 text-gray-300 hover:border-indigo-500" : "border-slate-200 text-slate-600 hover:border-indigo-300";
  const card = (active: boolean) =>
    active ? "border-indigo-500 bg-indigo-50 " + (d ? "!bg-indigo-950" : "") : d ? "border-gray-700 hover:border-gray-600" : "border-slate-200 hover:border-slate-300";

  if (loading) return null;

  return (
    <div className={`min-h-screen transition-colors ${d ? "bg-gray-950 text-gray-100" : "bg-slate-50 text-slate-800"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/chat")} className={`text-sm ${d ? "text-gray-400 hover:text-gray-200" : "text-slate-400 hover:text-slate-700"}`}>← Back to chat</button>
          <span className={`font-semibold ${d ? "text-white" : "text-slate-800"}`}>Your Profile</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* About you */}
        <section>
          <h2 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${d ? "text-gray-400" : "text-slate-400"}`}>About you</h2>
          <div className={`rounded-2xl border p-5 flex flex-col gap-5 ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
            <div>
              <label className={`text-sm font-medium block mb-1.5 ${d ? "text-gray-300" : "text-slate-700"}`}>What would you like to be called?</label>
              <p className={`text-xs mb-2 ${d ? "text-gray-500" : "text-slate-400"}`}>Use a nickname to keep your identity private in chat.</p>
              <input type="text" value={profile.name} onChange={e => set("name", e.target.value)}
                placeholder="e.g. Alex, Sky…"
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${d ? "bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
            </div>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>Age range</label>
              <div className="flex flex-wrap gap-2">
                {AGE_RANGES.map(a => (
                  <button key={a} onClick={() => set("age_range", a)} className={`px-3 py-1.5 rounded-full text-sm border transition-all ${chip(profile.age_range === a)}`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>Gender <span className={d ? "text-gray-600" : "text-slate-400"}>— optional</span></label>
              <div className="flex flex-wrap gap-2">
                {["He/him", "She/her", "They/them", "Prefer not to say"].map(g => (
                  <button key={g} onClick={() => set("gender", g)} className={`px-3 py-1.5 rounded-full text-sm border transition-all ${chip(profile.gender === g)}`}>{g}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What's going on */}
        <section>
          <h2 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${d ? "text-gray-400" : "text-slate-400"}`}>What you're dealing with</h2>
          <div className={`rounded-2xl border p-5 flex flex-col gap-5 ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>Area of focus</label>
              <div className="flex flex-col gap-2">
                {DOMAINS.map(dm => (
                  <button key={dm.value} onClick={() => set("domain", dm.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${card(profile.domain === dm.value)}`}>
                    <span className="text-xl">{dm.icon}</span>
                    <span className={`text-sm font-medium ${profile.domain === dm.value ? "text-indigo-600" : d ? "text-gray-200" : "text-slate-700"}`}>{dm.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={`text-sm font-medium block mb-1.5 ${d ? "text-gray-300" : "text-slate-700"}`}>What's been going on?</label>
              <textarea rows={3} value={profile.situation.split("|||")[0]} onChange={e => set("situation", e.target.value + (profile.situation.includes("|||") ? "|||" + profile.situation.split("|||")[1] : ""))}
                placeholder="Just write freely…"
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${d ? "bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
            </div>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>How long has this been going on?</label>
              <div className="flex flex-wrap gap-2">
                {["Just started", "A few weeks", "A few months", "Over a year", "Most of my life"].map(dur => (
                  <button key={dur} onClick={() => set("duration", dur)} className={`px-3 py-1.5 rounded-full text-sm border transition-all ${chip(profile.duration === dur)}`}>{dur}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Impact */}
        <section>
          <h2 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${d ? "text-gray-400" : "text-slate-400"}`}>How it's affecting you</h2>
          <div className={`rounded-2xl border p-5 flex flex-col gap-5 ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
            <div>
              <label className={`text-sm font-medium block mb-1 ${d ? "text-gray-300" : "text-slate-700"}`}>How heavy does it feel? <span className="text-indigo-500 font-semibold">{profile.severity}/10</span></label>
              <input type="range" min={1} max={10} value={profile.severity} onChange={e => set("severity", Number(e.target.value))}
                className="w-full accent-indigo-600 mt-2" />
            </div>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>Day-to-day impact</label>
              <div className="grid grid-cols-2 gap-2">
                {IMPACT_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => toggleImpact(o.value)}
                    className={`p-2.5 rounded-xl border text-left text-sm transition-all ${profile.impact.includes(o.value) ? "border-indigo-500 bg-indigo-50 text-indigo-700 " + (d ? "!bg-indigo-950 !text-indigo-300" : "") : d ? "border-gray-700 text-gray-300 hover:border-gray-600" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>Have you talked to anyone about this?</label>
              <div className="flex flex-wrap gap-2">
                {["Not really", "Friends or family", "Seen a therapist before", "Currently in therapy"].map(o => (
                  <button key={o} onClick={() => set("previous_therapy", o)} className={`px-3 py-1.5 rounded-full text-sm border transition-all ${chip(profile.previous_therapy === o)}`}>{o}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>People you can lean on right now?</label>
              <div className="flex flex-wrap gap-2">
                {["Yes, a few", "One or two people", "Not really", "Feels very alone"].map(o => (
                  <button key={o} onClick={() => set("current_support", o)} className={`px-3 py-1.5 rounded-full text-sm border transition-all ${chip(profile.current_support === o)}`}>{o}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Support style */}
        <section>
          <h2 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${d ? "text-gray-400" : "text-slate-400"}`}>What you need</h2>
          <div className={`rounded-2xl border p-5 flex flex-col gap-5 ${d ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
            <div>
              <label className={`text-sm font-medium block mb-2 ${d ? "text-gray-300" : "text-slate-700"}`}>How should I show up for you?</label>
              <div className="flex flex-col gap-2">
                {SUPPORT_TYPES.map(s => (
                  <button key={s.value} onClick={() => set("support_type", s.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${card(profile.support_type === s.value)}`}>
                    <span className="text-xl">{s.icon}</span>
                    <span className={`text-sm font-medium ${profile.support_type === s.value ? "text-indigo-600" : d ? "text-gray-200" : "text-slate-700"}`}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={`text-sm font-medium block mb-1.5 ${d ? "text-gray-300" : "text-slate-700"}`}>What would feeling better look like?</label>
              <textarea rows={2} value={profile.goals} onChange={e => set("goals", e.target.value)}
                placeholder="e.g. I just want to stop overthinking at night…"
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${d ? "bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500" : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
            </div>
            <div>
              <label className={`text-sm font-medium block mb-1.5 ${d ? "text-gray-300" : "text-slate-700"}`}>Anything else I should know? <span className={d ? "text-gray-600" : "text-slate-400"}>— optional</span></label>
              <textarea rows={2}
                value={profile.situation.includes("|||") ? profile.situation.split("|||")[1] : ""}
                onChange={e => set("situation", profile.situation.split("|||")[0] + "|||" + e.target.value)}
                placeholder="Anything at all…"
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
