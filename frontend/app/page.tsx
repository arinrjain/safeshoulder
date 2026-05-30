import Link from "next/link";
import { Logo } from "@/components/Logo";

const DOMAINS = [
  { icon: "🏫", label: "School Bullying", desc: "Peer pressure, exclusion, academic stress" },
  { icon: "💔", label: "Heartbreak", desc: "Breakups, rejection, loneliness" },
  { icon: "🏠", label: "Family Conflict", desc: "Difficult home environments" },
  { icon: "💸", label: "Financial Stress", desc: "Debt anxiety, job loss, money shame" },
  { icon: "💼", label: "Workplace", desc: "Burnout, toxic managers, career anxiety" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <Logo size={20} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">SafeShoulder</span>
        </div>
        <Link
          href="/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Get started
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20 max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
          <Logo size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
          A safe space to talk and be heard
        </h1>
        <p className="text-slate-500 text-lg mb-8 leading-relaxed">
          SafeShoulder is an AI companion that listens without judgment. Whether you&apos;re
          dealing with stress, heartbreak, or conflict — you don&apos;t have to face it alone.
        </p>
        <Link
          href="/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-xl text-base transition-colors"
        >
          Start talking — it&apos;s free
        </Link>
        <p className="text-xs text-slate-400 mt-3">20 free messages. No credit card needed.</p>
      </section>

      {/* Domains */}
      <section className="px-6 pb-20 max-w-3xl mx-auto w-full">
        <h2 className="text-center text-slate-700 font-semibold mb-6">What can I talk about?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DOMAINS.map((d) => (
            <div key={d.label} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 items-start">
              <span className="text-2xl">{d.icon}</span>
              <div>
                <p className="font-medium text-slate-800 text-sm">{d.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="text-center text-xs text-slate-400 pb-8 px-6">
        SafeShoulder is not a licensed therapy or medical service. In a crisis, please contact a helpline immediately.
      </footer>
    </div>
  );
}
