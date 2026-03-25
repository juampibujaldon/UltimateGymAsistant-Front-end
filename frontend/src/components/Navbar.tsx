/**
 * Navbar – desktop sidebar + mobile bottom tab bar.
 */

import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Dumbbell, History, BrainCircuit, TrendingUp, Zap, LogOut, User
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import type { Language } from "../i18n/translations";

const FLAG: Record<Language, string> = { en: "🇺🇸", es: "🇦🇷" };
const NEXT: Record<Language, Language> = { en: "es", es: "en" };

export default function Navbar() {
    const navigate = useNavigate();
    const { t, language, setLanguage } = useLanguage();
    const { logout } = useAuth();

    const navItems = [
        { to: "/", icon: LayoutDashboard, label: t.nav.dashboard },
        { to: "/log", icon: Dumbbell, label: t.nav.logWorkout },
        { to: "/history", icon: History, label: t.nav.history },
        { to: "/analysis", icon: BrainCircuit, label: t.nav.aiAnalysis },
        { to: "/progress", icon: TrendingUp, label: t.nav.progress },
        { to: "/profile", icon: User, label: "Perfil" },
    ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <>
            {/* ── Desktop sidebar ─────────────────────────────────────── */}
            <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-surface border-r border-surface-border flex-col z-40 transition-colors duration-300">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-border">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg transform transition hover:scale-105 duration-300">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-text leading-tight">{t.nav.appName}</h1>
                        <p className="text-xs text-text-muted leading-tight">{t.nav.appSub}</p>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 py-4 px-3 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/"}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-brand-600/20 text-brand-600 dark:text-brand-400 border border-brand-600/30 shadow-sm"
                                    : "text-text-secondary hover:text-text hover:bg-surface-hover"
                                }`
                            }
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom actions */}
                <div className="px-3 py-4 border-t border-surface-border space-y-2">
                    {/* Language toggle */}
                    <button
                        onClick={() => setLanguage(NEXT[language])}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-surface-hover hover:bg-surface-border text-text transition-all duration-200 active:scale-95"
                    >
                        <span className="text-lg leading-none">{FLAG[NEXT[language]]}</span>
                        <span>{NEXT[language].toUpperCase()}</span>
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                                   text-red-500 hover:bg-red-500/10 transition-all duration-200 active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                        {language === "es" ? "Cerrar Sesión" : "Logout"}
                    </button>

                    <p className="text-xs text-text-muted text-center pt-2">Gym AI Coach v1.2</p>
                </div>
            </aside>

            {/* ── Mobile bottom tab bar ────────────────────────────────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-surface-border flex items-center safe-area-inset-bottom pb-2">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/"}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors ${isActive ? "text-brand-600 dark:text-brand-400" : "text-text-secondary"
                            }`
                        }
                    >
                        <Icon className="w-5 h-5" />
                        <span className="leading-none">{label}</span>
                    </NavLink>
                ))}
            </nav>
        </>
    );
}
