import { Router } from 'express';
import { Notification } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user!._id }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/mark-all-read', authenticate, async (req: AuthRequest, res) => {
  try {
    await Notification.updateMany({ userId: req.user!._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
