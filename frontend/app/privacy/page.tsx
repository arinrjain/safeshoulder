import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <Logo size={20} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">SafeShoulder</span>
        </Link>
        <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Get started
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: June 2026</p>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-10">
          <h2 className="text-lg font-semibold text-indigo-800 mb-2">Our commitment to you</h2>
          <p className="text-indigo-700 text-sm leading-relaxed">
            SafeShoulder is built on trust. You share things here that you may not share anywhere else.
            We take that seriously. This policy explains exactly what we collect, what we don't, and
            what we will never do with your information.
          </p>
        </div>

        <div className="flex flex-col gap-8 text-slate-700">

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Who we are</h2>
            <p className="text-sm leading-relaxed">
              SafeShoulder is an AI-powered emotional support platform operated by SafeShoulder
              (safeshoulder.com). We are not a licensed medical or therapy service.
              For questions about this policy, contact us at <a href="mailto:hello@safeshoulder.com"
              className="text-indigo-600 underline">hello@safeshoulder.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">2. What we collect</h2>
            <div className="flex flex-col gap-3 text-sm leading-relaxed">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="font-medium text-slate-800 mb-1">Account information</p>
                <p className="text-slate-600">Your email address (used only to send your sign-in link). You may use a nickname instead of your real name.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="font-medium text-slate-800 mb-1">Profile information</p>
                <p className="text-slate-600">Age range, gender (optional), the topics you choose to discuss, and answers from your intake survey. All optional fields can be skipped.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="font-medium text-slate-800 mb-1">Conversation data</p>
                <p className="text-slate-600">Messages you send and receive in chat sessions. These are stored to allow you to resume past conversations.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="font-medium text-slate-800 mb-1">Usage data</p>
                <p className="text-slate-600">Message counts and credit balances. No browsing behaviour, device fingerprinting, or advertising tracking.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">3. What we do NOT collect</h2>
            <ul className="text-sm leading-relaxed list-none flex flex-col gap-2">
              {[
                "We do not collect your real name unless you choose to provide it",
                "We do not use cookies for advertising or tracking",
                "We do not sell your data to any third party — ever",
                "We do not share your conversations with insurers, employers, or government agencies",
                "We do not use your chats to train AI models",
                "We do not collect payment card details (handled by Razorpay)",
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">4. How your data is used</h2>
            <p className="text-sm leading-relaxed text-slate-600 mb-3">
              Your data is used solely to provide and improve the SafeShoulder service:
            </p>
            <ul className="text-sm leading-relaxed list-none flex flex-col gap-2">
              {[
                "To authenticate you and maintain your session",
                "To personalise AI responses based on your profile and history",
                "To resume past conversations where you left off",
                "To process credit purchases via Razorpay",
                "To send you sign-in links via email",
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">→</span>
                  <span className="text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Can the team read my chats?</h2>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm leading-relaxed text-amber-900">
              <p className="font-medium mb-2">Honest answer:</p>
              <p>
                Your conversations are stored in an encrypted database (Supabase). Row-level security
                ensures that no other user can access your data. However, as operators of the service,
                we have administrative access to the database infrastructure.
              </p>
              <p className="mt-2">
                <strong>We commit to never reading your chats</strong> except in the following limited
                circumstances: when required by law, to investigate a credible safety threat, or to
                debug a technical issue — and only with the minimum access necessary.
              </p>
              <p className="mt-2">
                We do not proactively review conversations. No human reads your chats as part of normal
                operations.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Third-party services</h2>
            <div className="flex flex-col gap-2 text-sm">
              {[
                { name: "Anthropic (Claude AI)", purpose: "Processes your messages to generate responses. Messages are sent to Anthropic's API.", link: "https://www.anthropic.com/privacy" },
                { name: "Supabase", purpose: "Stores your account data and conversations in encrypted databases.", link: "https://supabase.com/privacy" },
                { name: "Razorpay", purpose: "Processes payments. We never see your card details.", link: "https://razorpay.com/privacy/" },
                { name: "Vercel", purpose: "Hosts the website frontend.", link: "https://vercel.com/legal/privacy-policy" },
                { name: "Resend", purpose: "Sends sign-in emails.", link: "https://resend.com/privacy" },
                { name: "Deepgram", purpose: "Processes audio for voice features (if used).", link: "https://deepgram.com/privacy" },
                { name: "OpenAI", purpose: "Powers text-to-speech for voice features (if used).", link: "https://openai.com/policies/privacy-policy" },
              ].map(s => (
                <div key={s.name} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-slate-800 text-sm">{s.name}</p>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">Privacy policy ↗</a>
                  </div>
                  <p className="text-xs text-slate-500">{s.purpose}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Data retention</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Your account and conversation data is retained as long as your account is active.
              Messages older than 90 days may be automatically summarised and condensed to save
              storage. You can request deletion of your account and all associated data at any time
              by emailing <a href="mailto:hello@safeshoulder.com" className="text-indigo-600 underline">hello@safeshoulder.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Your rights</h2>
            <p className="text-sm leading-relaxed text-slate-600 mb-3">You have the right to:</p>
            <ul className="text-sm leading-relaxed list-none flex flex-col gap-2">
              {[
                "Access a copy of all data we hold about you",
                "Correct inaccurate personal information",
                "Request deletion of your account and all data",
                "Export your conversation history",
                "Withdraw consent at any time by deleting your account",
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">→</span>
                  <span className="text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-600 mt-3">
              To exercise any of these rights, email <a href="mailto:hello@safeshoulder.com" className="text-indigo-600 underline">hello@safeshoulder.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Children</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              SafeShoulder is available to users of all ages, including those under 18. Users under 13
              should use SafeShoulder with parental awareness. We do not knowingly collect data from
              children under 13 without parental consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Changes to this policy</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              We may update this policy from time to time. Significant changes will be communicated
              via email. Continued use of SafeShoulder after changes constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">11. Contact</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              For any privacy-related questions or requests:<br />
              📧 <a href="mailto:hello@safeshoulder.com" className="text-indigo-600 underline">hello@safeshoulder.com</a><br />
              🌐 <a href="https://www.safeshoulder.com" className="text-indigo-600 underline">safeshoulder.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            SafeShoulder is not a licensed therapy or medical service. In a crisis, please contact a helpline immediately.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">Home</Link>
            <Link href="/login" className="text-xs text-slate-400 hover:text-slate-600">Sign in</Link>
            <a href="mailto:hello@safeshoulder.com" className="text-xs text-slate-400 hover:text-slate-600">Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
}
