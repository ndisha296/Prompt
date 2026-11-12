import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus
} from '../controllers/appointmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';
import { validateZod } from '../middleware/validateZod.js';
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema
} from '../validators/index.js';

const router = Router();

// Protect all appointment endpoints with JWT authentication
router.use(authMiddleware);

// GET /api/appointments - Retrieve role-scoped appointments
router.get('/', getAppointments);

// POST /api/appointments - Book appointment with conflict validation
router.post(
  '/',
  requireRole('patient', 'admin'),
  validateZod(createAppointmentSchema),
  createAppointment
);

// PATCH /api/appointments/:id/status - Doctor confirms/completes/cancels, Patient cancels
router.patch(
  '/:id/status',
  validateZod(updateAppointmentStatusSchema),
  updateAppointmentStatus
);

export default router;
