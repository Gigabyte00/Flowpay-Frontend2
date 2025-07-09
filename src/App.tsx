import React, { useState, useEffect } from 'react';
import { DataProvider } from './components/DataProvider';
import AuthContext from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard/Dashboard';
import FlowPayLogo from './components/FlowPayLogo';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('flowpay_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-pulse">
          <FlowPayLogo size="large" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <DataProvider>
        {user ? <Dashboard /> : <LandingPage />}
      </DataProvider>
    </AuthContext.Provider>
  );
} 