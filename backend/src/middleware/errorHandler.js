/**
 * Centralized Error Handler Middleware
 * Sanitizes internal error details in production to prevent information disclosure.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[MediCore Server Error]', {
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : 'Request Error',
    message: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Clinical IT operations have been notified.'
      : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
