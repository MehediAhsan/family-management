import { Router } from 'express';
import { createEntry, deleteEntry, listEntries, updateEntry } from '../controllers/diaryController.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
router.get('/', asyncHandler(listEntries));
router.post('/', asyncHandler(createEntry));
router.put('/:id', asyncHandler(updateEntry));
router.delete('/:id', asyncHandler(deleteEntry));
export default router;
