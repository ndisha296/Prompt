import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { mockStore } from '../data/mockStore.js';

const BUCKET_NAME = 'medical-documents';

/**
 * POST /api/documents/upload
 * Generates signed upload URL for secure medical report storage via Supabase Storage bucket.
 * Also persists metadata record in `medical_documents`.
 */
export const createUploadSignedUrl = async (req, res, next) => {
  try {
    const patient_id = req.user.role === 'patient' ? req.user.id : (req.body.patient_id || req.user.id);
    const { file_name, file_type, file_size_bytes, description } = req.body;

    const sanitizedFileName = file_name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${patient_id}/${Date.now()}_${sanitizedFileName}`;

    if (isSupabaseConfigured && supabaseAdmin) {
      // 1. Create signed upload URL in Supabase Storage
      const { data: signedUpload, error: storageErr } = await supabaseAdmin
        .storage
        .from(BUCKET_NAME)
        .createSignedUploadUrl(storagePath);

      if (storageErr) {
        return res.status(500).json({
          error: 'Storage Error',
          message: 'Failed to generate signed upload URL from Supabase Storage',
          details: storageErr.message
        });
      }

      // 2. Generate signed download/view URL (or get public url if configured)
      const { data: signedDownload } = await supabaseAdmin
        .storage
        .from(BUCKET_NAME)
        .createSignedUrl(storagePath, 60 * 60 * 24); // 24 hours valid

      // 3. Save record in database
      const { data: docRecord, error: dbErr } = await supabaseAdmin
        .from('medical_documents')
        .insert({
          patient_id,
          file_name,
          storage_path: storagePath,
          file_url: signedDownload?.signedUrl || null,
          file_type,
          file_size_bytes,
          description: description || '',
          uploaded_by: req.user.id
        })
        .select()
        .single();

      if (dbErr) throw dbErr;

      // HIPAA Audit Log
      await supabaseAdmin.from('audit_logs').insert({
        actor_id: req.user.id,
        actor_role: req.user.role,
        action: 'INITIATE_DOCUMENT_UPLOAD',
        resource_type: 'document',
        resource_id: docRecord.id,
        ip_address: req.ip,
        details: { file_name, file_type, file_size_bytes }
      });

      return res.status(201).json({
        success: true,
        message: 'Signed upload URL generated successfully',
        signedUploadUrl: signedUpload.signedUrl,
        token: signedUpload.token,
        storagePath,
        document: docRecord
      });
    }

    // Mock store implementation
    const newDoc = {
      id: `doc-${Date.now().toString().slice(-6)}`,
      patient_id,
      file_name,
      storage_path: storagePath,
      file_url: `https://example.com/mock-storage/${storagePath}`,
      file_type,
      file_size_bytes,
      description: description || 'Clinical laboratory or diagnostic document',
      uploaded_by: req.user.id,
      uploaded_at: new Date().toISOString()
    };

    mockStore.medical_documents.unshift(newDoc);

    mockStore.audit_logs.unshift({
      id: `log-${Date.now().toString().slice(-6)}`,
      actor_id: req.user.id,
      actor_role: req.user.role,
      action: 'UPLOAD_MEDICAL_DOCUMENT',
      resource_type: 'document',
      resource_id: newDoc.id,
      ip_address: req.ip || '127.0.0.1',
      details: { file_name, file_type, file_size_bytes },
      created_at: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Signed upload URL generated (Demo simulation)',
      signedUploadUrl: `https://mock-storage.medicore.health/upload/${storagePath}?signature=demo-sig-valid`,
      token: 'demo-signed-upload-token',
      storagePath,
      document: newDoc
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/documents
 * List medical documents with strict HIPAA consent enforcement:
 * - Patient: reads own documents
 * - Doctor: can only read patient documents if an active/past appointment exists
 * - Admin: audit access
 */
export const getDocuments = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const targetPatientId = req.query.patient_id || (role === 'patient' ? userId : null);

    if (role === 'doctor' && targetPatientId) {
      // Check clinical appointment relationship
      if (isSupabaseConfigured && supabaseAdmin) {
        const { data: apts } = await supabaseAdmin
          .from('appointments')
          .select('id')
          .eq('doctor_id', userId)
          .eq('patient_id', targetPatientId)
          .in('status', ['pending', 'confirmed', 'completed']);

        if (!apts || apts.length === 0) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'HIPAA Access Control: Doctors can only view records for patients with an established appointment.'
          });
        }
      } else {
        const hasApt = mockStore.appointments.some(
          a => a.doctor_id === userId && a.patient_id === targetPatientId
        );
        if (!hasApt) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'HIPAA Access Control: Clinician does not share an active or historical appointment with this patient.'
          });
        }
      }
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      let query = supabaseAdmin
        .from('medical_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (targetPatientId) {
        query = query.eq('patient_id', targetPatientId);
      } else if (role === 'patient') {
        query = query.eq('patient_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.json({ documents: data || [] });
    }

    let docs = [...mockStore.medical_documents];
    if (targetPatientId) {
      docs = docs.filter(d => d.patient_id === targetPatientId);
    } else if (role === 'patient') {
      docs = docs.filter(d => d.patient_id === userId);
    }

    return res.json({ documents: docs });
  } catch (err) {
    next(err);
  }
};
