import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";

/**
 * Protected wrapper for authenticated routes.
 */
function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // Or a splash screen
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/**
 * Main App layout (with Navbar)
 */
function AuthenticatedLayout() {
  return (
    <div className="flex min-h-screen bg-bg transition-colors duration-300">
      <Navbar />
      <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private protected routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<AuthenticatedLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/log" element={<NewWorkout />} />
                <Route path="/log/:workoutId" element={<WorkoutLogger />} />
                <Route path="/history" element={<History />} />
                <Route path="/analysis" element={<AIAnalysis />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}
