import { Response, NextFunction } from 'express';
import { Order, Product, Notification } from '../models';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendPushNotification } from '../services/fcm.service';

// ─── POST /api/orders ─────────────────────────────────────────────────────────
export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate stock & compute totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
      if (product.stock < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 400);

      const total = product.price * item.quantity;
      totalAmount += total;
      orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price, total });

      // Decrement stock
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      userId: req.user!._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
    });

    // Create in-app notification
    await Notification.create({
      userId: req.user!._id,
      title: 'Order placed successfully',
      body: `Order #${order._id.toString().slice(-8).toUpperCase()} for ₹${totalAmount} confirmed.`,
      type: 'order',
      data: { orderId: order._id },
    });

    // Send FCM push notification
    await sendPushNotification(req.user!._id, {
      title: '🛍️ Order Confirmed',
      body: `Your order of ₹${totalAmount} has been placed!`,
      data: { type: 'order', orderId: order._id.toString() },
    });

    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders ──────────────────────────────────────────────────────────
export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user!._id })
        .populate('items.productId', 'name images price')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments({ userId: req.user!._id }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
export const getOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user!._id })
      .populate('items.productId', 'name images price unit');
    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/orders/:id/status (admin/seller) ─────────────────────────────
export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note, trackingId } = req.body;
    const order = await Order.findById(req.params.id).populate('userId', 'name fcmToken');
    if (!order) throw new AppError('Order not found', 404);

    order.status = status;
    if (trackingId) order.trackingId = trackingId;
    order.statusHistory.push({ status, timestamp: new Date().toISOString(), note });
    await order.save();

    // Notify buyer
    const buyer = order.userId as any;
    await Notification.create({
      userId: buyer._id,
      title: `Order ${status}`,
      body: `Your order #${order._id.toString().slice(-8).toUpperCase()} is now ${status}.`,
      type: 'order',
      data: { orderId: order._id },
    });

    await sendPushNotification(buyer._id.toString(), {
      title: `📦 Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      body: `Your order has been ${status}. ${note || ''}`,
      data: { type: 'order', orderId: order._id.toString() },
    });

    res.json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (err) {
    next(err);
  }
};
