import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Stethoscope, 
  Clock, 
  Users, 
  HeartPulse, 
  Sparkles,
  Search,
  Check,
  Award
} from 'lucide-react';
import { doctorApi } from '../../lib/api';

export const LandingPage = ({ onOpenAuth, onSelectRolePortal }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  useEffect(() => {
    async function loadFeaturedDoctors() {
      try {
        const res = await doctorApi.list({ is_verified: 'true' });
        setDoctors(res.doctors || []);
      } catch (err) {
        console.warn('Could not fetch doctors from API, showing static fallback', err);
      }
    }
    loadFeaturedDoctors();
  }, []);

  const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics & Adolescent Care', 'General Medicine'];

  const filteredDoctors = selectedSpecialty === 'All' 
    ? doctors 
    : doctors.filter(d => d.specialization.toLowerCase().includes(selectedSpecialty.toLowerCase()));

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.medicore.100),theme(colors.white))] opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Top Security Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medicore-50 border border-medicore-200 text-medicore-700 text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-medicore-600" />
              <span>HIPAA-Compliant Encrypted Clinical Architecture</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Secure Healthcare Connected by <span className="text-transparent bg-clip-text bg-gradient-to-r from-medicore-600 to-sky-500">Zero-Trust Precision</span>
            </h1>

            {/* Subhead */}
            <p className="text-lg text-slate-600 leading-relaxed font-normal">
              MediCore Connect bridges patients, board-certified clinicians, and healthcare administrators. Book encrypted virtual or in-person consultations, issue tamper-proof digital prescriptions, and safeguard medical records with PostgreSQL Row-Level Security.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => onSelectRolePortal('patient')}
                className="w-full sm:w-auto px-6 py-3.5 bg-medicore-600 hover:bg-medicore-700 text-white font-semibold rounded-xl shadow-lg shadow-medicore-600/30 transition flex items-center justify-center gap-2 group"
              >
                <span>Book Patient Consultation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onSelectRolePortal('doctor')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-200 shadow-sm transition flex items-center justify-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-medicore-600" />
                <span>Doctor Workspace</span>
              </button>
              <button
                onClick={() => onSelectRolePortal('admin')}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Admin Audit Log</span>
              </button>
            </div>

            {/* Security Proof Stats */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl font-bold text-slate-900">100%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Verified Medical Credentials</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl font-bold text-medicore-600">AES-256</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Encrypted Supabase Storage</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl font-bold text-slate-900">Postgres RLS</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Strict HIPAA Row Security</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl font-bold text-emerald-600">0 ms Conflict</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Double-Booking Guard</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Verified Doctors Showcase */}
      <section id="doctors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-medicore-700 bg-medicore-50 px-2.5 py-1 rounded-full mb-2">
              <Award className="w-3.5 h-3.5" />
              Verified Board-Certified Specialists
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Browse Clinicians Ready for Consultation
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Every doctor is thoroughly vetted with state medical board licenses before consultation privileges are granted.
            </p>
          </div>

          {/* Specialty Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {specialties.map(spec => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedSpecialty === spec
                    ? 'bg-medicore-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map(doctor => (
              <div 
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-medicore-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-medicore-100 text-medicore-700 font-bold flex items-center justify-center text-lg shadow-inner">
                        {doctor.full_name?.split(' ')?.[1]?.[0] || 'D'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{doctor.full_name}</h3>
                        <p className="text-xs text-medicore-600 font-medium">{doctor.specialization}</p>
                      </div>
                    </div>
                    {doctor.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {doctor.bio || 'Clinician dedicated to empathetic, evidence-based patient healthcare outcomes.'}
                  </p>

                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">License Number:</span>
                      <span className="font-mono font-medium text-slate-800">{doctor.license_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Experience:</span>
                      <span className="font-medium text-slate-800">{doctor.years_of_experience} Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consultation Fee:</span>
                      <span className="font-semibold text-slate-900">${doctor.consultation_fee}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-auto">
                  <button
                    onClick={() => onSelectRolePortal('patient')}
                    className="w-full py-2 px-3 bg-medicore-50 hover:bg-medicore-600 text-medicore-700 hover:text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No clinicians found in this specialty</p>
              <p className="text-xs text-slate-400 mt-1">Try selecting another specialty tab or reset filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Security & HIPAA Compliance Deep Dive */}
      <section id="security" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-medicore-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-full mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              HIPAA Privacy & Security Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Clinical Data Security at Every Layer
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              MediCore Connect enforces strict medical data privacy laws by baking access boundaries directly into PostgreSQL database policies rather than relying solely on application code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Row Level Security (RLS)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                PostgreSQL RLS ensures patients can only read their own records, and doctors can view patient charts only if an active or historical clinical appointment exists.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Signed Storage Tokens</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lab reports, telemetry records, and medical imaging are stored in isolated Supabase Storage buckets, accessed only via short-lived cryptographic signed URLs.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Immutable Audit Trail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every sensitive health data access, prescription creation, and administrative verification is stamped into an append-only HIPAA audit log with actor ID, IP, and timestamp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How MediCore Connect Works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Seamless end-to-end clinical care journey from booking to digital prescription
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-medicore-50 text-medicore-600 font-bold flex items-center justify-center mx-auto mb-3">1</div>
            <h4 className="font-bold text-slate-900 text-sm">Doctor Search</h4>
            <p className="text-xs text-slate-500 mt-1">Filter by specialty, license verification, and real-time open slots.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-medicore-50 text-medicore-600 font-bold flex items-center justify-center mx-auto mb-3">2</div>
            <h4 className="font-bold text-slate-900 text-sm">Conflict-Free Booking</h4>
            <p className="text-xs text-slate-500 mt-1">Select virtual or clinic encounter with instant slot verification.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-medicore-50 text-medicore-600 font-bold flex items-center justify-center mx-auto mb-3">3</div>
            <h4 className="font-bold text-slate-900 text-sm">Consultation</h4>
            <p className="text-xs text-slate-500 mt-1">Doctor inspects patient history, past diagnoses, and lab documents.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-medicore-50 text-medicore-600 font-bold flex items-center justify-center mx-auto mb-3">4</div>
            <h4 className="font-bold text-slate-900 text-sm">Digital E-Prescription</h4>
            <p className="text-xs text-slate-500 mt-1">Instant digital prescription issued and stored securely for download.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-medicore-700 via-medicore-600 to-sky-600 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-medicore-600/20">
          <h2 className="text-3xl font-extrabold mb-3">
            Ready to Experience Production-Grade Clinical Software?
          </h2>
          <p className="text-medicore-100 text-sm max-w-xl mx-auto mb-6">
            Test as a Patient, review clinical queues as a Doctor, or inspect HIPAA audit logs as an Administrator with one click.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onSelectRolePortal('patient')}
              className="px-6 py-3 bg-white text-medicore-700 font-bold rounded-xl hover:bg-medicore-50 transition shadow-md"
            >
              Launch Patient Portal
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3 bg-medicore-800 text-white font-semibold rounded-xl hover:bg-medicore-900 transition"
            >
              Register New Profile
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
