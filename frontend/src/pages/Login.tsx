/**
 * Login page.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, Loader2, ArrowRight, FlaskConical } from "lucide-react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Login() {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading, login, demoLogin, localDemoLogin, demoEnabled } = useAuth();
    const { language } = useLanguage();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate("/");
        }
    }, [authLoading, isAuthenticated, navigate]);

    if (authLoading || isAuthenticated) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (demoEnabled && email.trim() === "admin" && password === "admin") {
                await localDemoLogin();
                navigate("/");
                return;
            }

            const formData = new FormData();
            formData.append("username", email);
            formData.append("password", password);

            const response = await apiClient.post("/auth/login", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            await login(response.data);
            navigate("/");
        } catch (e) {
            const err = e as { response?: { data?: { detail?: string } } };
            setError(err.response?.data?.detail || "Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            await demoLogin();
            navigate("/");
        } catch (e) {
            const err = e as { response?: { data?: { detail?: string } } };
            setError(err.response?.data?.detail || "Demo login is not available.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="w-full max-w-md animate-slide-up relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-2xl">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                </div>

                <div className="card p-8 space-y-6 border-brand-500/20 shadow-brand-500/5">
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-bold text-text">
                            {language === "es" ? "Bienvenido de nuevo" : "Welcome back"}
                        </h1>
                        <p className="text-text-secondary text-sm">
                            {language === "es" ? "Ingresá para seguir entrenando" : "Sign in to keep training"}
                        </p>
                        {demoEnabled && (
                            <p className="text-xs text-brand-300">
                                {language === "es" ? "Acceso local de prueba: admin / admin" : "Local test access: admin / admin"}
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">
                                {language === "es" ? "Email" : "Email"}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                <input
                                    type="text"
                                    required
                                    className="input pl-10 h-12"
                                    placeholder={demoEnabled ? "admin" : "hola@ejemplo.com"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">
                                {language === "es" ? "Contraseña" : "Password"}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                <input
                                    type="password"
                                    required
                                    className="input pl-10 h-12"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full h-12 justify-center text-base font-bold shadow-lg shadow-brand-500/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                            {loading ? (language === "es" ? "Ingresando..." : "Signing in...") : (language === "es" ? "Entrar" : "Sign In")}
                        </button>

                        {demoEnabled && (
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleDemoLogin}
                                className="btn-secondary w-full h-12 justify-center text-base font-bold"
                            >
                                <FlaskConical className="w-5 h-5" />
                                {language === "es" ? "Entrar como demo" : "Continue as demo"}
                            </button>
                        )}
                    </form>

                    <div className="text-center text-sm text-text-secondary">
                        {language === "es" ? "¿No tenés cuenta?" : "Don't have an account?"}{" "}
                        <Link to="/register" className="text-brand-400 font-bold hover:text-brand-300 transition-colors">
                            {language === "es" ? "Registrate" : "Sign Up"}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
