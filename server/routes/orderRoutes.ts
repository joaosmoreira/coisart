import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController.js';
import { requireAuth, requireSellerOrAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', createOrder);
router.get('/', requireAuth, requireSellerOrAdmin, getOrders);
router.put('/:id/status', requireAuth, requireSellerOrAdmin, updateOrderStatus);

export default router;
