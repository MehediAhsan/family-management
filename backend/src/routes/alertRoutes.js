import { Router } from 'express';
import { createAlert, listAlerts, resolveAlert } from '../controllers/alertController.js';
import { authorizeRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
router.get('/', asyncHandler(listAlerts));
router.post('/', authorizeRoles('ADMIN'), asyncHandler(createAlert));
router.patch('/:id/resolve', authorizeRoles('ADMIN'), asyncHandler(resolveAlert));
export default router;
