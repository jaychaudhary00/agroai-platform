import { Router } from 'express';
import { Reminder } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user!._id }).sort({ scheduledAt: 1 });
    res.json({ success: true, data: reminders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const reminder = await Reminder.create({ ...req.body, userId: req.user!._id });
    res.status(201).json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/:id/complete', authenticate, async (req: AuthRequest, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { isCompleted: true },
      { new: true }
    );
    res.json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
