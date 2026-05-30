"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const AGE_RANGES = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"];

const DOMAINS = [
  { value: "school_bullying", icon: "🏫", label: "School / College life", desc: "Bullying, peer pressure, academic stress" },
  { value: "heartbreak", icon: "💔", label: "Relationships & heartbreak", desc: "Breakups, rejection, loneliness" },
  { value: "domestic", icon: "🏠", label: "Family stuff", desc: "Conflict at home, difficult relationships" },
  { value: "financial", icon: "💸", label: "Money & work stress", desc: "Financial pressure, job anxiety" },
  { value: "workplace", icon: "💼", label: "Workplace", desc: "Burnout, toxic environment, career worries" },
];

const IMPACT_OPTIONS = [
  { value: "sleep", label: "😴 Can't sleep properly" },
  { value: "appetite", label: "🍽️ Eating more or less than usual" },
  { value: "focus", label: "🧠 Hard to concentrate" },
  { value: "motivation", label: "🪫 Lost motivation" },
  { value: "relationships", label: "🫂 Pulling away from people" },
  { value: "work", label: "💻 Affecting work or studies" },
  { value: "mood", label: "🌧️ Mood swings or feeling low" },
  { value: "physical", label: "😣 Headaches, fatigue, body tension" },
];

const SUPPORT_TYPES = [
  { value: "vent", icon: "🗣️", label: "I just need to vent", desc: "Someone to listen without judgment" },
  { value: "advice", icon: "💡", label: "I want advice", desc: "Help me figure out what to do" },
  { value: "perspective", icon: "🔭", label: "Give me perspective", desc: "Help me see things differently" },
  { value: "all", icon: "🤝", label: "All of the above", desc: "Go with the flow" },
];

type Profile = {
  name: string;
  age_range: string;
  gender: string;
  domain: string;
  situation: string;
  duration: string;
  severity: number;
  impact: string[];
  previous_therapy: string;
  current_support: string;
  support_type: string;
  goals: string;
};

const empty: Profile = {
  name: "", age_range: "", gender: "", domain: "", situation: "",
  duration: "", severity: 5, impact: [], previous_therapy: "",
  current_support: "", support_type: "", goals: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(empty);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Profile, value: unknown) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const toggleImpact = (val: string) =>
    set("impact", profile.impact.includes(val)
      ? profile.impact.filter((v) => v !== val)
      : [...profile.impact, val]);

  const steps = [
    {
      title: `Hey there 👋`,
      subtitle: "Before we start — tell me a little about yourself. Nothing formal, just so I can talk to you properly.",
      canNext: profile.name.trim().length > 0 && profile.age_range.length > 0,
    },
    {
      title: `So, what's going on?`,
      subtitle: "No right or wrong answer here. Just share what feels most relevant.",
      canNext: profile.domain.length > 0 && profile.situation.trim().length > 10,
    },
    {
      title: "How's it been hitting you?",
      subtitle: "Sometimes things affect us in ways we don't even notice. Let's check in.",
      canNext: profile.impact.length > 0,
    },
    {
      title: "Last few things 🙏",
      subtitle: "This helps me show up for you in the right way.",
      canNext: profile.support_type.length > 0,
    },
  ];

  async function handleSubmit() {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("users").update(profile).eq("id", session.user.id);
    }
    router.push("/chat");
  }

  const current = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-indigo-500" : "bg-slate-200"}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">{current.title}</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{current.subtitle}</p>

          {/* Step 0 — About you */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">What would you like to be called?</label>
                <p className="text-xs text-slate-400 mb-2">Use a nickname if you prefer — this is just how I'll refer to you in chat. Your real identity stays private.</p>
                <input
                  type="text"
                  placeholder="e.g. Alex, Sky, anything you're comfortable with"
                  value={profile.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">How old are you?</label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((a) => (
                    <button key={a} onClick={() => set("age_range", a)}
                      className={`px-4 py-1.5 rounded-full text-sm border transition-all ${profile.age_range === a ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">How do you identify? <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="flex flex-wrap gap-2">
                  {["He/him", "She/her", "They/them", "Prefer not to say"].map((g) => (
                    <button key={g} onClick={() => set("gender", g)}
                      className={`px-4 py-1.5 rounded-full text-sm border transition-all ${profile.gender === g ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — What's going on */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">What area of your life feels hardest right now?</label>
                <div className="flex flex-col gap-2">
                  {DOMAINS.map((d) => (
                    <button key={d.value} onClick={() => set("domain", d.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${profile.domain === d.value ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <span className="text-2xl">{d.icon}</span>
                      <div>
                        <p className={`text-sm font-medium ${profile.domain === d.value ? "text-indigo-700" : "text-slate-800"}`}>{d.label}</p>
                        <p className="text-xs text-slate-500">{d.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Tell me a bit more — what's been happening?</label>
                <textarea
                  rows={3}
                  placeholder="Just write freely, there's no judgment here..."
                  value={profile.situation}
                  onChange={(e) => set("situation", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">How long has this been going on?</label>
                <div className="flex flex-wrap gap-2">
                  {["Just started", "A few weeks", "A few months", "Over a year", "Most of my life"].map((d) => (
                    <button key={d} onClick={() => set("duration", d)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${profile.duration === d ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — How it's affecting you */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">On a scale of 1–10, how heavy does this feel right now?</label>
                <p className="text-xs text-slate-400 mb-3">1 = a bit annoying, 10 = completely overwhelming</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">1</span>
                  <input type="range" min={1} max={10} value={profile.severity}
                    onChange={(e) => set("severity", Number(e.target.value))}
                    className="flex-1 accent-indigo-600" />
                  <span className="text-xs text-slate-400">10</span>
                  <span className="w-8 text-center text-indigo-600 font-semibold text-sm">{profile.severity}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">How's it showing up in your day-to-day? <span className="text-slate-400 font-normal">(pick all that apply)</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {IMPACT_OPTIONS.map((o) => (
                    <button key={o.value} onClick={() => toggleImpact(o.value)}
                      className={`p-2.5 rounded-xl border text-left text-sm transition-all ${profile.impact.includes(o.value) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Have you talked to anyone about this before?</label>
                <div className="flex flex-wrap gap-2">
                  {["Not really", "Friends or family", "Seen a therapist before", "Currently in therapy"].map((o) => (
                    <button key={o} onClick={() => set("previous_therapy", o)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${profile.previous_therapy === o ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Do you have people around you right now you can lean on?</label>
                <div className="flex flex-wrap gap-2">
                  {["Yes, a few", "One or two people", "Not really", "Feels very alone"].map((o) => (
                    <button key={o} onClick={() => set("current_support", o)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${profile.current_support === o ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — What you need */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">What kind of support feels most helpful to you right now?</label>
                <div className="flex flex-col gap-2">
                  {SUPPORT_TYPES.map((s) => (
                    <button key={s.value} onClick={() => set("support_type", s.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${profile.support_type === s.value ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <p className={`text-sm font-medium ${profile.support_type === s.value ? "text-indigo-700" : "text-slate-800"}`}>{s.label}</p>
                        <p className="text-xs text-slate-500">{s.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">What would feeling better actually look like for you?</label>
                <textarea rows={2} placeholder="e.g. I just want to stop overthinking at night..."
                  value={profile.goals} onChange={(e) => set("goals", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Anything else you want me to know before we start? <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea rows={2} placeholder="Anything at all..."
                  value={profile.situation.includes("|||") ? profile.situation.split("|||")[1] : ""}
                  onChange={(e) => set("situation", profile.situation.split("|||")[0] + "|||" + e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
                ← Back
              </button>
            ) : <div />}

            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} disabled={!current.canNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-xl transition-colors disabled:opacity-40">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!current.canNext || saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-xl transition-colors disabled:opacity-40">
                {saving ? "Setting up…" : "Let's talk 💬"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">Your answers stay private and help me support you better.</p>
      </div>
    </div>
  );
}
