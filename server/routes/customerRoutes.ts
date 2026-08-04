import { Router } from 'express';
import { getCustomers, getCustomerByEmail, updateCustomer } from '../controllers/customerController.js';
import { requireAuth, requireSellerOrAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireSellerOrAdmin, getCustomers);
router.get('/:email', requireAuth, requireSellerOrAdmin, getCustomerByEmail);
router.put('/:email', requireAuth, requireSellerOrAdmin, updateCustomer);

export default router;
