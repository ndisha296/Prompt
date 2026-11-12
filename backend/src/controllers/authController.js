import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { mockStore } from '../data/mockStore.js';

/**
 * POST /api/auth/sync
 * Synchronizes newly registered Supabase auth user with application profiles and role tables.
 */
export const syncProfile = async (req, res, next) => {
  try {
    const {
      id,
      role = 'patient',
      full_name,
      phone,
      specialization,
      license_number,
      consultation_fee,
      clinic_address,
      bio,
      date_of_birth,
      gender,
      blood_group,
      emergency_contact,
      medical_history_summary
    } = req.body;

    if (isSupabaseConfigured && supabaseAdmin) {
      // Upsert profile
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id,
          role,
          full_name,
          phone: phone || null,
          is_active: true
        })
        .select()
        .single();

      if (profileErr) {
        return res.status(400).json({ error: 'Profile sync failed', details: profileErr.message });
      }

      // Upsert role-specific table
      if (role === 'doctor') {
        const { error: docErr } = await supabaseAdmin
          .from('doctors')
          .upsert({
            id,
            specialization: specialization || 'General Medicine',
            license_number: license_number || `MED-${Date.now().toString().slice(-6)}`,
            consultation_fee: consultation_fee || 100.00,
            clinic_address: clinic_address || '',
            bio: bio || '',
            is_verified: false
          });
        if (docErr) throw docErr;
      } else if (role === 'patient') {
        const { error: patErr } = await supabaseAdmin
          .from('patients')
          .upsert({
            id,
            date_of_birth: date_of_birth || null,
            gender: gender || null,
            blood_group: blood_group || null,
            emergency_contact: emergency_contact || {},
            medical_history_summary: medical_history_summary || ''
          });
        if (patErr) throw patErr;
      }

      return res.status(200).json({
        success: true,
        message: 'Profile synchronized successfully',
        profile
      });
    }

    // Local Mock / Fallback Mode
    let existingUser = mockStore.users.find(u => u.id === id);
    if (!existingUser) {
      existingUser = {
        id,
        email: `${id}@medicore.health`,
        role,
        full_name,
        phone,
        created_at: new Date().toISOString()
      };
      mockStore.users.push(existingUser);
    } else {
      existingUser.full_name = full_name;
      existingUser.role = role;
      existingUser.phone = phone;
    }

    if (role === 'doctor') {
      const existingDoc = mockStore.doctors.find(d => d.id === id);
      if (!existingDoc) {
        mockStore.doctors.push({
          id,
          full_name,
          specialization: specialization || 'General Medicine',
          license_number: license_number || `MED-${Date.now().toString().slice(-6)}`,
          years_of_experience: 3,
          consultation_fee: consultation_fee || 120.00,
          clinic_address: clinic_address || 'MediCore Health Clinic',
          bio: bio || 'Practicing clinician committed to patient-centered care.',
          is_verified: false,
          verified_at: null,
          availability_schedule: {
            monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
            wednesday: ['09:00', '10:00', '11:00', '14:00'],
            friday: ['09:00', '10:00', '11:00']
          }
        });
      }
    } else if (role === 'patient') {
      const existingPat = mockStore.patients.find(p => p.id === id);
      if (!existingPat) {
        mockStore.patients.push({
          id,
          full_name,
          date_of_birth: date_of_birth || '1995-01-01',
          gender: gender || 'Not specified',
          blood_group: blood_group || 'O+',
          emergency_contact: emergency_contact || { name: 'Emergency Contact', relationship: 'Family', phone: phone || '' },
          allergies: [],
          chronic_conditions: [],
          medical_history_summary: medical_history_summary || 'No prior medical complications noted.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile synchronized in mock store',
      profile: existingUser
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Retrieves current authenticated user context and role data.
 */
export const getMe = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      let extra = null;
      if (role === 'doctor') {
        const { data: doc } = await supabaseAdmin.from('doctors').select('*').eq('id', id).single();
        extra = doc;
      } else if (role === 'patient') {
        const { data: pat } = await supabaseAdmin.from('patients').select('*').eq('id', id).single();
        extra = pat;
      }

      return res.json({
        user: {
          ...req.user,
          ...profile,
          roleData: extra
        }
      });
    }

    // Mock store
    const user = mockStore.users.find(u => u.id === id) || req.user;
    let extra = null;
    if (role === 'doctor') {
      extra = mockStore.doctors.find(d => d.id === id);
    } else if (role === 'patient') {
      extra = mockStore.patients.find(p => p.id === id);
    }

    return res.json({
      user: {
        ...user,
        roleData: extra
      }
    });
  } catch (err) {
    next(err);
  }
};
