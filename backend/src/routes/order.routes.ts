import { Router } from 'express';
import { createOrder, getMyOrders, getOrder, updateOrderStatus } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrder);
router.patch('/:id/status', authenticate, authorize('admin', 'seller'), updateOrderStatus);

export default router;
