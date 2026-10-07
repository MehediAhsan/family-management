import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { HttpError } from '../utils/http.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  return secret;
};

export const authenticate = async (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authentication is required.', 'UNAUTHENTICATED'));
  }

  try {
    const tokenUser = jwt.verify(authorization.slice(7), getJwtSecret(), {
      issuer: 'family-management-system',
    });
    const result = await db.query(
      'SELECT id, role, household_id FROM users WHERE id = $1',
      [tokenUser.sub],
    );
    if (!result.rowCount) {
      return next(new HttpError(401, 'Your account is no longer available.', 'INVALID_TOKEN'));
    }
    req.user = {
      sub: result.rows[0].id,
      role: result.rows[0].role,
      householdId: result.rows[0].household_id,
    };
    return next();
  } catch (error) {
    if (error instanceof HttpError) return next(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new HttpError(401, 'Your session is invalid or has expired.', 'INVALID_TOKEN'));
    }
    return next(error);
  }
};

export const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpError(403, 'You do not have permission to perform this action.', 'FORBIDDEN'));
  }
  return next();
};

export { getJwtSecret };
