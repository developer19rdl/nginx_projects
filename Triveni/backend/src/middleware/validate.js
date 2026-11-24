const ApiError = require('../utils/ApiError');

/**
 * Validates req[part] (default 'body') against a Zod schema. On failure throws
 * a 422 ApiError with a flat list of { field, message } so the frontend can
 * highlight the offending inputs.
 */
function validate(schema, part = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(ApiError.unprocessable('Validation failed', errors));
    }
    req[part] = result.data;
    next();
  };
}

module.exports = validate;
