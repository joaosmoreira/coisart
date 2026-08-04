import { Router } from 'express';
import { getEvent, updateEvent } from '../controllers/eventController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getEvent);
router.put('/', requireAuth, requireAdmin, updateEvent);

export default router;
