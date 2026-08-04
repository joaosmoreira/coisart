import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getCategories);
router.post('/', requireAuth, requireAdmin, createCategory);

export default router;
