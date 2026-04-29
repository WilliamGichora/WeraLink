/**
 * AppError
 * Custom error class for operational errors that we expect might happen.
 */
export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Convenience wrapper for API success responses
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Consistent error response for catch blocks if not using next(err)
 */
export const errorResponse = (res, error, statusCode = 400) => {
  const code = error.code || 'BAD_REQUEST';
  const message = error.message || 'An unexpected error occurred';

  // Log in dev
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[API Error] ${code}: ${message}`, error);
  }

  return res.status(statusCode).json({
    success: false,
    data: null,
    meta: null,
    errors: [{
      code,
      message
    }]
  });
};
