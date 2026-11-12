import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { mockStore } from '../data/mockStore.js';

/**
 * Authentication Middleware
 * Validates Supabase Bearer JWT tokens from the Authorization header.
 * Attaches the authenticated user's profile and RBAC role to `req.user`.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header with Bearer token'
      });
    }

    const token = authHeader.split(' ')[1];

    // Check for demo/development tokens first
    if (token.startsWith('demo-token-') || (!isSupabaseConfigured && token === 'demo-token')) {
      const role = token.replace('demo-token-', '') || 'patient';
      const mockUser = mockStore.users.find(u => u.role === role) || mockStore.users[0];
      req.user = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        full_name: mockUser.full_name,
        token
      };
      return next();
    }

    // Live Supabase Token Verification
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid, expired, or revoked Supabase JWT token',
          details: authError?.message
        });
      }

      // Fetch user profile and role from profiles table
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, role, full_name, phone, is_active')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'User account exists in Auth but has no synchronized MediCore profile.'
        });
      }

      if (!profile.is_active) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Account has been deactivated. Contact clinical administration.'
        });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: profile.role,
        full_name: profile.full_name,
        token
      };

      return next();
    }

    // Fallback if token is provided but Supabase is in local demo simulation
    // Allows testing with arbitrary mock IDs
    const defaultUser = mockStore.users[0];
    req.user = {
      id: defaultUser.id,
      email: defaultUser.email,
      role: defaultUser.role,
      full_name: defaultUser.full_name,
      token
    };
    return next();
  } catch (err) {
    console.error('[AuthMiddleware] Verification exception:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify authentication token'
    });
  }
};
