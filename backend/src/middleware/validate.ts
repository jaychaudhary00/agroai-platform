import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ─── Auth schemas ─────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain number'),
    phone: z.string().regex(/^\+?[0-9]{10,13}$/, 'Invalid phone number').optional(),
    role: z.enum(['farmer', 'homegrower', 'seller']).default('farmer'),
    language: z.enum(['en', 'hi', 'gu', 'pa', 'mr']).default('en'),
    state: z.string().max(50).optional(),
    district: z.string().max(50).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password required'),
  }),
});

// ─── Product schemas ──────────────────────────────────────────────────────────
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(200),
    description: z.string().min(20).max(2000),
    category: z.enum(['seeds', 'fertilizers', 'pesticides', 'tools', 'plants', 'soil']),
    price: z.coerce.number().positive('Price must be positive'),
    unit: z.string().min(1).max(20),
    stock: z.coerce.number().int().min(0),
    tags: z.array(z.string()).optional(),
  }),
});

// ─── Order schemas ────────────────────────────────────────────────────────────
export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    })).min(1, 'At least one item required'),
    shippingAddress: z.object({
      name: z.string().min(2),
      phone: z.string().regex(/^\+?[0-9]{10,13}$/),
      address: z.string().min(10),
      city: z.string().min(2),
      state: z.string().min(2),
      pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode'),
    }),
    paymentMethod: z.enum(['cod', 'online']).default('cod'),
  }),
});

// ─── Expense schemas ──────────────────────────────────────────────────────────
export const addExpenseSchema = z.object({
  body: z.object({
    category: z.enum(['tilling','ploughing','seeds','fertilizers','watering','labour','harvesting','pesticides','machinery','other']),
    amount: z.coerce.number().positive('Amount must be positive'),
    description: z.string().max(500).optional(),
    date: z.string().datetime().or(z.string()).optional(),
    season: z.string().max(50).optional(),
    cropType: z.string().max(100).optional(),
  }),
});

// ─── Reminder schemas ─────────────────────────────────────────────────────────
export const createReminderSchema = z.object({
  body: z.object({
    plantName: z.string().min(1).max(100),
    type: z.enum(['watering', 'fertilizing', 'pruning', 'repotting']),
    scheduledAt: z.string().datetime(),
    repeatEvery: z.coerce.number().int().positive().optional(),
    repeatUnit: z.enum(['hours', 'days', 'weeks']).optional(),
    note: z.string().max(500).optional(),
  }),
});

// ─── Fertilizer calculator schema ─────────────────────────────────────────────
export const fertilizerCalcSchema = z.object({
  body: z.object({
    cropType: z.string().min(1).max(100),
    soilType: z.string().min(1).max(100),
    fieldArea: z.coerce.number().positive(),
    fieldAreaUnit: z.enum(['acres', 'hectares', 'bigha']).default('acres'),
    plantAge: z.coerce.number().int().min(0),
  }),
});

// ─── Review schema ────────────────────────────────────────────────────────────
export const createReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().min(10).max(1000),
    productId: z.string().optional(),
    sellerId: z.string().optional(),
  }).refine(data => data.productId || data.sellerId, {
    message: 'Either productId or sellerId is required',
  }),
});

// ─── Validation middleware factory ────────────────────────────────────────────
type ZodSchema = z.ZodObject<any> | z.ZodEffects<any>;

export const validate = (schema: ZodSchema) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    schema.parse({ body: req.body, params: req.params, query: req.query });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.slice(1).join('.')}: ${e.message}`);
      res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
      return;
    }
    next(error);
  }
};
