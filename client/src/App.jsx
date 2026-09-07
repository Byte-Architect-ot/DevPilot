import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/DashboardLayout';

const AppContent = () => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center gap-4 text-zinc-600 text-sm">
        <div className="w-7 h-7 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        <span>Authenticating session with backend...</span>
      </div>
    );
  }

  return authenticated ? <DashboardLayout /> : <LoginPage />;
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
