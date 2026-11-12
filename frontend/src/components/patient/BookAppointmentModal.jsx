import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { doctorApi, appointmentApi } from '../../lib/api';

export const BookAppointmentModal = ({ isOpen, onClose, onAppointmentCreated }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [consultationType, setConsultationType] = useState('virtual');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDoctors();
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setAppointmentDate(tomorrow.toISOString().split('T')[0]);
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  async function loadDoctors() {
    try {
      const res = await doctorApi.list({ is_verified: 'true' });
      setDoctors(res.doctors || []);
      if (res.doctors?.length > 0) {
        setSelectedDoctorId(res.doctors[0].id);
      }
    } catch (err) {
      console.error('Failed to load doctors', err);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedDoctorId) throw new Error('Please select a doctor');
      if (!appointmentDate) throw new Error('Please select an appointment date');
      if (!reasonForVisit.trim()) throw new Error('Please enter the reason for your visit');

      const fullDateTime = new Date(`${appointmentDate}T${appointmentTime}:00.000Z`).toISOString();

      await appointmentApi.create({
        doctor_id: selectedDoctorId,
        appointment_date: fullDateTime,
        consultation_type: consultationType,
        duration_minutes: 30,
        reason_for_visit: reasonForVisit,
        notes: notes || null
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onAppointmentCreated) onAppointmentCreated();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Time slot may be conflicted.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-medicore-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-medicore-100" />
            <h3 className="font-bold text-lg">Book Clinical Consultation</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Appointment successfully requested! Doctor notified.</span>
            </div>
          )}

          {/* Step 1: Select Clinician */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Clinician
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500 font-medium"
            >
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.full_name} • {doc.specialization} (${doc.consultation_fee})
                </option>
              ))}
            </select>
          </div>

          {selectedDoctor && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Specialization:</span>
                <span className="font-semibold text-slate-800">{selectedDoctor.specialization}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Clinic Facility:</span>
                <span className="text-slate-800 truncate max-w-[240px]">{selectedDoctor.clinic_address || 'MediCore Telehealth Center'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Consultation Fee:</span>
                <span className="font-bold text-emerald-700">${selectedDoctor.consultation_fee}</span>
              </div>
            </div>
          )}

          {/* Step 2: Consultation Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Consultation Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConsultationType('virtual')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  consultationType === 'virtual'
                    ? 'border-medicore-600 bg-medicore-50 text-medicore-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Virtual Video Call</span>
              </button>
              <button
                type="button"
                onClick={() => setConsultationType('in-person')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  consultationType === 'in-person'
                    ? 'border-medicore-600 bg-medicore-50 text-medicore-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>In-Person Clinic Visit</span>
              </button>
            </div>
          </div>

          {/* Step 3: Date & Time Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time Slot (30 Min)
              </label>
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500"
              >
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM</option>
              </select>
            </div>
          </div>

          {/* Step 4: Reason for Visit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Visit / Chief Complaint
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Routine cardiac follow-up, persistent migraine"
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500"
            />
          </div>

          {/* Step 5: Clinical Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Notes for Clinician (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Any current symptoms, recent medication changes, or questions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 px-4 bg-medicore-600 hover:bg-medicore-700 text-white font-semibold rounded-xl shadow-md shadow-medicore-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span>Confirm & Request Appointment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
