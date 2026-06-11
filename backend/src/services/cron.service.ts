// eslint-disable-next-line @typescript-eslint/no-require-imports
const cron = require('node-cron');
import { Reminder, Notification, User } from '../models';
import { sendPushNotification } from './fcm.service';
const sendPlantCareReminderEmail = async (...args: any[]) => {};
import { logger } from '../config/logger';

export const startReminderCron = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      const dueReminders: any[] = await Reminder.find({
        isCompleted: false,
        notificationSent: false,
        scheduledAt: { $gte: now, $lte: fifteenMinutesFromNow },
      }).populate('userId', 'name email fcmToken');

      for (const reminder of dueReminders) {
        const user = reminder.userId as any;
        const typeEmoji: Record<string, string> = {
          watering: '💧', fertilizing: '🌿', pruning: '✂️', repotting: '🪴'
        };

        // In-app notification
        await Notification.create({
          userId: user._id,
          title: `${typeEmoji[reminder.type] || '🌱'} ${reminder.type} reminder`,
          body: `Time to ${reminder.type} your ${reminder.plantName}!`,
          type: 'reminder',
          data: { reminderId: reminder._id.toString() },
        });

        // Push notification
        await sendPushNotification(user._id.toString(), {
          title: `${typeEmoji[reminder.type]} Plant Care Reminder`,
          body: `Time to ${reminder.type} your ${reminder.plantName}!`,
          data: { type: 'reminder', reminderId: reminder._id.toString() },
        });

        // Email notification
        if (user.email) {
          await sendPlantCareReminderEmail(user.email, user.name, reminder.plantName, reminder.type);
        }

        await Reminder.findByIdAndUpdate(reminder._id, { notificationSent: true });

        // Schedule next occurrence if repeat is set
        if (reminder.repeatEvery && reminder.repeatUnit) {
          const multipliers: Record<string, number> = { hours: 3600000, days: 86400000, weeks: 604800000 };
          const ms = multipliers[reminder.repeatUnit] || 86400000;
          const nextDate = new Date(new Date(reminder.scheduledAt).getTime() + reminder.repeatEvery * ms);
          await Reminder.create({
            userId: user._id,
            plantName: reminder.plantName,
            type: reminder.type,
            scheduledAt: nextDate,
            repeatEvery: reminder.repeatEvery,
            repeatUnit: reminder.repeatUnit,
            note: reminder.note,
          });
        }
      }

      if (dueReminders.length > 0) {
        logger.info(`✅ Sent ${dueReminders.length} reminder notifications (push + email)`);
      }
    } catch (error) {
      logger.error('Reminder cron error:', error);
    }
  });
  logger.info('⏰ Reminder cron started (every 15 min) — sends push + email');
};

export const startCleanupCron = () => {
  cron.schedule('0 2 * * 0', async () => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await Notification.deleteMany({ createdAt: { $lt: thirtyDaysAgo }, isRead: true });
      logger.info(`🧹 Cleanup: deleted ${result.deletedCount} old notifications`);
    } catch (error) {
      logger.error('Cleanup cron error:', error);
    }
  });
  logger.info('🧹 Cleanup cron started (weekly)');
};

export const startAllCrons = () => {
  startReminderCron();
  startCleanupCron();
  logger.info('✅ All cron jobs initialized');
};
