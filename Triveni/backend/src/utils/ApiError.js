/**
 * Typed application error. Thrown from services/controllers and caught by the
 * centralized error handler middleware, which maps it to a consistent JSON response.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isApiError = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }
  static conflict(message, errors = []) {
    return new ApiError(409, message, errors);
  }
  static unprocessable(message, errors = []) {
    return new ApiError(422, message, errors);
  }
  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
