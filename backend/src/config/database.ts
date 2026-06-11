import mongoose from 'mongoose';
import { logger } from './logger';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables');

  try {
    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'agroai',
    });
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
};
