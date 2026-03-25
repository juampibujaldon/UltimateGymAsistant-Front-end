/**
 * Authentication context.
 * Manages user session, token persistence, and login/register flows.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import apiClient from "../api/client";
import type { User, Token } from "../types";
import { demoAuthEnabled } from "../config/features";

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (tokenData: Token) => Promise<void>;
    demoLogin: () => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    demoEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const stored = localStorage.getItem("gym_ai_user");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("gym_ai_token"));
    const [loading, setLoading] = useState(true);

    const login = async (tokenData: Token) => {
        localStorage.setItem("gym_ai_token", tokenData.access_token);
        setToken(tokenData.access_token);

        // Fetch user profile immediately after login if needed, 
        // but for now we'll assume the login flow or a secondary call sets it.
        // In a real app, you might decode the JWT or call /auth/me
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    const demoLogin = async () => {
        const response = await apiClient.post("/auth/demo-login");
        await login(response.data);
    };

    const logout = () => {
        localStorage.removeItem("gym_ai_token");
        localStorage.removeItem("gym_ai_user");
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        login,
        demoLogin,
        logout,
        isAuthenticated: !!token,
        demoEnabled: demoAuthEnabled,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
