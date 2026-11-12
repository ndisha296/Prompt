import { Router } from 'express';
import { syncProfile, getMe } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateZod } from '../middleware/validateZod.js';
import { authSyncSchema } from '../validators/index.js';

const router = Router();

// POST /api/auth/sync - sync Supabase auth user with profiles table
router.post('/sync', validateZod(authSyncSchema), syncProfile);

// GET /api/auth/me - get current user profile and role data
router.get('/me', authMiddleware, getMe);

export default router;
