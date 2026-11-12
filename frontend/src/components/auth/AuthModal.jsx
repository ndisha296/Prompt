import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Stethoscope, 
  ShieldCheck, 
  AlertCircle,
  KeyRound,
  ArrowRight
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) => {
  const { login, register, switchDemoRole } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [licenseNumber, setLicenseNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password, role);
      } else {
        await register({
          email,
          password,
          fullName,
          role,
          phone,
          ...(role === 'doctor' && {
            specialization,
            license_number: licenseNumber || `MED-${Math.floor(10000 + Math.random() * 90000)}`
          })
        });
      }

      onClose();
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (selectedRole) => {
    switchDemoRole(selectedRole);
    onClose();
    if (onAuthSuccess) onAuthSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-medicore-700 to-medicore-600 px-6 py-5 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-medicore-200" />
            <span className="text-xs font-semibold tracking-wider uppercase text-medicore-200">
              HIPAA Verified Authentication
            </span>
          </div>
          <h3 className="text-xl font-bold">
            {mode === 'login' ? 'Sign In to MediCore' : 'Create Clinical Account'}
          </h3>
          <p className="text-xs text-medicore-100 mt-0.5">
            {mode === 'login' 
              ? 'Access your medical dashboard, appointments, and records' 
              : 'Register as patient, medical specialist, or security admin'}
          </p>
        </div>

        {/* Quick Demo Fast-Track Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center justify-between">
            <span>Instant Demo Access</span>
            <span className="text-medicore-600 font-normal">1-Click Evaluation</span>
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleDemoSelect('patient')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-medicore-500 hover:bg-medicore-50 text-slate-700 hover:text-medicore-700 transition text-center shadow-xs"
            >
              👤 Patient
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('doctor')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-medicore-500 hover:bg-medicore-50 text-slate-700 hover:text-medicore-700 transition text-center shadow-xs"
            >
              🩺 Doctor
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('admin')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-medicore-500 hover:bg-medicore-50 text-slate-700 hover:text-medicore-700 transition text-center shadow-xs"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selector (when registering or selecting login persona) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select User Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'patient', label: 'Patient', icon: User },
                { key: 'doctor', label: 'Doctor', icon: Stethoscope },
                { key: 'admin', label: 'Admin', icon: Lock }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                    role === key
                      ? 'border-medicore-600 bg-medicore-50 text-medicore-700 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder={role === 'doctor' ? 'Dr. Sarah Connor, MD' : 'Sarah Jenkins'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500 focus:ring-1 focus:ring-medicore-500"
                />
              </div>
            </div>
          )}

          {mode === 'register' && role === 'doctor' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medical License #</label>
                <input
                  type="text"
                  placeholder="MED-NY-89412"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@healthcare.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500 focus:ring-1 focus:ring-medicore-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500 focus:ring-1 focus:ring-medicore-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-medicore-600 hover:bg-medicore-700 text-white font-semibold rounded-xl shadow-md shadow-medicore-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Authenticate Session' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Toggle Login / Register */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-xs text-slate-500 hover:text-medicore-600 transition"
            >
              {mode === 'login' 
                ? "Don't have an account yet? Register here" 
                : 'Already have an authorized profile? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
