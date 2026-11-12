import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Pill, 
  User, 
  Video, 
  MapPin, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi, prescriptionApi } from '../../lib/api';
import { PatientChartModal } from './PatientChartModal';
import { WritePrescriptionModal } from './WritePrescriptionModal';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [chartAppointment, setChartAppointment] = useState(null);
  const [rxAppointment, setRxAppointment] = useState(null);

  useEffect(() => {
    loadDoctorData();
  }, [user]);

  async function loadDoctorData() {
    setLoading(true);
    try {
      const [aptRes, rxRes] = await Promise.all([
        appointmentApi.list().catch(() => ({ appointments: [] })),
        prescriptionApi.list().catch(() => ({ prescriptions: [] }))
      ]);

      setAppointments(aptRes.appointments || []);
      setPrescriptions(rxRes.prescriptions || []);
    } catch (err) {
      console.error('Failed to load doctor dashboard', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await appointmentApi.updateStatus(id, newStatus, `Status updated by attending clinician`);
      await loadDoctorData();
    } catch (err) {
      alert(err.message || `Failed to update appointment status to ${newStatus}`);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRequests = appointments.filter(a => a.status === 'pending');
  const confirmedEncounters = appointments.filter(a => a.status === 'confirmed');
  const completedEncounters = appointments.filter(a => a.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Clinician Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Board-Certified Clinician
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {user?.full_name || 'Dr. Marcus Vance, MD'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Cardiology Specialist • License: MED-NY-89412 • MediCore Clinical Network
            </p>
          </div>

          <div className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700 text-xs space-y-1 self-start sm:self-auto">
            <span className="text-slate-400">Clinical Status:</span>
            <div className="font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Accepting Patients
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-bold text-amber-600">{pendingRequests.length}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Pending Requests</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-bold text-medicore-600">{confirmedEncounters.length}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Confirmed Upcoming</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-bold text-emerald-600">{completedEncounters.length}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Completed Consultations</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-bold text-purple-600">{prescriptions.length}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">E-Prescriptions Issued</div>
        </div>
      </div>

      {/* Section 1: Incoming Patient Requests Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Incoming Appointment Requests Queue</span>
            </h3>
            <p className="text-xs text-slate-500">Review and confirm or decline incoming consultation bookings</p>
          </div>
          <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
            {pendingRequests.length} Awaiting Response
          </span>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(apt => (
              <div key={apt.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {apt.patient?.profiles?.full_name || apt.patient_name || 'Sarah Jenkins'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Requested: {new Date(apt.appointment_date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                    Pending
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    {apt.consultation_type === 'virtual' ? <Video className="w-3.5 h-3.5 text-medicore-600" /> : <MapPin className="w-3.5 h-3.5 text-slate-500" />}
                    <span className="capitalize">{apt.consultation_type} Consultation (30 Min)</span>
                  </div>
                  <p className="text-slate-600 pt-1">
                    <span className="font-semibold text-slate-800">Complaint:</span> {apt.reason_for_visit}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                    className="flex-1 py-2 bg-medicore-600 hover:bg-medicore-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept & Confirm</span>
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                    className="py-2 px-3 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold text-xs rounded-xl transition"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">All incoming requests reviewed</p>
            <p className="text-xs text-slate-400 mt-0.5">New consultation bookings will arrive here automatically.</p>
          </div>
        )}
      </div>

      {/* Section 2: Confirmed Appointments & Clinical Encounters */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-medicore-600" />
          <span>Active Patient Encounters ({confirmedEncounters.length})</span>
        </h3>

        {confirmedEncounters.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {confirmedEncounters.map(apt => (
              <div key={apt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-medicore-50 text-medicore-700 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {apt.patient?.profiles?.full_name || apt.patient_name || 'Sarah Jenkins'}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{new Date(apt.appointment_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span className="capitalize text-medicore-600 font-medium">{apt.consultation_type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setChartAppointment(apt)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Patient Chart</span>
                  </button>

                  <button
                    onClick={() => setRxAppointment(apt)}
                    className="px-3 py-1.5 bg-medicore-600 hover:bg-medicore-700 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Write Prescription</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No confirmed patient encounters right now. Accepted appointments will appear here.
          </div>
        )}
      </div>

      {/* Section 3: Authored E-Prescriptions */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <Pill className="w-5 h-5 text-purple-600" />
          <span>Prescription Log & Clinical Dispatches</span>
        </h3>

        {prescriptions.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rx ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4">Medications Prescribed</th>
                  <th className="py-3 px-4">Issued On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {prescriptions.map(rx => (
                  <tr key={rx.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{rx.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{rx.patient?.profiles?.full_name || rx.patient_name || 'Sarah Jenkins'}</td>
                    <td className="py-3 px-4 text-slate-800">{rx.diagnosis}</td>
                    <td className="py-3 px-4">
                      {(rx.medications || []).map(m => m.name).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{new Date(rx.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
            No prescriptions recorded yet.
          </div>
        )}
      </div>

      {/* Patient Chart Modal */}
      <PatientChartModal
        appointment={chartAppointment}
        onClose={() => setChartAppointment(null)}
      />

      {/* Write Prescription Modal */}
      <WritePrescriptionModal
        appointment={rxAppointment}
        onClose={() => setRxAppointment(null)}
        onPrescriptionIssued={loadDoctorData}
      />

    </div>
  );
};
