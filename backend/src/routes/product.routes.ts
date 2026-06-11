import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadProductImages } from '../config/cloudinary';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, authorize('seller'), uploadProductImages.array('images', 5), createProduct);
router.put('/:id', authenticate, authorize('seller'), uploadProductImages.array('images', 5), updateProduct);
router.delete('/:id', authenticate, authorize('seller', 'admin'), deleteProduct);

export default router;
