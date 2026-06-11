import { Router } from 'express';
import { User } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadAvatar } from '../config/cloudinary';

const router = Router();

router.patch('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, phone, language, state, district } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { name, phone, language, 'location.state': state, 'location.district': district },
      { new: true }
    );
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/avatar', authenticate, uploadAvatar.single('avatar'), async (req: AuthRequest, res) => {
  try {
    const avatarUrl = (req.file as any)?.path;
    await User.findByIdAndUpdate(req.user!._id, { avatar: avatarUrl });
    res.json({ success: true, data: { avatar: avatarUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/fcm-token', authenticate, async (req: AuthRequest, res) => {
  try {
    await User.findByIdAndUpdate(req.user!._id, { fcmToken: req.body.token });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
