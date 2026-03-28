import { NavLink, useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  LayoutDashboard,
  LogOut,
  Plus,
  Salad,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import type { Language } from "../i18n/translations";
import { nutritionEnabled } from "../config/features";

const FLAG: Record<Language, string> = { en: "US", es: "ES" };
const NEXT: Record<Language, Language> = { en: "es", es: "en" };

export default function Navbar() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { logout } = useAuth();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: t.nav.dashboard },
    { to: "/analysis", icon: BrainCircuit, label: t.nav.aiAnalysis },
    { to: "/progress", icon: TrendingUp, label: t.nav.progress },
    ...(nutritionEnabled
      ? [{ to: "/nutrition", icon: Salad, label: language === "es" ? "Nutricion" : "Nutrition" }]
      : []),
    { to: "/profile", icon: User, label: language === "es" ? "Perfil" : "Profile" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-72 p-4 md:flex">
        <div className="glass-panel flex h-full w-full flex-col rounded-[2rem] p-4">
          <div className="flex items-center gap-3 border-b border-surface-border px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold leading-tight text-text">{t.nav.appName}</h1>
              <p className="text-xs leading-tight text-text-muted">{t.nav.appSub}</p>
            </div>
          </div>

          <div className="px-3 pt-4">
            <button type="button" onClick={() => navigate("/log")} className="btn-primary w-full justify-center">
              <Plus className="h-4 w-4" />
              {language === "es" ? "Nueva sesion" : "New session"}
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border border-brand-500/30 bg-brand-500/12 text-brand-300 shadow-sm"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text"
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-2 border-t border-surface-border px-3 py-4">
            <button
              onClick={() => setLanguage(NEXT[language])}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-surface-hover px-4 py-3 text-sm font-medium text-text transition-all duration-200"
              type="button"
            >
              <span className="rounded-full border border-surface-border px-2 py-0.5 text-[11px] tracking-[0.18em]">
                {FLAG[NEXT[language]]}
              </span>
              <span>{NEXT[language].toUpperCase()}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              {language === "es" ? "Cerrar sesion" : "Logout"}
            </button>

            <p className="pt-2 text-center text-xs text-text-muted">Gym AI Coach v1.2</p>
          </div>
        </div>
      </aside>

      <nav className="mobile-nav md:hidden">
        {navItems.map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `dock-icon ${isActive ? "active" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <div className="dock-dot" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
