import React, { useState } from 'react';
import { X, Plus, Trash2, Pill, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { prescriptionApi } from '../../lib/api';

export const WritePrescriptionModal = ({ appointment, onClose, onPrescriptionIssued }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: 'Twice daily', duration: '7 days', instructions: 'Take after meals' }
  ]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!appointment) return null;

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: 'Once daily', duration: '14 days', instructions: '' }
    ]);
  };

  const handleRemoveMedication = (index) => {
    if (medications.length === 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!diagnosis.trim()) throw new Error('Clinical diagnosis is required');
      
      const validMeds = medications.filter(m => m.name.trim() && m.dosage.trim());
      if (validMeds.length === 0) throw new Error('Please specify at least one valid medication name and dosage');

      await prescriptionApi.create({
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        diagnosis,
        medications: validMeds,
        instructions: instructions || 'Take medications strictly as directed. Follow up if symptoms persist.'
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onPrescriptionIssued) onPrescriptionIssued();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to issue digital prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-medicore-700 to-medicore-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-medicore-200" />
            <div>
              <h3 className="font-bold text-lg">Author Digital E-Prescription</h3>
              <p className="text-xs text-medicore-100">
                Patient: {appointment.patient?.profiles?.full_name || appointment.patient_name || 'Sarah Jenkins'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Prescription cryptographically signed & recorded to database!</span>
            </div>
          )}

          {/* Diagnosis */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Clinical Diagnosis
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Acute Sinusitis, Essential Hypertension Stage 1"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500 font-medium"
            />
          </div>

          {/* Medications Form Repeater */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Medications & Posology
              </label>
              <button
                type="button"
                onClick={handleAddMedication}
                className="text-xs font-semibold text-medicore-600 hover:text-medicore-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medication</span>
              </button>
            </div>

            {medications.map((med, index) => (
              <div key={index} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Item #{index + 1}</span>
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Medication name (e.g. Amoxicillin)"
                    value={med.name}
                    onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Dosage (e.g. 500mg)"
                    value={med.dosage}
                    onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Frequency (e.g. 2x daily)"
                    value={med.frequency}
                    onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. 10 days)"
                    value={med.duration}
                    onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Instructions (e.g. with meals)"
                    value={med.instructions}
                    onChange={(e) => handleMedChange(index, 'instructions', e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Clinical Advice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physician Instructions & Dietary Directives
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Hydrate with at least 2L water daily. Avoid NSAIDs while taking prescribed regimen."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 px-4 bg-medicore-600 hover:bg-medicore-700 text-white font-semibold rounded-xl shadow-md shadow-medicore-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span>Digitally Sign & Issue Prescription</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
