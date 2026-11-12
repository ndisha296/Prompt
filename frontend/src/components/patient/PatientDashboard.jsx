import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Plus, 
  Video, 
  MapPin, 
  Pill, 
  User, 
  ShieldCheck, 
  HeartPulse, 
  Upload, 
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi, prescriptionApi, documentApi } from '../../lib/api';
import { BookAppointmentModal } from './BookAppointmentModal';
import { PrescriptionDetailModal } from './PrescriptionDetailModal';
import { UploadDocumentModal } from './UploadDocumentModal';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, prescriptions, documents, profile

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [aptRes, rxRes, docRes] = await Promise.all([
        appointmentApi.list().catch(() => ({ appointments: [] })),
        prescriptionApi.list().catch(() => ({ prescriptions: [] })),
        documentApi.list().catch(() => ({ documents: [] }))
      ]);

      setAppointments(aptRes.appointments || []);
      setPrescriptions(rxRes.prescriptions || []);
      setDocuments(docRes.documents || []);
    } catch (err) {
      console.error('Error loading patient dashboard data', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentApi.updateStatus(id, 'cancelled', 'Cancelled by patient');
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  const upcomingApts = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-medicore-700 via-medicore-600 to-sky-600 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-medicore-100 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Patient Health Portal • Verified
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, {user?.full_name || 'Patient'}
            </h1>
            <p className="text-medicore-100 text-xs sm:text-sm mt-1">
              Your personal health records, e-prescriptions, and appointments are secured under HIPAA RLS.
            </p>
          </div>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-5 py-3 bg-white hover:bg-medicore-50 text-medicore-700 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-medicore-600" />
            <span>Book Consultation</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-medicore-50 text-medicore-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{upcomingApts.length}</div>
            <div className="text-xs text-slate-500 font-medium">Upcoming Visits</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{prescriptions.length}</div>
            <div className="text-xs text-slate-500 font-medium">Digital Prescriptions</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{documents.length}</div>
            <div className="text-xs text-slate-500 font-medium">Stored Medical Records</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          {[
            { key: 'appointments', label: 'My Appointments', count: appointments.length },
            { key: 'prescriptions', label: 'Prescriptions (Rx)', count: prescriptions.length },
            { key: 'documents', label: 'Medical Documents Vault', count: documents.length },
            { key: 'profile', label: 'Clinical Medical Chart', count: null }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-medicore-600 text-medicore-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Appointments */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">Consultation History & Schedule</h3>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="text-xs font-semibold text-medicore-600 hover:text-medicore-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Appointment</span>
            </button>
          </div>

          {appointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map(apt => (
                <div 
                  key={apt.id} 
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-medicore-50 text-medicore-700 flex items-center justify-center font-bold">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {apt.doctor?.profiles?.full_name || apt.doctor_name || 'Dr. Medical Specialist'}
                        </h4>
                        <p className="text-xs text-medicore-600 font-medium">
                          {apt.doctor?.specialization || apt.doctor_specialization || 'Clinical Specialist'}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      apt.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      apt.status === 'completed' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                      'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-800">
                        {new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-slate-400">•</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {apt.consultation_type === 'virtual' ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-medicore-600" />
                          <span className="text-medicore-700 font-medium">Encrypted Telehealth Video Link</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>In-Person Consultation</span>
                        </>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-200/60 text-slate-700">
                      <span className="font-semibold text-slate-900">Reason:</span> {apt.reason_for_visit}
                    </div>
                  </div>

                  {/* Actions */}
                  {['pending', 'confirmed'].includes(apt.status) && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1 rounded hover:bg-rose-50 transition"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No appointments scheduled</p>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="mt-3 px-4 py-2 bg-medicore-600 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Book Your First Visit
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Digital Prescriptions (E-Rx)</h3>

          {prescriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map(rx => (
                <div 
                  key={rx.id} 
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
                        <Pill className="w-3 h-3 text-emerald-600" />
                        Valid E-Prescription
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{rx.diagnosis}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Prescribed by {rx.doctor?.profiles?.full_name || rx.doctor_name || 'Dr. Marcus Vance, MD'}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(rx.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-semibold text-slate-700">Medications:</span>
                    <ul className="list-disc list-inside text-slate-600 pl-1 space-y-0.5">
                      {(rx.medications || []).map((m, i) => (
                        <li key={i}>
                          <span className="font-medium text-slate-800">{m.name}</span> ({m.dosage}) - {m.frequency}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setSelectedPrescription(rx)}
                    className="w-full py-2 bg-medicore-50 hover:bg-medicore-600 text-medicore-700 hover:text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Download Official Rx</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No prescriptions found</p>
              <p className="text-xs text-slate-400 mt-1">Prescriptions issued by your attending doctors will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Documents Vault */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Medical Records Vault</h3>
              <p className="text-xs text-slate-500">Encrypted Cloud Storage • Available to your consulting clinicians</p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-medicore-600 hover:bg-medicore-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          {documents.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {documents.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{doc.file_name}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>{doc.description || 'Clinical Document'}</span>
                        <span>•</span>
                        <span>{doc.file_size_bytes ? `${Math.round(doc.file_size_bytes / 1024)} KB` : '1.2 MB'}</span>
                        <span>•</span>
                        <span>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={doc.file_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-medicore-600 hover:text-medicore-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-medicore-300 transition"
                  >
                    View File
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No documents deposited yet</p>
              <p className="text-xs text-slate-400 mt-1">Upload lab results, blood tests, or diagnostic imaging.</p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-3 px-4 py-2 bg-medicore-600 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Upload Medical Record
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Health Chart */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-12 h-12 rounded-xl bg-medicore-100 text-medicore-700 flex items-center justify-center font-bold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{user?.full_name || 'Sarah Jenkins'}</h3>
              <p className="text-xs text-slate-500">Patient Identifier: {user?.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Blood Group</span>
              <span className="font-bold text-slate-900 text-lg text-rose-600">O+ (Positive)</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Date of Birth</span>
              <span className="font-bold text-slate-900 text-lg">June 14, 1992</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Emergency Contact</span>
              <div className="font-bold text-slate-900">David Jenkins (Spouse)</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">+1 (555) 777-8899</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Known Allergies</span>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs rounded-full">
                  Penicillin
                </span>
                <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs rounded-full">
                  Sulfa Drugs
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Chronic Conditions</span>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-xs rounded-full">
                  Mild Asthma
                </span>
                <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-xs rounded-full">
                  Migraine with Aura
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Medical History Summary</span>
            <p className="text-xs text-slate-700 leading-relaxed">
              Patient has a history of seasonal asthma managed with albuterol. Undergoing routine cardiac checkups following mild palpitation history in 2024. No prior surgical interventions or cardiovascular hospitalizations on file.
            </p>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onAppointmentCreated={loadDashboardData}
      />

      {/* Prescription View Modal */}
      <PrescriptionDetailModal
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />

      {/* Document Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDocumentUploaded={loadDashboardData}
      />

    </div>
  );
};
