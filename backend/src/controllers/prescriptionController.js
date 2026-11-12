import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { mockStore } from '../data/mockStore.js';

/**
 * POST /api/prescriptions
 * Doctors issue secure digital e-prescriptions tied to a verified consultation
 */
export const createPrescription = async (req, res, next) => {
  try {
    const doctor_id = req.user.id;
    const { appointment_id, patient_id, diagnosis, medications, instructions } = req.body;

    if (isSupabaseConfigured && supabaseAdmin) {
      // 1. Verify clinical encounter relationship
      const { data: apt, error: aptErr } = await supabaseAdmin
        .from('appointments')
        .select('id, doctor_id, patient_id, status')
        .eq('id', appointment_id)
        .single();

      if (aptErr || !apt) {
        return res.status(404).json({ error: 'Referenced appointment not found' });
      }

      if (apt.doctor_id !== doctor_id && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only the clinician assigned to this appointment can issue a prescription.'
        });
      }

      // 2. Insert Prescription
      const { data: prescription, error: rxErr } = await supabaseAdmin
        .from('prescriptions')
        .insert({
          appointment_id,
          doctor_id,
          patient_id,
          diagnosis,
          medications,
          instructions: instructions || ''
        })
        .select(`
          *,
          doctor:doctor_id (
            specialization,
            profiles:id (full_name)
          ),
          patient:patient_id (
            profiles:id (full_name)
          )
        `)
        .single();

      if (rxErr) throw rxErr;

      // 3. Automatically advance appointment status to completed
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointment_id);

      // HIPAA Audit Log
      await supabaseAdmin.from('audit_logs').insert({
        actor_id: doctor_id,
        actor_role: req.user.role,
        action: 'CREATE_PRESCRIPTION',
        resource_type: 'prescription',
        resource_id: prescription.id,
        ip_address: req.ip,
        details: { patient_id, appointment_id }
      });

      return res.status(201).json({
        success: true,
        message: 'Digital prescription issued and appointment concluded',
        prescription
      });
    }

    // Mock store
    const apt = mockStore.appointments.find(a => a.id === appointment_id);
    if (!apt) {
      return res.status(404).json({ error: 'Referenced appointment not found' });
    }

    if (apt.doctor_id !== doctor_id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the clinician assigned to this appointment can issue a prescription.'
      });
    }

    const doctorObj = mockStore.doctors.find(d => d.id === doctor_id);
    const patientObj = mockStore.patients.find(p => p.id === patient_id);

    const newPrescription = {
      id: `rx-${Date.now().toString().slice(-6)}`,
      appointment_id,
      doctor_id,
      doctor_name: doctorObj ? doctorObj.full_name : 'Dr. Marcus Vance, MD',
      patient_id,
      patient_name: patientObj ? patientObj.full_name : apt.patient_name,
      diagnosis,
      medications,
      instructions: instructions || '',
      created_at: new Date().toISOString()
    };

    mockStore.prescriptions.unshift(newPrescription);
    apt.status = 'completed';

    mockStore.audit_logs.unshift({
      id: `log-${Date.now().toString().slice(-6)}`,
      actor_id: doctor_id,
      actor_role: req.user.role,
      action: 'CREATE_PRESCRIPTION',
      resource_type: 'prescription',
      resource_id: newPrescription.id,
      ip_address: req.ip || '127.0.0.1',
      details: { patient_id, appointment_id },
      created_at: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Digital prescription issued and appointment marked as completed',
      prescription: newPrescription
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/prescriptions
 * Fetch prescriptions according to user role
 */
export const getPrescriptions = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    if (isSupabaseConfigured && supabaseAdmin) {
      let query = supabaseAdmin
        .from('prescriptions')
        .select(`
          *,
          doctor:doctor_id (
            specialization,
            profiles:id (full_name)
          ),
          patient:patient_id (
            profiles:id (full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (role === 'patient') {
        query = query.eq('patient_id', id);
      } else if (role === 'doctor') {
        query = query.eq('doctor_id', id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.json({ prescriptions: data || [] });
    }

    let list = [...mockStore.prescriptions];
    if (role === 'patient') {
      list = list.filter(p => p.patient_id === id);
    } else if (role === 'doctor') {
      list = list.filter(p => p.doctor_id === id);
    }

    return res.json({ prescriptions: list });
  } catch (err) {
    next(err);
  }
};
