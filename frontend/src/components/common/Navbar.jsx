import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Activity, 
  User, 
  Stethoscope, 
  Lock, 
  LogOut, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ onOpenAuth, activeView, setActiveView }) => {
  const { user, role, logout, switchDemoRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Clinical Compliance Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-white">MediCore Zero-Trust Architecture:</span>
            <span>HIPAA Security Rule Aligned • AES-256 Storage • Postgres RLS</span>
          </div>

          {/* Quick Role Tester Selector */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Demo Roles:
            </span>
            <button
              onClick={() => { switchDemoRole('patient'); setActiveView('portal'); }}
              className={`px-2 py-0.5 rounded transition ${
                role === 'patient' ? 'bg-medicore-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => { switchDemoRole('doctor'); setActiveView('portal'); }}
              className={`px-2 py-0.5 rounded transition ${
                role === 'doctor' ? 'bg-medicore-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => { switchDemoRole('admin'); setActiveView('portal'); }}
              className={`px-2 py-0.5 rounded transition ${
                role === 'admin' ? 'bg-medicore-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveView('landing')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medicore-700 to-medicore-500 flex items-center justify-center text-white shadow-md shadow-medicore-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                MediCore<span className="text-medicore-600 font-extrabold">Connect</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-medicore-50 text-medicore-700 px-1.5 py-0.5 rounded border border-medicore-200">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 -mt-0.5 font-medium">Enterprise Healthcare Hub</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button 
            onClick={() => setActiveView('landing')} 
            className={`transition hover:text-medicore-600 ${activeView === 'landing' ? 'text-medicore-600 font-semibold' : ''}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveView('portal')} 
            className={`flex items-center gap-1 transition hover:text-medicore-600 ${activeView === 'portal' ? 'text-medicore-600 font-semibold' : ''}`}
          >
            Clinical Workspace
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Live
            </span>
          </button>
          <a href="#security" onClick={() => setActiveView('landing')} className="transition hover:text-medicore-600">
            Security & RLS
          </a>
        </nav>

        {/* User Context & Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setActiveView('portal')}
                className="cursor-pointer flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-2 pr-4 hover:border-medicore-300 transition"
              >
                <div className="w-7 h-7 rounded-full bg-medicore-100 text-medicore-700 flex items-center justify-center font-bold text-xs">
                  {role === 'doctor' ? <Stethoscope className="w-3.5 h-3.5" /> : 
                   role === 'admin' ? <Lock className="w-3.5 h-3.5" /> : 
                   <User className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                    {user.full_name || user.email}
                  </div>
                  <div className="capitalize text-[10px] text-medicore-600 font-medium">
                    {role} View
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-sm font-medium text-slate-700 hover:text-medicore-600 px-3 py-2 rounded-lg transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-sm font-semibold text-white bg-medicore-600 hover:bg-medicore-700 px-4 py-2 rounded-lg shadow-sm shadow-medicore-600/30 transition flex items-center gap-1.5"
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
