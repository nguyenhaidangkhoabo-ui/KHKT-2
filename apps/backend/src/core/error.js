export const HttpStatus = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
});

export const ErrorCode = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  // ---- Module Diploma ----
  DIPLOMA_NOT_STORED: 'DIPLOMA_NOT_STORED',
  DIPLOMA_ALREADY_HANDED_OVER: 'DIPLOMA_ALREADY_HANDED_OVER',
  DIPLOMA_ALREADY_EXISTS: 'DIPLOMA_ALREADY_EXISTS',
  CAPACITY_FULL: 'CAPACITY_FULL',
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  SCHEDULE_CONFLICT: 'SCHEDULE_CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
});

export class AppError extends Error {
  constructor(message, statusCode = HttpStatus.INTERNAL_SERVER_ERROR, code = ErrorCode.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const createError = (message, statusCode = HttpStatus.INTERNAL_SERVER_ERROR, code = ErrorCode.INTERNAL_SERVER_ERROR) => {
  return new AppError(message, statusCode, code);
};

export default {
  HttpStatus,
  ErrorCode,
  AppError,
  createError,
};
