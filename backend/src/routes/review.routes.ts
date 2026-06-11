import { Router } from 'express';
import { Review, Product } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const review = await Review.create({ ...req.body, userId: req.user!._id });
    if (req.body.productId) {
      const stats = await Review.aggregate([
        { $match: { productId: review.productId } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (stats.length) {
        await Product.findByIdAndUpdate(req.body.productId, { rating: stats[0].avg, totalReviews: stats[0].count });
      }
    }
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name avatar').sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
