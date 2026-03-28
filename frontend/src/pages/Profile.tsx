import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Activity, Target, Loader2, Sparkles, Scale, Ruler, Save, BrainCircuit, Dumbbell, History, Plus, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import type { Language } from "../i18n/translations";
import apiClient from "../api/client";

const FLAG: Record<Language, string> = { en: "🇺🇸", es: "🇦🇷" };
const NEXT: Record<Language, Language> = { en: "es", es: "en" };

export default function Profile() {
    const { user, token } = useAuth();
    const { language, setLanguage } = useLanguage();
    const navigate = useNavigate();
    
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [goal, setGoal] = useState("");
    
    const [saving, setSaving] = useState(false);
    const [insights, setInsights] = useState("");
    const [loadingInsights, setLoadingInsights] = useState(false);

    useEffect(() => {
        // Load initial user data from context
        if (user) {
            if (user.weight) setWeight(user.weight.toString());
            if (user.height) setHeight(user.height.toString());
            if (user.goal) setGoal(user.goal);
        }
    }, [user]);

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        try {
            await apiClient.patch("/auth/me", {
                    weight: weight ? parseFloat(weight) : null,
                    height: height ? parseFloat(height) : null,
                    goal: goal || null
            });
            alert("Perfil guardado correctamente.");
        } catch (e) {
            console.error(e);
            alert("Error al guardar el perfil.");
        } finally {
            setSaving(false);
        }
    };

    const fetchInsights = async () => {
        if (!token) return;
        setLoadingInsights(true);
        try {
            const { data } = await apiClient.get(`/auth/me/insights?lang=${language}`);
            setInsights(data.insights);
        } catch (e) {
            console.error(e);
            setInsights("No se pudo cargar el análisis de la IA en este momento.");
        } finally {
            setLoadingInsights(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto pb-32 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                    <User className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-text">Mi Perfil</h1>
                    <p className="text-text-secondary">{user?.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Entrenamientos (Log / History) */}
                <div className="card p-5 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Dumbbell className="w-5 h-5 text-brand-400" />
                        <h2 className="text-lg font-bold">Mis Entrenamientos</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={() => navigate("/log")} className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-hover/60 hover:bg-surface-border transition-colors border border-surface-border">
                            <div className="flex items-center gap-3">
                                <Plus className="w-5 h-5 text-brand-400" />
                                <span className="font-medium text-sm">Registrar Entrenamiento</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted" />
                        </button>
                        <button onClick={() => navigate("/history")} className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-hover/60 hover:bg-surface-border transition-colors border border-surface-border">
                            <div className="flex items-center gap-3">
                                <History className="w-5 h-5 text-accent-400" />
                                <span className="font-medium text-sm">Ver Historial</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted" />
                        </button>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-accent-400" />
                        <h2 className="text-lg font-bold">Datos Físicos</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
                                <Scale className="w-4 h-4" /> Peso Corporal (kg)
                            </label>
                            <input 
                                type="number" step="0.1"
                                className="input" 
                                value={weight} onChange={e => setWeight(e.target.value)} 
                                placeholder="Ej. 75.5" 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
                                <Ruler className="w-4 h-4" /> Altura (cm)
                            </label>
                            <input 
                                type="number" 
                                className="input" 
                                value={height} onChange={e => setHeight(e.target.value)} 
                                placeholder="Ej. 182" 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Objetivo Principal
                            </label>
                            <input 
                                type="text" 
                                className="input" 
                                value={goal} onChange={e => setGoal(e.target.value)} 
                                placeholder="Ej. Ganar masa muscular, Perder grasa..." 
                            />
                        </div>
                        
                        <button 
                            onClick={handleSave} disabled={saving}
                            className="btn-primary w-full justify-center mt-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Guardar Datos
                        </button>
                    </div>
                </div>

                {/* App Settings Card */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-accent-500" />
                        <h2 className="text-lg font-bold">Preferencias</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Idioma de la Aplicación
                            </label>
                            <button
                                onClick={() => setLanguage(NEXT[language as Language])}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-surface-border bg-surface-hover hover:bg-surface-border text-text transition-all duration-200 active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl leading-none">{FLAG[language as Language]}</span>
                                    <span className="font-medium text-sm">
                                        {language === "es" ? "Español (Argentina)" : "English (US)"}
                                    </span>
                                </div>
                                <span className="text-sm text-brand-500 font-medium">Cambiar a {NEXT[language as Language].toUpperCase()}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Insights Card */}
                <div className="card p-5 flex flex-col md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-brand-500" />
                        <h2 className="text-lg font-bold">Asesoramiento de IA</h2>
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-4">
                        La IA analizará tus datos físicos y el volumen de tus rutinas recientes para darte recomendaciones sobre nutrición y entrenamiento.
                    </p>
                    
                    {insights ? (
                        <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-xl bg-surface-hover/50 text-sm markdown-content">
                            <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>') }} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-8 opacity-50">
                            <BrainCircuit className="w-12 h-12 text-text-muted mb-2" />
                            <p className="text-xs text-center text-text-muted max-w-[200px]">Sin análisis generado</p>
                        </div>
                    )}
                    
                    <button 
                        onClick={fetchInsights} disabled={loadingInsights}
                        className="btn-secondary w-full justify-center mt-auto shadow-md border border-brand-500/20 hover:border-brand-500/50"
                    >
                        {loadingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-brand-500" />}
                        Analizar mi Perfil
                    </button>
                </div>

            </div>
        </div>
    );
}
