import { Router } from 'express';
import { getDoctors, getDoctorById, updateDoctorSchedule } from '../controllers/doctorController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';
import { validateZod } from '../middleware/validateZod.js';
import { doctorQueryFilterSchema } from '../validators/index.js';

const router = Router();

// GET /api/doctors - Search/filter doctors by specialization, query, availability
router.get('/', validateZod(doctorQueryFilterSchema, 'query'), getDoctors);

// GET /api/doctors/:id - Single doctor profile & schedule
router.get('/:id', getDoctorById);

// PUT /api/doctors/:id/schedule - Clinician updates availability schedule
router.put('/:id/schedule', authMiddleware, requireRole('doctor', 'admin'), updateDoctorSchedule);

export default router;
