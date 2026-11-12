import { z } from 'zod';

export const userRoleEnum = z.enum(['patient', 'doctor', 'admin']);
export const appointmentStatusEnum = z.enum(['pending', 'confirmed', 'completed', 'cancelled']);
export const consultationTypeEnum = z.enum(['in-person', 'virtual']);
export const bloodGroupEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

/**
 * Validates synchronization of a newly signed-up Supabase auth user into public tables
 */
export const authSyncSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  role: userRoleEnum.default('patient'),
  full_name: z.string().min(2, 'Full name must have at least 2 characters'),
  phone: z.string().optional().nullable(),
  // Optional doctor-specific fields during onboarding
  specialization: z.string().optional(),
  license_number: z.string().optional(),
  consultation_fee: z.number().min(0).optional(),
  clinic_address: z.string().optional(),
  bio: z.string().optional(),
  // Optional patient-specific fields during onboarding
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  blood_group: bloodGroupEnum.optional(),
  emergency_contact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional()
  }).optional(),
  medical_history_summary: z.string().optional()
});

/**
 * Validates new clinical appointment booking
 */
export const createAppointmentSchema = z.object({
  doctor_id: z.string().min(1, 'Doctor ID is required'),
  appointment_date: z.string().datetime({ message: 'Must be a valid ISO-8601 UTC timestamp' }),
  consultation_type: consultationTypeEnum.default('virtual'),
  duration_minutes: z.number().int().positive().default(30),
  reason_for_visit: z.string().min(3, 'Please describe the reason for visit with at least 3 characters'),
  notes: z.string().optional().nullable()
});

/**
 * Validates appointment status change (confirm, complete, cancel)
 */
export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusEnum,
  cancellation_reason: z.string().optional(),
  notes: z.string().optional()
});

/**
 * Validates medication item inside an e-prescription
 */
export const medicationItemSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required (e.g., 500mg)'),
  frequency: z.string().min(1, 'Frequency is required (e.g., 2x daily)'),
  duration: z.string().min(1, 'Duration is required (e.g., 7 days)'),
  instructions: z.string().optional().default('')
});

/**
 * Validates digital prescription issuance
 */
export const createPrescriptionSchema = z.object({
  appointment_id: z.string().min(1, 'Appointment reference ID is required'),
  patient_id: z.string().min(1, 'Patient ID is required'),
  diagnosis: z.string().min(3, 'Clinical diagnosis is required'),
  medications: z.array(medicationItemSchema).min(1, 'At least one medication must be prescribed'),
  instructions: z.string().optional().default('')
});

/**
 * Validates medical document signed upload URL creation
 */
export const documentUploadRequestSchema = z.object({
  file_name: z.string().min(1, 'File name is required'),
  file_type: z.string().refine(
    type => ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(type),
    { message: 'Only PDF, JPEG, PNG, and WebP medical records are accepted' }
  ),
  file_size_bytes: z.number().positive().max(26214400, 'Max file size is 25MB'),
  description: z.string().optional().default('')
});

/**
 * Query filters for searching verified clinicians
 */
export const doctorQueryFilterSchema = z.object({
  specialization: z.string().optional(),
  search: z.string().optional(),
  is_verified: z.enum(['true', 'false', 'all']).optional()
});
