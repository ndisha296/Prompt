import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';

export function App() {
  const { user, role, switchDemoRole } = useAuth();
  const [activeView, setActiveView] = useState('landing'); // 'landing' | 'portal'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectRolePortal = (selectedRole) => {
    switchDemoRole(selectedRole);
    setActiveView('portal');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'landing' ? (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onSelectRolePortal={handleSelectRolePortal}
          />
        ) : (
          <div>
            {role === 'doctor' ? (
              <DoctorDashboard />
            ) : role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <PatientDashboard />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={() => setActiveView('portal')}
      />
    </div>
  );
}

export default App;
