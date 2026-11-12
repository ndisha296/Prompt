import { Router } from 'express';
import { createUploadSignedUrl, getDocuments } from '../controllers/documentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateZod } from '../middleware/validateZod.js';
import { documentUploadRequestSchema } from '../validators/index.js';

const router = Router();

// Protect all medical document endpoints
router.use(authMiddleware);

// GET /api/documents - List documents with HIPAA access checks
router.get('/', getDocuments);

// POST /api/documents/upload - Generate signed upload URL for secure Supabase Storage
router.post(
  '/upload',
  validateZod(documentUploadRequestSchema),
  createUploadSignedUrl
);

export default router;
