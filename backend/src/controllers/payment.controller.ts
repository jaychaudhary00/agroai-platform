import { Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Order, Product, Notification } from '../models';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendPushNotification } from '../services/fcm.service';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST /api/payments/create-order
export const createPaymentOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items, shippingAddress } = req.body;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
      if (product.stock < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 400);
      const total = product.price * item.quantity;
      totalAmount += total;
      orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price, total });
    }

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: req.user!._id.toString() },
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        items: orderItems,
        shippingAddress,
      },
    });
  } catch (err) { next(err); }
};

// POST /api/payments/verify
export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, items, shippingAddress, totalAmount } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new AppError('Payment verification failed. Invalid signature.', 400);
    }

    // Deduct stock and create order
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new AppError(`Product not found`, 404);
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity, totalSold: item.quantity } });
      orderItems.push({ productId: item.productId, quantity: item.quantity, price: item.price, total: item.total });
    }

    const order = await Order.create({
      userId: req.user!._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      razorpayOrderId,
      razorpayPaymentId,
      statusHistory: [{ status: 'confirmed', timestamp: new Date(), note: 'Payment verified' }],
      status: 'confirmed',
    });

    await Notification.create({
      userId: req.user!._id,
      title: 'Payment Successful',
      body: `Order #${order._id.toString().slice(-8).toUpperCase()} confirmed. ₹${totalAmount} paid.`,
      type: 'order',
      data: { orderId: order._id },
    });

    await sendPushNotification(req.user!._id.toString(), {
      title: '✅ Payment Confirmed',
      body: `₹${totalAmount} paid successfully. Order confirmed!`,
      data: { type: 'order', orderId: order._id.toString() },
    });

    res.status(201).json({ success: true, message: 'Payment verified and order created', data: order });
  } catch (err) { next(err); }
};
