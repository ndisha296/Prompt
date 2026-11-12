import { Router } from 'express';
import { getSystemStats, verifyDoctor, getAuditLogs } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = Router();

// Protect all admin endpoints with auth and admin role requirement
router.use(authMiddleware);
router.use(requireRole('admin'));

// GET /api/admin/stats - System health & platform metrics
router.get('/stats', getSystemStats);

// PATCH /api/admin/doctors/:id/verify - Approve/reject doctor credentials
router.patch('/doctors/:id/verify', verifyDoctor);

// GET /api/admin/audit-logs - HIPAA compliance access logs
router.get('/audit-logs', getAuditLogs);

export default router;
