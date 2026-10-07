export class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const requireString = (value, field, { min = 1, max = 5000 } = {}) => {
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} is required.`, 'VALIDATION_ERROR');
  }
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new HttpError(400, `${field} must be between ${min} and ${max} characters.`, 'VALIDATION_ERROR');
  }
  return normalized;
};

export const requireUuid = (value, field = 'ID') => {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new HttpError(400, `${field} is invalid.`, 'VALIDATION_ERROR');
  }
  return value;
};
