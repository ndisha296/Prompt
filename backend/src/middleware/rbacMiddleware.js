/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces route authorization based on verified user roles ('patient', 'doctor', 'admin').
 *
 * @param  {...string} allowedRoles - Array of authorized roles allowed to access the route
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication context missing'
      });
    }

    const { role } = req.user;

    // Admin role has omni-access across all endpoints
    if (role === 'admin') {
      return next();
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Endpoint requires one of roles: [${allowedRoles.join(', ')}]. Current role: '${role}'.`
      });
    }

    return next();
  };
};
