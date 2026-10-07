import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register } from '../controllers/authController.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Try again later.' } },
});

router.post('/register', authLimiter, asyncHandler(register));
router.post('/login', authLimiter, asyncHandler(login));

export default router;
