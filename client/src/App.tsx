import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TrafficProvider } from './context/TrafficContext';
import { SimulationProvider } from './context/SimulationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { PageTransition } from './components/common/PageTransition';

// Pages
import { Dashboard } from './pages/Dashboard';
import { TrafficMapPage } from './pages/TrafficMapPage';
import { SimulationPage } from './pages/SimulationPage';
import { SimulationHistoryPage } from './pages/SimulationHistoryPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { TrafficDistributionPage } from './pages/TrafficDistributionPage';
import { JunctionManagementPage } from './pages/JunctionManagementPage';
import { RouteOptimizationPage } from './pages/RouteOptimizationPage';
import { PeakHourAnalysisPage } from './pages/PeakHourAnalysisPage';
import { AIRecommendationsPage } from './pages/AIRecommendationsPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoadingAuth } = useAuth();
  const hasAuth = !!localStorage.getItem('smartflow_token') || (!!user && !!token);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono tracking-wide">
            Verifying authority credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!hasAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main Layout Shell with Sidebar & Navbar
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-blue-500 selection:text-white">
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 h-[calc(100vh-61px)]">
          <div className="max-w-7xl mx-auto">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <TrafficProvider>
        <SimulationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public & Authentication Routes */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

              {/* Protected Application Command Center Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TrafficMapPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/simulation"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SimulationPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/simulation-history"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SimulationHistoryPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comparison"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ComparisonPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/distribution"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TrafficDistributionPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/junctions"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <JunctionManagementPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/route-optimization"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <RouteOptimizationPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/peak-hour"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PeakHourAnalysisPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AIRecommendationsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AlertsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ReportsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SettingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SimulationProvider>
      </TrafficProvider>
    </AuthProvider>
  );
};

export default App;

