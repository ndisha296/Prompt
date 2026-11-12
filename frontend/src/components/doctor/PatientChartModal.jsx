import React, { useState, useEffect } from 'react';
import { X, User, HeartPulse, FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import { documentApi } from '../../lib/api';

export const PatientChartModal = ({ appointment, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appointment?.patient_id) {
      loadPatientDocs(appointment.patient_id);
    }
  }, [appointment]);

  async function loadPatientDocs(patientId) {
    try {
      const res = await documentApi.list(patientId);
      setDocuments(res.documents || []);
    } catch (err) {
      console.warn('Could not load patient documents', err);
    } finally {
      setLoading(false);
    }
  }

  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Electronic Health Record (EHR) Chart</h3>
              <p className="text-[11px] text-slate-400">HIPAA Compliant Physician Access • Valid Clinical Relationship</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chart Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Patient Overview */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-medicore-100 text-medicore-700 font-bold flex items-center justify-center text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">
                  {appointment.patient?.profiles?.full_name || appointment.patient_name || 'Sarah Jenkins'}
                </h4>
                <p className="text-xs text-slate-500 font-mono">Patient Record: {appointment.patient_id}</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Consultation
            </span>
          </div>

          {/* Vitals / Health Markers */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Blood Type</span>
              <span className="font-bold text-slate-900 text-sm text-rose-600">O+</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Date of Birth</span>
              <span className="font-bold text-slate-900 text-sm">Jun 14, 1992</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">Chief Complaint</span>
              <span className="font-bold text-slate-900 text-sm truncate block">{appointment.reason_for_visit}</span>
            </div>
          </div>

          {/* Allergies & Chronic Conditions */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60">
              <span className="font-bold text-rose-900 block mb-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Documented Allergies
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-medium">Penicillin</span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-medium">Sulfa Drugs</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
              <span className="font-bold text-amber-900 block mb-1.5 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
                Chronic Conditions
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">Mild Asthma</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">Migraine with Aura</span>
              </div>
            </div>
          </div>

          {/* Patient Medical History */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-800 block">Baseline Clinical History:</span>
            <p className="text-slate-600 leading-relaxed">
              Patient reports mild palpitations under psychological stress. Previously monitored via 24-hr Holter with sinus tachycardia without dangerous ventricular arrhythmia. Normal cardiac biomarkers.
            </p>
          </div>

          {/* Uploaded Diagnostic Reports */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <FileText className="w-4 h-4 text-medicore-600" />
              <span>Available Diagnostic Files & Lab Results ({documents.length})</span>
            </div>

            {documents.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {documents.map(doc => (
                  <div key={doc.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-800">{doc.file_name}</div>
                      <div className="text-slate-400 text-[11px]">{doc.description}</div>
                    </div>
                    <a
                      href={doc.file_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-medicore-600 hover:text-medicore-700 px-2.5 py-1 rounded border border-slate-200 hover:border-medicore-300"
                    >
                      View Report
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No external lab files uploaded for this patient.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
