import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { requireAuth, requireSellerOrAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', requireAuth, requireSellerOrAdmin, createProduct);
router.put('/:id', requireAuth, requireSellerOrAdmin, updateProduct);
router.delete('/:id', requireAuth, requireSellerOrAdmin, deleteProduct);

export default router;
