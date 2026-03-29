import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import NewWorkout from "./pages/NewWorkout";
import WorkoutLogger from "./pages/WorkoutLogger";
import History from "./pages/History";
import AIAnalysis from "./pages/AIAnalysis";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NutritionDashboard from "./features/nutrition/pages/NutritionDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { nutritionEnabled } from "./config/features";
import InstallPrompt from "./components/InstallPrompt";

function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AuthenticatedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const pageTitles: Record<string, string> = {
    "/": t.nav.dashboard,
    "/log": t.nav.logWorkout,
    "/history": t.nav.history,
    "/analysis": t.nav.aiAnalysis,
    "/progress": t.nav.progress,
    "/profile": language === "es" ? "Perfil" : "Profile",
    "/nutrition": language === "es" ? "Nutricion" : "Nutrition",
  };

  const pageTitle = location.pathname.startsWith("/log/")
    ? t.nav.logWorkout
    : pageTitles[location.pathname] ?? t.nav.appName;

  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <InstallPrompt />
      <main className="min-h-screen md:ml-72">
        <div className="sticky top-0 z-30 px-4 pt-4 md:hidden">
          <div className="glass-panel flex items-center justify-between rounded-2xl px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted">
                {t.nav.appName}
              </p>
              <h1 className="text-base font-semibold text-text">{pageTitle}</h1>
            </div>
            <button className="btn-primary px-3 py-2" onClick={() => navigate("/log")} type="button">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:px-8 md:pb-10 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<PrivateRoute />}>
              <Route element={<AuthenticatedLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/log" element={<NewWorkout />} />
                <Route path="/log/:workoutId" element={<WorkoutLogger />} />
                <Route path="/history" element={<History />} />
                <Route path="/analysis" element={<AIAnalysis />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/profile" element={<Profile />} />
                {nutritionEnabled && <Route path="/nutrition" element={<NutritionDashboard />} />}
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
