import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { I18nProvider } from './i18n/I18nProvider';
import { BottomNav } from './components/BottomNav';

// Pages
import { Splash } from './pages/Splash';
import { Login } from './pages/Login';
import { OtpVerify } from './pages/OtpVerify';
import { ProfileSetup } from './pages/ProfileSetup';
import { Consent } from './pages/Consent';
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { Results } from './pages/Results';
import { Community } from './pages/Community';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const publicPaths = ['/', '/login', '/otp', '/profile-setup', '/consent'];
  const showNav = !publicPaths.includes(location.pathname);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<OtpVerify />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/consent" element={<Consent />} />

        {/* Protected routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
        <Route path="/results/:scanId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showNav && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};

export default App;
