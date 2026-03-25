/**
 * Language context.
 * Provides the current language and a toggle function to the whole app.
 * Persists the selected language in localStorage.
 */

import { createContext, useContext, useState, type ReactNode } from "react";
import { translations, type Language } from "../i18n/translations";

// Recursive type that avoids strict literal mismatches between EN and ES.
type DeepStringRecord = { [key: string]: string | DeepStringRecord };

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: DeepStringRecord;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem("gym-ai-language");
        return saved === "en" || saved === "es" ? saved : "en";
    });

    const setLanguage = (lang: Language) => {
        localStorage.setItem("gym-ai-language", lang);
        setLanguageState(lang);
    };

    return (
        <LanguageContext.Provider
            value={{ language, setLanguage, t: translations[language] as DeepStringRecord }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Hook to access translations and language controls.
 * Returns `t` typed as the English shape (canonical structure).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
    return ctx as Omit<LanguageContextValue, "t"> & { t: typeof translations["en"] };
}
