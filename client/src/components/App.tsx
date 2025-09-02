import React from 'react';
import { AuthProvider } from './AuthProvider';
import { useAuth } from '../hooks/useAuth';
import { PinSetup } from './PinSetup';
import { PinLogin } from './PinLogin';
import { HomePage } from '../pages/HomePage';

const AppContent: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    needsSetup, 
    login, 
    createPin 
  } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <PinSetup 
        onSubmit={createPin}
        loading={isLoading}
        error={error}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <PinLogin 
        onSubmit={login}
        loading={isLoading}
        error={error}
      />
    );
  }

  return <HomePage />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};