import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { mockStore } from '../data/mockStore.js';

/**
 * GET /api/doctors
 * Search and list clinicians with optional specialization and search filters.
 */
export const getDoctors = async (req, res, next) => {
  try {
    const { specialization, search, is_verified } = req.query;

    if (isSupabaseConfigured && supabaseAdmin) {
      let query = supabaseAdmin
        .from('doctors')
        .select(`
          id,
          specialization,
          license_number,
          years_of_experience,
          consultation_fee,
          bio,
          clinic_address,
          is_verified,
          availability_schedule,
          profiles:id (
            full_name,
            phone,
            avatar_url
          )
        `);

      if (is_verified !== 'all') {
        const verifiedBool = is_verified === 'false' ? false : true;
        query = query.eq('is_verified', verifiedBool);
      }

      if (specialization) {
        query = query.ilike('specialization', `%${specialization}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = (data || []).map(d => ({
        id: d.id,
        full_name: d.profiles?.full_name || 'Dr. Medical Specialist',
        phone: d.profiles?.phone,
        avatar_url: d.profiles?.avatar_url,
        specialization: d.specialization,
        license_number: d.license_number,
        years_of_experience: d.years_of_experience,
        consultation_fee: Number(d.consultation_fee),
        bio: d.bio,
        clinic_address: d.clinic_address,
        is_verified: d.is_verified,
        availability_schedule: d.availability_schedule
      }));

      if (search) {
        const s = search.toLowerCase();
        results = results.filter(d =>
          d.full_name.toLowerCase().includes(s) ||
          d.specialization.toLowerCase().includes(s) ||
          (d.clinic_address && d.clinic_address.toLowerCase().includes(s))
        );
      }

      return res.json({ doctors: results, count: results.length });
    }

    // Mock store
    let docs = [...mockStore.doctors];

    if (is_verified !== 'all') {
      const verifiedBool = is_verified === 'false' ? false : true;
      docs = docs.filter(d => d.is_verified === verifiedBool);
    }

    if (specialization) {
      docs = docs.filter(d => d.specialization.toLowerCase().includes(specialization.toLowerCase()));
    }

    if (search) {
      const s = search.toLowerCase();
      docs = docs.filter(d =>
        d.full_name.toLowerCase().includes(s) ||
        d.specialization.toLowerCase().includes(s) ||
        (d.clinic_address && d.clinic_address.toLowerCase().includes(s))
      );
    }

    return res.json({ doctors: docs, count: docs.length });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/doctors/:id
 * Retrieve comprehensive clinician profile including availability
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('doctors')
        .select(`
          id,
          specialization,
          license_number,
          years_of_experience,
          consultation_fee,
          bio,
          clinic_address,
          is_verified,
          availability_schedule,
          profiles:id (
            full_name,
            phone,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      return res.json({
        doctor: {
          id: data.id,
          full_name: data.profiles?.full_name,
          phone: data.profiles?.phone,
          specialization: data.specialization,
          license_number: data.license_number,
          years_of_experience: data.years_of_experience,
          consultation_fee: Number(data.consultation_fee),
          bio: data.bio,
          clinic_address: data.clinic_address,
          is_verified: data.is_verified,
          availability_schedule: data.availability_schedule
        }
      });
    }

    const doc = mockStore.doctors.find(d => d.id === id);
    if (!doc) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    return res.json({ doctor: doc });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/doctors/:id/schedule
 * Update clinician recurring availability schedule
 */
export const updateDoctorSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;

    // Ensure only doctor themselves or admin can update
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized to modify this schedule' });
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('doctors')
        .update({ availability_schedule: schedule })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, doctor: data });
    }

    const doc = mockStore.doctors.find(d => d.id === id);
    if (!doc) return res.status(404).json({ error: 'Doctor not found' });

    doc.availability_schedule = schedule;
    return res.json({ success: true, doctor: doc });
  } catch (err) {
    next(err);
  }
};
