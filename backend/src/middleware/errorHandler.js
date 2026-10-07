import { HttpError } from '../utils/http.js';

export const notFoundHandler = (_req, _res, next) => {
  next(new HttpError(404, 'The requested resource was not found.', 'NOT_FOUND'));
};

export const errorHandler = (error, _req, res, _next) => {
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) {
    console.error('Request failed:', error);
  }
  res.status(status).json({
    error: {
      code: error.code ?? 'INTERNAL_SERVER_ERROR',
      message: status >= 500 && process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred.'
        : error.message,
    },
  });
};
