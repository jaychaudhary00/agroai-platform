import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── User Model ───────────────────────────────────────────────────────────────
export interface IUserDoc extends Document {
  name: string; email: string; password: string; phone?: string;
  role: 'farmer' | 'homegrower' | 'seller' | 'admin';
  language: 'en' | 'hi' | 'gu' | 'pa' | 'mr';
  location?: { state: string; district: string; coordinates?: { lat: number; lng: number } };
  avatar?: string; isVerified: boolean; isActive: boolean;
  fcmToken?: string; refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDoc>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['farmer', 'homegrower', 'seller', 'admin'], default: 'farmer' },
  language: { type: String, enum: ['en', 'hi', 'gu', 'pa', 'mr'], default: 'en' },
  location: { state: String, district: String, coordinates: { lat: Number, lng: Number } },
  avatar: String, isVerified: { type: Boolean, default: false }, isActive: { type: Boolean, default: true },
  fcmToken: String, refreshToken: String,
  passwordResetToken: String,
  passwordResetExpiry: Date,
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};
export const User = mongoose.model<IUserDoc>('User', UserSchema);

// ─── Seller Model ─────────────────────────────────────────────────────────────
const SellerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true, trim: true },
  companyName: { type: String, trim: true },
  businessType: { type: String, required: true },
  gstNumber: { type: String, trim: true },
  panNumber: { type: String, trim: true },
  businessAddress: { type: String, required: true },
  address: { type: String },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  contactPerson: { type: String },
  contactPhone: { type: String },
  isVerified: { type: Boolean, default: false },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  investigationNotes: { type: String },
  verifiedAt: Date,
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  documents: [String],
}, { timestamps: true });
export const Seller = mongoose.model('Seller', SellerSchema);

// ─── Product Model ────────────────────────────────────────────────────────────
const ProductSchema = new Schema({
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  category: { type: String, enum: ['seeds', 'fertilizers', 'pesticides', 'tools', 'plants', 'soil'], required: true },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [String], tags: [String], state: String,
  isApproved: { type: Boolean, default: true }, // approved automatically after seller approval
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 },
}, { timestamps: true });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, state: 1, price: 1, rating: -1 });
export const Product = mongoose.model('Product', ProductSchema);

// ─── Order Model ──────────────────────────────────────────────────────────────
const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  shippingAddress: {
    name: { type: String, required: true }, phone: { type: String, required: true },
    address: { type: String, required: true }, city: { type: String, required: true },
    state: { type: String, required: true }, pincode: { type: String, required: true },
  },
  paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  trackingId: String,
  statusHistory: [{ status: String, timestamp: { type: Date, default: Date.now }, note: String }],
}, { timestamps: true });
export const Order = mongoose.model('Order', OrderSchema);

// ─── Review Model ─────────────────────────────────────────────────────────────
const ReviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1000 },
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true });
export const Review = mongoose.model('Review', ReviewSchema);

// ─── PlantDiseaseReport Model ─────────────────────────────────────────────────
const PlantDiseaseReportSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: String,
  cropType: String,
  diseaseName: String,
  diagnosis: String,
  description: String,
  confidence: Number,
  treatment: String,
  prevention: String,
  fertilizerAdvice: String,
  wateringAdvice: String,
  severity: { type: String, enum: ['low', 'medium', 'high'] },
  isHealthy: { type: Boolean, default: false },
  relatedVideos: [{
    title: String,
    url: String,
    thumbnail: String,
  }],
}, { timestamps: true });
export const PlantDiseaseReport = mongoose.model('PlantDiseaseReport', PlantDiseaseReportSchema);

// ─── Expense Model ────────────────────────────────────────────────────────────
const ExpenseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['tilling','ploughing','seeds','fertilizers','watering','labour','harvesting','pesticides','machinery','other'],
    required: true,
  },
  amount: { type: Number, required: true, min: 0 },
  description: String,
  date: { type: Date, required: true },
  cropType: String,
  season: String,
}, { timestamps: true });
ExpenseSchema.index({ userId: 1, date: -1 });
export const Expense = mongoose.model('Expense', ExpenseSchema);

// ─── CropPrice Model ──────────────────────────────────────────────────────────
const CropPriceSchema = new Schema({
  commodity: { type: String, required: true, index: true },
  variety: String,
  market: { type: String, required: true },
  state: { type: String, required: true, index: true },
  district: String,
  minPrice: Number,
  maxPrice: Number,
  modalPrice: Number,
  unit: { type: String, default: 'quintal' },
  date: { type: Date, required: true, index: true },
  source: { type: String, default: 'agmarknet' },
}, { timestamps: true });
CropPriceSchema.index({ commodity: 1, state: 1, date: -1 });
export const CropPrice = mongoose.model('CropPrice', CropPriceSchema);

// ─── Notification Model ───────────────────────────────────────────────────────
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['order', 'product', 'system', 'weather', 'price', 'disease', 'seller'], default: 'system' },
  data: Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });
NotificationSchema.index({ userId: 1, createdAt: -1 });
export const Notification = mongoose.model('Notification', NotificationSchema);

// ─── Reminder Model ───────────────────────────────────────────────────────────
const ReminderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plantName: { type: String, required: true },  // title → plantName
  type: { type: String, enum: ['watering', 'fertilizing', 'pruning', 'repotting', 'other'], default: 'watering' },
  scheduledAt: { type: Date, required: true },  // dueDate → scheduledAt
  repeatEvery: { type: Number },                // add this
  note: { type: String },                       // description → note
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });
export const Reminder = mongoose.model('Reminder', ReminderSchema);

// ─── ActivityLog Model ────────────────────────────────────────────────────────
const ActivityLogSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetId: Schema.Types.ObjectId,
  targetType: String,
  details: String,
  ip: String,
}, { timestamps: true });
export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
