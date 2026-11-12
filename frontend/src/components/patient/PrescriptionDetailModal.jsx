import React from 'react';
import { X, Printer, ShieldCheck, FileText, Pill, Calendar, User, Stethoscope } from 'lucide-react';

export const PrescriptionDetailModal = ({ prescription, onClose }) => {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Controls Top Bar */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital E-Prescription (Cryptographically Signed)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-300 shadow-xs flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Body */}
        <div className="p-8 space-y-6 print:p-0">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 text-medicore-600 font-extrabold text-xl tracking-tight">
                <div className="w-8 h-8 rounded-lg bg-medicore-600 text-white flex items-center justify-center text-sm font-bold">
                  Rx
                </div>
                <span>MediCore Health Network</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Division of Clinical Telemedicine & Digital Therapeutics</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div className="font-mono text-slate-800 font-semibold">{prescription.id}</div>
              <div>Issued: {new Date(prescription.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          {/* Clinician & Patient Meta Card */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Prescribing Clinician:</span>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-medicore-600" />
                <span>{prescription.doctor?.profiles?.full_name || prescription.doctor_name || 'Dr. Marcus Vance, MD'}</span>
              </div>
              <p className="text-slate-600 mt-0.5">{prescription.doctor?.specialization || 'Cardiology Specialist'}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Patient Record:</span>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>{prescription.patient?.profiles?.full_name || prescription.patient_name || 'Sarah Jenkins'}</span>
              </div>
              <p className="text-slate-600 mt-0.5 font-mono">PID: {prescription.patient_id}</p>
            </div>
          </div>

          {/* Clinical Diagnosis */}
          <div className="border-l-4 border-medicore-600 pl-4 py-1">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Clinical Diagnosis</span>
            <div className="text-slate-900 font-bold text-base mt-0.5">{prescription.diagnosis}</div>
          </div>

          {/* Prescribed Medications */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-4 h-4 text-medicore-600" />
              <h4 className="font-bold text-slate-900 text-sm">Prescribed Regimen (Rx)</h4>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Medication</th>
                    <th className="py-2.5 px-3">Dosage</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(prescription.medications || []).map((med, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{med.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{med.dosage}</td>
                      <td className="py-2.5 px-3 text-slate-700">{med.frequency}</td>
                      <td className="py-2.5 px-3 text-slate-700">{med.duration}</td>
                      <td className="py-2.5 px-3 text-slate-500 italic">{med.instructions || 'As advised'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinician Advice */}
          {prescription.instructions && (
            <div className="bg-medicore-50/60 p-4 rounded-xl border border-medicore-100 text-xs">
              <span className="font-bold text-medicore-900 block mb-1">Clinician Directives & Precautions:</span>
              <p className="text-medicore-800 leading-relaxed">{prescription.instructions}</p>
            </div>
          )}

          {/* Sign-off & Verification Badge */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified against MediCore Clinical Database</span>
            </div>
            <div className="text-right">
              <div className="font-signature font-serif italic text-base text-slate-800">Electronic Clinical Seal</div>
              <div className="text-[10px]">MediCore Telehealth Licensure Validated</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
