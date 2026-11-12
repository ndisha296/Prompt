import React from 'react';
import { Activity, ShieldCheck, Lock, FileText, HeartHandshake } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-medicore-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">MediCore Connect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-stack clinical web platform providing verified teleconsultations, digital e-prescriptions, and zero-trust electronic health records.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3.5 h-3.5" />
                HIPAA Aligned
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded">
                <Lock className="w-3.5 h-3.5" />
                RLS Guarded
              </span>
            </div>
          </div>

          {/* Clinical Workflows */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs tracking-wider uppercase">Clinical Workflows</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#appointments" className="hover:text-white transition">Virtual & In-Person Encounters</a></li>
              <li><a href="#prescriptions" className="hover:text-white transition">Digital Tamper-Proof Prescriptions</a></li>
              <li><a href="#vault" className="hover:text-white transition">Encrypted Medical Storage Vault</a></li>
              <li><a href="#doctors" className="hover:text-white transition">Verified Clinician Network</a></li>
            </ul>
          </div>

          {/* Security & Compliance */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs tracking-wider uppercase">Compliance & Tech</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL Row Level Security</li>
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-400" /> Role-Based Access Control (RBAC)</li>
              <li className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-emerald-400" /> Immutable HIPAA Audit Logging</li>
              <li className="flex items-center gap-1.5"><HeartHandshake className="w-3.5 h-3.5 text-emerald-400" /> Doctor Clinical Consent Gate</li>
            </ul>
          </div>

          {/* Architecture Spec */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs tracking-wider uppercase">Stack Architecture</h4>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Frontend:</span> <span className="text-slate-200">React + Vite + Tailwind</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Backend:</span> <span className="text-slate-200">Node.js + Express (Zod)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Database:</span> <span className="text-slate-200">Supabase Postgres 15+</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Security:</span> <span className="text-slate-200">Helmet + Rate-Limit</span></div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MediCore Connect Technologies. All clinical data protected under HIPAA Privacy & Security Rules.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Healthcare Service</span>
            <span className="hover:text-slate-400 cursor-pointer">HIPAA Notice</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
