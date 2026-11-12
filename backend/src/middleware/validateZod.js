/**
 * Zod Input Validation Middleware
 * Validates request data (body, query, or params) against a provided Zod schema.
 * Rejects invalid payloads with 400 Bad Request and detailed schema issues.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Request property to validate (default: 'body')
 */
export const validateZod = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed; // Replace with sanitized/coerced data
      next();
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Payload validation failed',
          validation_errors: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        });
      }
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data'
      });
    }
  };
};
