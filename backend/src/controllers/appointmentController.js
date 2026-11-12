import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { mockStore } from '../data/mockStore.js';

/**
 * POST /api/appointments
 * Book a new clinical encounter with double-booking / conflict verification
 */
export const createAppointment = async (req, res, next) => {
  try {
    const patient_id = req.user.role === 'admin' ? (req.body.patient_id || req.user.id) : req.user.id;
    const { doctor_id, appointment_date, consultation_type, duration_minutes = 30, reason_for_visit, notes } = req.body;

    const requestedDate = new Date(appointment_date);
    if (requestedDate < new Date()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot schedule an appointment in the past'
      });
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      // 1. Conflict Check: Doctor already booked at this time slot
      const { data: conflicts, error: conflictErr } = await supabaseAdmin
        .from('appointments')
        .select('id, appointment_date, status')
        .eq('doctor_id', doctor_id)
        .eq('appointment_date', requestedDate.toISOString())
        .in('status', ['pending', 'confirmed']);

      if (conflictErr) throw conflictErr;

      if (conflicts && conflicts.length > 0) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'The requested time slot is no longer available. Please select another time.'
        });
      }

      // 2. Insert Appointment
      const { data: appointment, error: insertErr } = await supabaseAdmin
        .from('appointments')
        .insert({
          patient_id,
          doctor_id,
          appointment_date: requestedDate.toISOString(),
          duration_minutes,
          status: 'pending',
          consultation_type,
          reason_for_visit,
          notes: notes || null
        })
        .select(`
          *,
          doctor:doctor_id (
            specialization,
            profiles:id (full_name)
          ),
          patient:patient_id (
            profiles:id (full_name, phone)
          )
        `)
        .single();

      if (insertErr) throw insertErr;

      // HIPAA Audit Log
      await supabaseAdmin.from('audit_logs').insert({
        actor_id: req.user.id,
        actor_role: req.user.role,
        action: 'CREATE_APPOINTMENT',
        resource_type: 'appointment',
        resource_id: appointment.id,
        ip_address: req.ip,
        details: { doctor_id, appointment_date: requestedDate.toISOString() }
      });

      return res.status(201).json({
        success: true,
        message: 'Appointment requested successfully',
        appointment
      });
    }

    // Mock store conflict check
    const existingConflict = mockStore.appointments.find(a =>
      a.doctor_id === doctor_id &&
      ['pending', 'confirmed'].includes(a.status) &&
      new Date(a.appointment_date).getTime() === requestedDate.getTime()
    );

    if (existingConflict) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'The requested time slot is already booked for this doctor. Please choose an alternate slot.'
      });
    }

    const doctorObj = mockStore.doctors.find(d => d.id === doctor_id);
    const newAppointment = {
      id: `apt-${Date.now().toString().slice(-6)}`,
      patient_id,
      patient_name: req.user.full_name || 'Sarah Jenkins',
      doctor_id,
      doctor_name: doctorObj ? doctorObj.full_name : 'Dr. Medical Specialist',
      doctor_specialization: doctorObj ? doctorObj.specialization : 'General Medicine',
      appointment_date: requestedDate.toISOString(),
      duration_minutes,
      status: 'pending',
      consultation_type,
      reason_for_visit,
      notes: notes || null,
      created_at: new Date().toISOString()
    };

    mockStore.appointments.unshift(newAppointment);

    mockStore.audit_logs.unshift({
      id: `log-${Date.now().toString().slice(-6)}`,
      actor_id: req.user.id,
      actor_role: req.user.role,
      action: 'CREATE_APPOINTMENT',
      resource_type: 'appointment',
      resource_id: newAppointment.id,
      ip_address: req.ip || '127.0.0.1',
      details: { doctor_id, appointment_date: requestedDate.toISOString() },
      created_at: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: newAppointment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments
 * List appointments scoped to the user's role
 */
export const getAppointments = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    if (isSupabaseConfigured && supabaseAdmin) {
      let query = supabaseAdmin
        .from('appointments')
        .select(`
          *,
          doctor:doctor_id (
            specialization,
            consultation_fee,
            profiles:id (full_name, phone)
          ),
          patient:patient_id (
            blood_group,
            profiles:id (full_name, phone)
          )
        `)
        .order('appointment_date', { ascending: true });

      if (role === 'patient') {
        query = query.eq('patient_id', id);
      } else if (role === 'doctor') {
        query = query.eq('doctor_id', id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.json({ appointments: data || [] });
    }

    let list = [...mockStore.appointments];
    if (role === 'patient') {
      list = list.filter(a => a.patient_id === id);
    } else if (role === 'doctor') {
      list = list.filter(a => a.doctor_id === id);
    }

    // Sort by appointment_date ascending
    list.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

    return res.json({ appointments: list });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/appointments/:id/status
 * Update appointment status (confirm, cancel, complete)
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellation_reason, notes } = req.body;
    const { id: userId, role } = req.user;

    if (isSupabaseConfigured && supabaseAdmin) {
      // Fetch appointment to verify access
      const { data: apt, error: fetchErr } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !apt) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Enforce permissions:
      // Patients can only cancel their own appointment
      if (role === 'patient') {
        if (apt.patient_id !== userId) {
          return res.status(403).json({ error: 'Forbidden: Cannot modify someone else\'s appointment' });
        }
        if (status !== 'cancelled') {
          return res.status(400).json({ error: 'Patients can only cancel appointments' });
        }
      }

      // Doctors can only modify appointments assigned to them
      if (role === 'doctor' && apt.doctor_id !== userId) {
        return res.status(403).json({ error: 'Forbidden: Not assigned to this appointment' });
      }

      const updatePayload = {
        status,
        ...(cancellation_reason && { cancellation_reason }),
        ...(notes && { notes })
      };

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('appointments')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return res.json({
        success: true,
        message: `Appointment status updated to '${status}'`,
        appointment: updated
      });
    }

    // Mock store
    const apt = mockStore.appointments.find(a => a.id === id);
    if (!apt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (role === 'patient') {
      if (apt.patient_id !== userId) {
        return res.status(403).json({ error: 'Forbidden: Cannot modify someone else\'s appointment' });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({ error: 'Patients can only cancel appointments' });
      }
    }

    if (role === 'doctor' && apt.doctor_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You are not assigned to this appointment' });
    }

    apt.status = status;
    if (cancellation_reason) apt.cancellation_reason = cancellation_reason;
    if (notes) apt.notes = notes;

    return res.json({
      success: true,
      message: `Appointment status updated to '${status}'`,
      appointment: apt
    });
  } catch (err) {
    next(err);
  }
};
