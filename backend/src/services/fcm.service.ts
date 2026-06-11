import admin from 'firebase-admin';
import { User } from '../models';
import { logger } from '../config/logger';

let initialized = false;

const initFirebase = () => {
  if (initialized || !process.env.FIREBASE_SERVICE_ACCOUNT) return;
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    initialized = true;
    logger.info('Firebase Admin initialized');
  } catch (err) {
    logger.error('Firebase init failed:', err);
  }
};

//initFirebase();

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export const sendPushNotification = async (userId: string, payload: PushPayload): Promise<boolean> => {
  try {
    if (!initialized) return false;
    const user = await User.findById(userId).select('fcmToken');
    if (!user?.fcmToken) return false;

    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data,
      android: { priority: 'high' },
      apns: { payload: { aps: { badge: 1 } } },
    });

    return true;
  } catch (err) {
    logger.error('Push notification failed:', err);
    return false;
  }
};

export const sendBulkNotification = async (userIds: string[], payload: PushPayload): Promise<void> => {
  if (!initialized) return;
  const users = await User.find({ _id: { $in: userIds }, fcmToken: { $exists: true } }).select('fcmToken');
  const tokens = users.map((u) => u.fcmToken!).filter(Boolean);
  if (!tokens.length) return;

  const messages = tokens.map((token) => ({
    token,
    notification: { title: payload.title, body: payload.body },
    data: payload.data,
  }));

  await admin.messaging().sendEach(messages);
};
