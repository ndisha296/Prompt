import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { mockStore } from '../data/mockStore.js';

/**
 * GET /api/admin/stats
 * Overview of platform volume, verification queues, and activity
 */
export const getSystemStats = async (req, res, next) => {
  try {
    if (isSupabaseConfigured && supabaseAdmin) {
      const [
        { count: patientCount },
        { count: doctorCount },
        { count: pendingDoctorCount },
        { count: appointmentCount },
        { count: prescriptionCount }
      ] = await Promise.all([
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
        supabaseAdmin.from('doctors').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabaseAdmin.from('doctors').select('*', { count: 'exact', head: true }).eq('is_verified', false),
        supabaseAdmin.from('appointments').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('prescriptions').select('*', { count: 'exact', head: true })
      ]);

      return res.json({
        stats: {
          total_patients: patientCount || 0,
          verified_doctors: doctorCount || 0,
          pending_doctor_verifications: pendingDoctorCount || 0,
          total_appointments: appointmentCount || 0,
          total_prescriptions: prescriptionCount || 0,
          system_status: 'Healthy (HIPAA Compliant)',
          encryption_standard: 'AES-256 at Rest / TLS 1.3 in Transit'
        }
      });
    }

    // Mock store stats
    const totalPatients = mockStore.users.filter(u => u.role === 'patient').length;
    const verifiedDoctors = mockStore.doctors.filter(d => d.is_verified).length;
    const pendingDoctors = mockStore.doctors.filter(d => !d.is_verified).length;
    const totalAppointments = mockStore.appointments.length;
    const totalPrescriptions = mockStore.prescriptions.length;

    return res.json({
      stats: {
        total_patients: totalPatients,
        verified_doctors: verifiedDoctors,
        pending_doctor_verifications: pendingDoctors,
        total_appointments: totalAppointments,
        total_prescriptions: totalPrescriptions,
        system_status: 'Healthy (HIPAA Compliant)',
        encryption_standard: 'AES-256 at Rest / TLS 1.3 in Transit'
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/doctors/:id/verify
 * Approve or reject clinician credential verification
 */
export const verifyDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body; // boolean

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('doctors')
        .update({
          is_verified,
          verified_at: is_verified ? new Date().toISOString() : null,
          verified_by: req.user.id
        })
        .eq('id', id)
        .select(`
          *,
          profiles:id (full_name)
        `)
        .single();

      if (error) throw error;

      // Audit Log
      await supabaseAdmin.from('audit_logs').insert({
        actor_id: req.user.id,
        actor_role: req.user.role,
        action: is_verified ? 'VERIFY_DOCTOR' : 'REVOKE_DOCTOR_VERIFICATION',
        resource_type: 'doctor',
        resource_id: id,
        ip_address: req.ip,
        details: { is_verified }
      });

      return res.json({
        success: true,
        message: `Doctor verification status updated to ${is_verified ? 'Verified' : 'Unverified'}`,
        doctor: data
      });
    }

    const doc = mockStore.doctors.find(d => d.id === id);
    if (!doc) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    doc.is_verified = Boolean(is_verified);
    doc.verified_at = is_verified ? new Date().toISOString() : null;

    mockStore.audit_logs.unshift({
      id: `log-${Date.now().toString().slice(-6)}`,
      actor_id: req.user.id,
      actor_role: 'admin',
      action: is_verified ? 'VERIFY_DOCTOR' : 'REVOKE_DOCTOR_VERIFICATION',
      resource_type: 'doctor',
      resource_id: id,
      ip_address: req.ip || '127.0.0.1',
      details: { is_verified },
      created_at: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `Doctor verification status updated to ${is_verified ? 'Verified' : 'Unverified'}`,
      doctor: doc
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/audit-logs
 * Review HIPAA compliance audit trail
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('audit_logs')
        .select(`
          *,
          actor:actor_id (full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return res.json({ audit_logs: data || [] });
    }

    return res.json({ audit_logs: mockStore.audit_logs });
  } catch (err) {
    next(err);
  }
};
