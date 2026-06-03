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

type GlobalProfile = {
  name: string; age_range: string; gender: string;
  previous_therapy: string; current_support: string;
};

type DomainProfile = {
  situation: string; duration: string; severity: number;
  impact: string[]; support_type: string; goals: string;
};

const emptyDomain: DomainProfile = {
  situation: "", duration: "", severity: 5, impact: [], support_type: "", goals: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [global, setGlobal] = useState<GlobalProfile>({
    name: "", age_range: "", gender: "", previous_therapy: "", current_support: "",
  });
  const [domain, setDomain] = useState("");
  const [domainData, setDomainData] = useState<DomainProfile>(emptyDomain);
  const [saving, setSaving] = useState(false);

  const setG = (key: keyof GlobalProfile, value: string) => setGlobal(p => ({ ...p, [key]: value }));
  const setD = (key: keyof DomainProfile, value: unknown) => setDomainData(p => ({ ...p, [key]: value }));
  const toggleImpact = (val: string) =>
    setD("impact", domainData.impact.includes(val)
      ? domainData.impact.filter(v => v !== val)
      : [...domainData.impact, val]);

  const steps = [
    {
      title: "Hey there 👋",
      subtitle: "Just your name and a couple of basics — nothing heavy yet.",
      canNext: global.name.trim().length > 0 && global.age_range.length > 0,
    },
    {
      title: "What's been going on?",
      subtitle: "Pick the area that feels hardest right now, then tell me what's happening. Take your time.",
      canNext: domain.length > 0 && domainData.situation.trim().length > 10,
    },
    {
      title: "How's it been affecting you?",
      subtitle: "Sometimes things show up in ways we don't even notice. Let's check in.",
      canNext: domainData.impact.length > 0,
    },
    {
      title: "A little more context 🙏",
      subtitle: "Now that I know what's going on — these last few questions help me support you better.",
      canNext: domainData.support_type.length > 0,
    },
  ];

  async function handleSubmit() {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const uid = session.user.id;
      // Save global profile
      await supabase.from("users").update({ ...global, domain }).eq("id", uid);
      // Save domain-specific profile
      await supabase.from("user_domain_profiles").upsert({
        user_id: uid,
        domain,
        ...domainData,
      }, { onConflict: "user_id,domain" });
    }
    router.push("/chat");
  }

  const current = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-3 py-8 sm:px-4 sm:py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-indigo-500" : "bg-slate-200"}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">{current.title}</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{current.subtitle}</p>

          {/* Step 0 — Just the basics */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">What would you like to be called?</label>
                <p className="text-xs text-slate-400 mb-2">Use a nickname if you prefer — keeps your identity private in chat.</p>
                <input type="text" placeholder="e.g. Alex, Sky…" value={global.name} onChange={e => setG("name", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">How old are you?</label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map(a => (
                    <button key={a} onClick={() => setG("age_range", a)}
                      className={`px-4 py-1.5 rounded-full text-sm border transition-all ${global.age_range === a ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">How do you identify? <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="flex flex-wrap gap-2">
                  {["He/him", "She/her", "They/them", "Prefer not to say"].map(g => (
                    <button key={g} onClick={() => setG("gender", g)}
                      className={`px-4 py-1.5 rounded-full text-sm border transition-all ${global.gender === g ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Domain + situation */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">What area of your life feels hardest right now?</label>
                <div className="flex flex-col gap-2">
                  {DOMAINS.map(dm => (
                    <button key={dm.value} onClick={() => setDomain(dm.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${domain === dm.value ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <span className="text-2xl">{dm.icon}</span>
                      <div>
                        <p className={`text-sm font-medium ${domain === dm.value ? "text-indigo-700" : "text-slate-800"}`}>{dm.label}</p>
                        <p className="text-xs text-slate-500">{dm.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {domain && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Tell me what's been going on with {DOMAINS.find(d => d.value === domain)?.label.toLowerCase()}
                  </label>
                  <textarea rows={3} placeholder="Just write freely, no judgment here…"
                    value={domainData.situation} onChange={e => setD("situation", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                </div>
              )}
              {domain && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">How long has this been going on?</label>
                  <div className="flex flex-wrap gap-2">
                    {["Just started", "A few weeks", "A few months", "Over a year", "Most of my life"].map(dur => (
                      <button key={dur} onClick={() => setD("duration", dur)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${domainData.duration === dur ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Impact */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">How heavy does this feel right now?</label>
                <p className="text-xs text-slate-400 mb-3">1 = a bit annoying, 10 = completely overwhelming</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">1</span>
                  <input type="range" min={1} max={10} value={domainData.severity}
                    onChange={e => setD("severity", Number(e.target.value))} className="flex-1 accent-indigo-600" />
                  <span className="text-xs text-slate-400">10</span>
                  <span className="w-8 text-center text-indigo-600 font-semibold text-sm">{domainData.severity}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">How is it showing up day-to-day? <span className="text-slate-400 font-normal">(pick all that apply)</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {IMPACT_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => toggleImpact(o.value)}
                      className={`p-2.5 rounded-xl border text-left text-sm transition-all ${domainData.impact.includes(o.value) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Support style + context */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">What kind of support feels right for this?</label>
                <div className="flex flex-col gap-2">
                  {SUPPORT_TYPES.map(s => (
                    <button key={s.value} onClick={() => setD("support_type", s.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${domainData.support_type === s.value ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <p className={`text-sm font-medium ${domainData.support_type === s.value ? "text-indigo-700" : "text-slate-800"}`}>{s.label}</p>
                        <p className="text-xs text-slate-500">{s.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">What would feeling better look like for you?</label>
                <textarea rows={2} placeholder="e.g. I just want to stop overthinking at night…"
                  value={domainData.goals} onChange={e => setD("goals", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Have you talked to anyone about this before?</label>
                <div className="flex flex-wrap gap-2">
                  {["Not really", "Friends or family", "Seen a therapist before", "Currently in therapy"].map(o => (
                    <button key={o} onClick={() => setG("previous_therapy", o)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${global.previous_therapy === o ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Do you have people around you right now you can lean on?</label>
                <div className="flex flex-wrap gap-2">
                  {["Yes, a few", "One or two people", "Not really", "Feels very alone"].map(o => (
                    <button key={o} onClick={() => setG("current_support", o)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${global.current_support === o ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0
              ? <button onClick={() => setStep(step - 1)} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">← Back</button>
              : <div />}
            {step < steps.length - 1
              ? <button onClick={() => setStep(step + 1)} disabled={!current.canNext}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-xl transition-colors disabled:opacity-40">
                  Continue →
                </button>
              : <button onClick={handleSubmit} disabled={!current.canNext || saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-xl transition-colors disabled:opacity-40">
                  {saving ? "Setting up…" : "Let's talk 💬"}
                </button>
            }
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">Your answers stay private and help me support you better.</p>
      </div>
    </div>
  );
}
