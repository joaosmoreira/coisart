import { Router } from 'express';
import { getSellers, getSellerBySlug, createSeller, updateSeller } from '../controllers/sellerController.js';
import { requireAuth, requireAdmin, requireSellerOrAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getSellers);
router.get('/:slug', getSellerBySlug);
router.post('/', requireAuth, requireAdmin, createSeller);
router.put('/:id', requireAuth, requireSellerOrAdmin, updateSeller);

export default router;
