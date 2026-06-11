import { Router } from 'express';
import { User, Seller, Product, Order, ActivityLog } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { sendSellerApprovalEmail } from '../services/email.service';

const router = Router();
const isAdmin = [authenticate, authorize('admin')];

// Stats
router.get('/stats', ...isAdmin, async (_req, res) => {
  try {
    const [users, sellers, pendingSellers, products, orders] = await Promise.all([
      User.countDocuments(),
      Seller.countDocuments({ approvalStatus: 'approved' }),
      Seller.countDocuments({ approvalStatus: 'pending' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
    ]);
    const revenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    res.json({ success: true, data: { users, sellers, pendingSellers, products, orders, revenue: revenue[0]?.total || 0 } });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Pending sellers list
router.get('/sellers/pending', ...isAdmin, async (_req, res) => {
  try {
    const sellers = await Seller.find({ approvalStatus: 'pending' })
      .populate('userId', 'name email phone createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: sellers });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// All sellers
router.get('/sellers', ...isAdmin, async (_req, res) => {
  try {
    const sellers = await Seller.find()
      .populate('userId', 'name email phone createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: sellers });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Get single seller detail for investigation
router.get('/sellers/:id', ...isAdmin, async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).populate('userId', 'name email phone createdAt location');
    if (!seller) { res.status(404).json({ success: false, message: 'Seller not found' }); return; }
    res.json({ success: true, data: seller });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Update investigation notes
router.patch('/sellers/:id/notes', ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { investigationNotes: req.body.notes },
      { new: true }
    ).populate('userId', 'name email');
    await ActivityLog.create({
      adminId: req.user!._id,
      action: 'investigation_note_updated',
      targetId: seller!._id,
      targetType: 'Seller',
      details: req.body.notes?.substring(0, 100),
    });
    res.json({ success: true, data: seller });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Approve seller
router.patch('/sellers/:id/approve', ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'approved', isVerified: true, verifiedAt: new Date(), verifiedBy: req.user!._id },
      { new: true }
    ).populate('userId', 'name email');

    if (!seller) { res.status(404).json({ success: false, message: 'Seller not found' }); return; }

    const user = seller.userId as any;
    await sendSellerApprovalEmail(user.email, user.name, seller.businessName, 'approved', '');

    await ActivityLog.create({
      adminId: req.user!._id,
      action: 'seller_approved',
      targetId: seller._id,
      targetType: 'Seller',
      details: `Approved seller: ${seller.businessName}`,
    });

    res.json({ success: true, data: seller });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Reject seller
router.patch('/sellers/:id/reject', ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const { reason } = req.body;
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'rejected', isVerified: false, rejectionReason: reason },
      { new: true }
    ).populate('userId', 'name email');

    if (!seller) { res.status(404).json({ success: false, message: 'Seller not found' }); return; }

    const user = seller.userId as any;
    await sendSellerApprovalEmail(user.email, user.name, seller.businessName, 'rejected', reason);

    await ActivityLog.create({
      adminId: req.user!._id,
      action: 'seller_rejected',
      targetId: seller._id,
      targetType: 'Seller',
      details: `Rejected: ${reason}`,
    });

    res.json({ success: true, data: seller });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Users management
router.get('/users', ...isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit);
    const total = await User.countDocuments({ role: { $ne: 'admin' } });
    res.json({ success: true, data: users, pagination: { page, limit, total } });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.patch('/users/:id/toggle', ...isAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    user.isActive = !user.isActive;
    await user.save();
    await ActivityLog.create({ adminId: req.user!._id, action: user.isActive ? 'user_activated' : 'user_deactivated', targetId: user._id, targetType: 'User' });
    res.json({ success: true, data: user });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Activity logs
router.get('/activity-logs', ...isAdmin, async (_req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: logs });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Revenue analytics
router.get('/analytics/revenue', ...isAdmin, async (_req, res) => {
  try {
    const monthly = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'confirmed'] } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);
    res.json({ success: true, data: monthly });
  } catch { res.status(500).json({ success: false, message: 'Server error' }); }
});

export default router;
