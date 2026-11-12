import { Router } from 'express';
import { createPrescription, getPrescriptions } from '../controllers/prescriptionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';
import { validateZod } from '../middleware/validateZod.js';
import { createPrescriptionSchema } from '../validators/index.js';

const router = Router();

// Protect all prescription routes
router.use(authMiddleware);

// GET /api/prescriptions - Fetch role-scoped prescriptions
router.get('/', getPrescriptions);

// POST /api/prescriptions - Doctors create digital e-prescriptions
router.post(
  '/',
  requireRole('doctor', 'admin'),
  validateZod(createPrescriptionSchema),
  createPrescription
);

export default router;
