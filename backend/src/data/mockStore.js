// In-memory fallback dataset for seamless local testing & demo execution
export const mockStore = {
  users: [
    {
      id: 'patient-101',
      email: 'sarah.jenkins@example.com',
      role: 'patient',
      full_name: 'Sarah Jenkins',
      phone: '+1 (555) 234-5678',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'doctor-201',
      email: 'dr.marcus.vance@example.com',
      role: 'doctor',
      full_name: 'Dr. Marcus Vance, MD',
      phone: '+1 (555) 876-5432',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    },
    {
      id: 'doctor-202',
      email: 'dr.elena.rostova@example.com',
      role: 'doctor',
      full_name: 'Dr. Elena Rostova, MD',
      phone: '+1 (555) 987-1234',
      created_at: new Date(Date.now() - 45 * 86400000).toISOString()
    },
    {
      id: 'doctor-203',
      email: 'dr.chen.wei@example.com',
      role: 'doctor',
      full_name: 'Dr. Chen Wei, MD',
      phone: '+1 (555) 345-6789',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: 'admin-001',
      email: 'admin@medicore.health',
      role: 'admin',
      full_name: 'System Administrator (Chief of Security)',
      phone: '+1 (555) 000-1122',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString()
    }
  ],

  doctors: [
    {
      id: 'doctor-201',
      full_name: 'Dr. Marcus Vance, MD',
      specialization: 'Cardiology',
      license_number: 'MED-NY-89412',
      years_of_experience: 14,
      consultation_fee: 150.00,
      clinic_address: 'MediCore Heart Institute, Suite 400, Manhattan, NY',
      bio: 'Board-certified cardiologist specializing in preventive heart health, coronary artery disease, and non-invasive diagnostics.',
      is_verified: true,
      verified_at: '2025-01-15T09:00:00Z',
      availability_schedule: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        tuesday: ['09:00', '10:00', '11:00', '14:00'],
        wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        thursday: ['14:00', '15:00', '16:00'],
        friday: ['09:00', '10:00', '11:00']
      }
    },
    {
      id: 'doctor-202',
      full_name: 'Dr. Elena Rostova, MD',
      specialization: 'Neurology',
      license_number: 'MED-CA-55120',
      years_of_experience: 9,
      consultation_fee: 175.00,
      clinic_address: 'Neuroscience Center, Suite 210, San Francisco, CA',
      bio: 'Specialist in migraine management, neuropathy, and comprehensive cognitive health assessment.',
      is_verified: true,
      verified_at: '2025-02-01T10:30:00Z',
      availability_schedule: {
        monday: ['10:00', '11:00', '14:00'],
        wednesday: ['10:00', '11:00', '15:00'],
        friday: ['10:00', '13:00', '14:00']
      }
    },
    {
      id: 'doctor-203',
      full_name: 'Dr. Chen Wei, MD',
      specialization: 'Pediatrics & Adolescent Care',
      license_number: 'MED-TX-33890',
      years_of_experience: 6,
      consultation_fee: 120.00,
      clinic_address: 'Austin Children’s Wellness Pavilion, Austin, TX',
      bio: 'Passionate pediatrician focused on developmental milestones, seasonal allergies, and adolescent preventative health.',
      is_verified: false, // In verification queue for admin!
      verified_at: null,
      availability_schedule: {
        tuesday: ['09:00', '10:00', '11:00', '13:00'],
        thursday: ['09:00', '10:00', '11:00', '13:00']
      }
    }
  ],

  patients: [
    {
      id: 'patient-101',
      full_name: 'Sarah Jenkins',
      date_of_birth: '1992-06-14',
      gender: 'Female',
      blood_group: 'O+',
      emergency_contact: {
        name: 'David Jenkins',
        relationship: 'Spouse',
        phone: '+1 (555) 777-8899'
      },
      allergies: ['Penicillin', 'Sulfa Drugs'],
      chronic_conditions: ['Mild Asthma', 'Migraine with Aura'],
      medical_history_summary: 'Patient has a history of seasonal asthma managed with albuterol. Undergoing routine cardiac checkups following mild palpitation history in 2024.'
    }
  ],

  appointments: [
    {
      id: 'apt-001',
      patient_id: 'patient-101',
      patient_name: 'Sarah Jenkins',
      doctor_id: 'doctor-201',
      doctor_name: 'Dr. Marcus Vance, MD',
      doctor_specialization: 'Cardiology',
      appointment_date: new Date(Date.now() + 2 * 86400000).toISOString(),
      duration_minutes: 30,
      status: 'confirmed',
      consultation_type: 'virtual',
      reason_for_visit: 'Routine follow-up on echocardiogram and exercise tolerance results.',
      notes: 'Patient requested digital meeting link.',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'apt-002',
      patient_id: 'patient-101',
      patient_name: 'Sarah Jenkins',
      doctor_id: 'doctor-202',
      doctor_name: 'Dr. Elena Rostova, MD',
      doctor_specialization: 'Neurology',
      appointment_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      duration_minutes: 45,
      status: 'pending',
      consultation_type: 'in-person',
      reason_for_visit: 'Recurrent bilateral headaches over the past 3 weeks.',
      notes: null,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'apt-000',
      patient_id: 'patient-101',
      patient_name: 'Sarah Jenkins',
      doctor_id: 'doctor-201',
      doctor_name: 'Dr. Marcus Vance, MD',
      doctor_specialization: 'Cardiology',
      appointment_date: new Date(Date.now() - 14 * 86400000).toISOString(),
      duration_minutes: 30,
      status: 'completed',
      consultation_type: 'virtual',
      reason_for_visit: 'Initial palpitations consultation.',
      notes: 'Advised Holter monitor test for 24h. Prescribed lifestyle adjustments.',
      created_at: new Date(Date.now() - 16 * 86400000).toISOString()
    }
  ],

  prescriptions: [
    {
      id: 'rx-501',
      appointment_id: 'apt-000',
      doctor_id: 'doctor-201',
      doctor_name: 'Dr. Marcus Vance, MD',
      patient_id: 'patient-101',
      patient_name: 'Sarah Jenkins',
      diagnosis: 'Sinus Tachycardia (Benign, Stress-Associated)',
      medications: [
        {
          name: 'Metoprolol Tartrate',
          dosage: '25mg',
          frequency: 'Once daily (morning)',
          duration: '30 days',
          instructions: 'Take with or immediately following a meal. Monitor resting heart rate.'
        },
        {
          name: 'Magnesium Glycinate Supplement',
          dosage: '200mg',
          frequency: 'Nightly',
          duration: '60 days',
          instructions: 'Take before sleep with plenty of water.'
        }
      ],
      instructions: 'Limit caffeine intake to 1 cup/day. Engage in 30 minutes of low-impact walking daily. Return if palpitations exceed 110bpm at rest.',
      created_at: new Date(Date.now() - 14 * 86400000).toISOString()
    }
  ],

  medical_documents: [
    {
      id: 'doc-701',
      patient_id: 'patient-101',
      file_name: 'Holter_Monitor_Telemetry_Report.pdf',
      storage_path: 'patient-101/Holter_Monitor_Telemetry_Report.pdf',
      file_url: 'https://example.com/mock-storage/Holter_Monitor_Telemetry_Report.pdf',
      file_type: 'application/pdf',
      file_size_bytes: 1458920,
      description: '24-hour ambulatory cardiac rhythm report',
      uploaded_by: 'patient-101',
      uploaded_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'doc-702',
      patient_id: 'patient-101',
      file_name: 'Comprehensive_Metabolic_Panel.pdf',
      storage_path: 'patient-101/Comprehensive_Metabolic_Panel.pdf',
      file_url: 'https://example.com/mock-storage/Comprehensive_Metabolic_Panel.pdf',
      file_type: 'application/pdf',
      file_size_bytes: 842100,
      description: 'Fast blood chemistry & electrolyte panel',
      uploaded_by: 'patient-101',
      uploaded_at: new Date(Date.now() - 25 * 86400000).toISOString()
    }
  ],

  audit_logs: [
    {
      id: 'log-001',
      actor_id: 'doctor-201',
      actor_role: 'doctor',
      action: 'READ_PATIENT_CHART',
      resource_type: 'patient',
      resource_id: 'patient-101',
      ip_address: '192.168.1.45',
      user_agent: 'MediCore-Clinician/1.0',
      details: { justification: 'Scheduled appointment apt-001' },
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'log-002',
      actor_id: 'doctor-201',
      actor_role: 'doctor',
      action: 'CREATE_PRESCRIPTION',
      resource_type: 'prescription',
      resource_id: 'rx-501',
      ip_address: '192.168.1.45',
      user_agent: 'MediCore-Clinician/1.0',
      details: { appointment_id: 'apt-000' },
      created_at: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
      id: 'log-003',
      actor_id: 'admin-001',
      actor_role: 'admin',
      action: 'VERIFY_DOCTOR',
      resource_type: 'doctor',
      resource_id: 'doctor-201',
      ip_address: '10.0.0.12',
      user_agent: 'MediCore-AdminPortal/1.0',
      details: { license_verified: true, state_board: 'NY' },
      created_at: '2025-01-15T09:00:00Z'
    }
  ]
};
