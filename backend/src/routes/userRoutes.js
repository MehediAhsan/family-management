import { Router } from 'express';
import { getProfile, listHouseholdUsers, updateProfile, updateUserRole } from '../controllers/userController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
router.use(authenticate);
router.get('/', asyncHandler(listHouseholdUsers));
router.get('/me', asyncHandler(getProfile));
router.put('/me', asyncHandler(updateProfile));
router.patch('/:id/role', authorizeRoles('ADMIN'), asyncHandler(updateUserRole));
export default router;
