import { Router } from 'express';
import { Seller, Product, Order } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadProductImages } from '../config/cloudinary';

const router = Router();

// Register seller (user must already have seller role)
router.post('/register', authenticate, async (req: AuthRequest, res) => {
  try {
    const existing = await Seller.findOne({ userId: req.user!._id });
    if (existing) { res.status(409).json({ success: false, message: 'Seller profile already exists' }); return; }
    const { businessName, companyName, businessType, gstNumber, panNumber, businessAddress, state, pincode, contactPerson, contactPhone } = req.body;
    const seller = await Seller.create({
      userId: req.user!._id,
      businessName: businessName || companyName,
      companyName,
      businessType,
      gstNumber,
      panNumber,
      businessAddress: businessAddress,
      address: businessAddress,
      state, pincode,
      contactPerson,
      contactPhone,
      approvalStatus: 'pending',
    });
    res.status(201).json({ success: true, data: seller });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get own seller profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user!._id }).populate('userId', 'name email phone');
    res.json({ success: true, data: seller });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Get seller's own products
router.get('/my-products', authenticate, authorize('seller'), async (req: AuthRequest, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user!._id });
    if (!seller || seller.approvalStatus !== 'approved') {
      res.status(403).json({ success: false, message: 'Seller not approved yet' }); return;
    }
    const products = await Product.find({ sellerId: seller._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Add product (approved sellers only)
router.post('/products', authenticate, authorize('seller'), uploadProductImages.array('images', 4), async (req: AuthRequest, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user!._id });
    if (!seller || seller.approvalStatus !== 'approved') {
      res.status(403).json({ success: false, message: 'Seller account not approved' }); return;
    }
    const images = (req.files as Express.Multer.File[])?.map((f: any) => f.path) || [];
    const product = await Product.create({ ...req.body, sellerId: seller._id, isApproved: true, images });
    res.status(201).json({ success: true, data: product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Edit product
router.put('/products/:id', authenticate, authorize('seller'), uploadProductImages.array('images', 4), async (req: AuthRequest, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user!._id });
    if (!seller) { res.status(404).json({ success: false, message: 'Seller not found' }); return; }
    const newImages = (req.files as Express.Multer.File[])?.map((f: any) => f.path);
    const updateData = { ...req.body };
    if (newImages && newImages.length > 0) updateData.images = newImages;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: seller._id },
      updateData, { new: true }
    );
    if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
    res.json({ success: true, data: product });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Delete product
router.delete('/products/:id', authenticate, authorize('seller'), async (req: AuthRequest, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user!._id });
    if (!seller) { res.status(404).json({ success: false, message: 'Seller not found' }); return; }
    await Product.findOneAndDelete({ _id: req.params.id, sellerId: seller._id });
    res.json({ success: true, message: 'Product deleted' });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Get seller's incoming orders
router.get('/orders', authenticate, authorize('seller'), async (req: AuthRequest, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user!._id });
    if (!seller) { res.status(404).json({ success: false, message: 'Seller not found' }); return; }
    const products = await Product.find({ sellerId: seller._id }).select('_id');
    const productIds = products.map(p => p._id);
    const orders = await Order.find({ 'items.productId': { $in: productIds } })
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name price images')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Seller revenue analytics
router.get('/analytics', authenticate, authorize('seller'), async (req: AuthRequest, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user!._id });
    if (!seller) { res.status(404).json({ success: false, message: 'Seller not found' }); return; }
    const products = await Product.find({ sellerId: seller._id }).select('_id name totalSold price');
    const productIds = products.map(p => p._id);
    const revenueData = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.productId': { $in: productIds }, status: { $in: ['confirmed', 'delivered'] } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$items.total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);
    const totalRevenue = revenueData.reduce((s: number, m: any) => s + m.revenue, 0);
    res.json({ success: true, data: { revenueData, totalRevenue, products, productCount: products.length } });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

export default router;
