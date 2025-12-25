class AppError extends Error {
  constructor(message, status, skipLogging = false) {
    super(message);
    this.status = status; // Previous buggy code uses this.code, resulting status code reset to 500 for all errors.
    this.name = this.constructor.name;
    this.skipLogging = skipLogging;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, skipLogging = false) {
    super(message, 400, skipLogging);
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class InternalServerError extends AppError {
  constructor(message) {
    super(message, 500);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
};
