import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PropertiesPage from './pages/PropertiesPage';
import BusinessesPage from './pages/BusinessesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import InvestmentProcessPage from './pages/InvestmentProcessPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import AdminPropertiesPage from './pages/admin/PropertiesPage';
import AdminBusinessesPage from './pages/admin/BusinessesPage';
import AdminInvestmentsPage from './pages/admin/InvestmentsPage';
import AdminDocumentsPage from './pages/admin/DocumentsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import ReportsPage from './pages/admin/ReportsPage';
import { useAuthStore } from './lib/store';
import AuthCallback from './pages/AuthCallback';
import { supabase } from './lib/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  const { user, isAdmin, initialize, initialized } = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    initialize();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      await initialize();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize]);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!initialized) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" />;
    }

    return <>{children}</>;
  };

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!initialized) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!user || !isAdmin) {
      return <Navigate to="/" />;
    }

    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Routes>
              {/* Admin routes */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/properties" element={<AdminPropertiesPage />} />
                        <Route path="/businesses" element={<AdminBusinessesPage />} />
                        <Route path="/investments" element={<AdminInvestmentsPage />} />
                        <Route path="/documents" element={<AdminDocumentsPage />} />
                        <Route path="/audit-logs" element={<AuditLogsPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>
                }
              />

              {/* Public routes */}
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/properties" element={<PropertiesPage />} />
                        <Route path="/properties/:id" element={<PropertyDetailPage />} />
                        <Route path="/businesses" element={<BusinessesPage />} />
                        <Route path="/businesses/:id" element={<BusinessDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/investment-process" element={<InvestmentProcessPage />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <DashboardPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                }
              />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;