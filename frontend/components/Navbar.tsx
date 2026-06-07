"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/Logo";
import { Menu, X, LogOut, User, DollarSign, Settings } from "lucide-react";

const DOMAIN_LABELS: Record<string, { label: string; icon: string }> = {
  school_bullying: { label: "School & Bullying", icon: "🏫" },
  heartbreak: { label: "Heartbreak", icon: "💔" },
  domestic: { label: "Family", icon: "🏠" },
  financial: { label: "Financial", icon: "💸" },
  workplace: { label: "Workplace", icon: "💼" },
};

export function Navbar({ currentDomain }: { currentDomain?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
        if (data.session.user.email) {
          setIsAdmin(["arinrjain@gmail.com", "rinishjain@yahoo.com"].includes(data.session.user.email));
        }
      }
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const domainInfo = currentDomain ? DOMAIN_LABELS[currentDomain] : null;

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 border-b border-indigo-700/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/chat" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Logo size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-semibold text-sm">SafeShoulder</p>
              {domainInfo && (
                <p className="text-white/70 text-xs">{domainInfo.icon} {domainInfo.label}</p>
              )}
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {user && (
              <>
                <Link
                  href="/chat"
                  className="text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  💬 Chat
                </Link>
                <Link
                  href="/profile"
                  className="text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  👤 Profile
                </Link>
                <Link
                  href="/billing"
                  className="text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  💳 Billing
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    ⚙️ Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu / Auth */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {userMenuOpen ? (
                    <X className="w-5 h-5 text-white" />
                  ) : (
                    <Menu className="w-5 h-5 text-white" />
                  )}
                </button>

                {/* Desktop User Menu */}
                <div className="hidden md:relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <span className="text-white text-sm font-medium hidden lg:inline">
                      {user.email?.split("@")[0]}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-800">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/billing"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <DollarSign className="w-4 h-4" />
                        Billing & Credits
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
                        >
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {userMenuOpen && (
        <div className="md:hidden bg-indigo-700/50 border-t border-indigo-700/20 px-4 py-3 flex flex-col gap-2">
          <Link
            href="/chat"
            onClick={() => setUserMenuOpen(false)}
            className="text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors block"
          >
            💬 Chat
          </Link>
          <Link
            href="/profile"
            onClick={() => setUserMenuOpen(false)}
            className="text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors block"
          >
            👤 Profile
          </Link>
          <Link
            href="/billing"
            onClick={() => setUserMenuOpen(false)}
            className="text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors block"
          >
            💳 Billing
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setUserMenuOpen(false)}
              className="text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors block"
            >
              ⚙️ Admin
            </Link>
          )}
          <button
            onClick={() => {
              setUserMenuOpen(false);
              handleLogout();
            }}
            className="text-red-200 hover:text-red-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left border-t border-indigo-700/20 mt-2 pt-2"
          >
            🚪 Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
