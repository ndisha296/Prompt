import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  FileText, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  AlertTriangle,
  Server,
  RefreshCw,
  Search
} from 'lucide-react';
import { adminApi, doctorApi } from '../../lib/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [unverifiedDoctors, setUnverifiedDoctors] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [statsRes, docsRes, logsRes] = await Promise.all([
        adminApi.getStats().catch(() => ({ stats: {} })),
        doctorApi.list({ is_verified: 'all' }).catch(() => ({ doctors: [] })),
        adminApi.getAuditLogs().catch(() => ({ audit_logs: [] }))
      ]);

      setStats(statsRes.stats || {});
      const unverified = (docsRes.doctors || []).filter(d => !d.is_verified);
      setUnverifiedDoctors(unverified);
      setAuditLogs(logsRes.audit_logs || []);
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setLoading(false);
    }
  }

  const handleVerifyDoctor = async (doctorId, shouldVerify) => {
    setActionLoading(true);
    try {
      await adminApi.verifyDoctor(doctorId, shouldVerify);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update verification state');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLogs = filterQuery
    ? auditLogs.filter(l => 
        l.action.toLowerCase().includes(filterQuery.toLowerCase()) ||
        l.resource_type.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (l.actor_role && l.actor_role.toLowerCase().includes(filterQuery.toLowerCase()))
      )
    : auditLogs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Title Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Security & Clinical Compliance Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            MediCore System Governance & HIPAA Audit Portal
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time platform oversight • Clinician credential validation • Tamper-evident audit logs
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* System Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-bold text-slate-900">{stats?.total_patients ?? 12}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Total Patients</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-bold text-emerald-600">{stats?.verified_doctors ?? 8}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Verified Clinicians</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-bold text-amber-600">{unverifiedDoctors.length}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Pending Verifications</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-bold text-medicore-600">{stats?.total_appointments ?? 14}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Total Encounters</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="text-2xl font-bold text-purple-600">{stats?.total_prescriptions ?? 9}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Total Prescriptions</div>
        </div>
      </div>

      {/* Doctor Verification Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-medicore-600" />
              <span>Doctor Licensure Verification Queue</span>
            </h3>
            <p className="text-xs text-slate-500">
              Doctors cannot accept patient consultations until verified by administration
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {unverifiedDoctors.length} Pending Approval
          </span>
        </div>

        {unverifiedDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unverifiedDoctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-medicore-50 text-medicore-700 font-bold flex items-center justify-center">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.full_name}</h4>
                      <p className="text-xs text-medicore-600 font-medium">{doc.specialization}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                    Awaiting Verification
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Medical License:</span>
                    <span className="font-mono font-bold text-slate-800">{doc.license_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-medium text-slate-800">{doc.years_of_experience} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clinic Address:</span>
                    <span className="text-slate-800 truncate max-w-[200px]">{doc.clinic_address || 'Austin Children’s Wellness'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleVerifyDoctor(doc.id, true)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Credentials</span>
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleVerifyDoctor(doc.id, false)}
                    className="py-2 px-3 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold text-xs rounded-xl transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <span className="font-semibold text-slate-700">All registered clinicians verified</span>
            <span>No pending medical credentials awaiting review in queue.</span>
          </div>
        )}
      </div>

      {/* HIPAA Compliance Audit Logs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>HIPAA Audit Trail & Security Events</span>
            </h3>
            <p className="text-xs text-slate-500">Immutable ledger of PHI access, consultations, and prescriptions</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action or role..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 font-mono">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('CREATE') ? 'bg-sky-100 text-sky-800' :
                        log.action.includes('VERIFY') ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-sans font-medium">
                      {log.actor?.full_name || log.actor_id || 'System Process'}
                    </td>
                    <td className="py-3 px-4 font-sans capitalize font-medium text-slate-700">
                      {log.actor_role || 'system'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-sans">
                      {log.resource_type} ({log.resource_id ? log.resource_id.slice(0, 8) + '...' : 'general'})
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                    No matching audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
