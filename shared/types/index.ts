// ─── Shared TypeScript Interfaces ───────────────────────────────────────────
// Used by both frontend and backend for type safety across the monorepo

export type UserRole = 'farmer' | 'homegrower' | 'seller' | 'admin';
export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type ProductCategory = 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'plants' | 'soil';
export type ReminderType = 'watering' | 'fertilizing' | 'pruning' | 'repotting';

// ─── User ────────────────────────────────────────────────────────────────────
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  language: 'en' | 'hi' | 'gu' | 'pa' | 'mr';
  location?: {
    state: string;
    district: string;
    coordinates?: { lat: number; lng: number };
  };
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Seller ──────────────────────────────────────────────────────────────────
export interface ISeller {
  _id: string;
  userId: string;
  user?: IUser;
  businessName: string;
  businessType: string;
  gstNumber?: string;
  address: string;
  state: string;
  pincode: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  rating: number;
  totalReviews: number;
  totalSales: number;
  documents: string[];
  createdAt: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────
export interface IProduct {
  _id: string;
  sellerId: string;
  seller?: ISeller;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  tags: string[];
  state: string;
  isApproved: boolean;
  isActive: boolean;
  rating: number;
  totalReviews: number;
  totalSold: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export interface IOrderItem {
  productId: string;
  product?: IProduct;
  quantity: number;
  price: number;
  total: number;
}

export interface IOrder {
  _id: string;
  userId: string;
  user?: IUser;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  trackingId?: string;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
  createdAt: string;
  updatedAt: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface IReview {
  _id: string;
  userId: string;
  user?: IUser;
  productId?: string;
  sellerId?: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

// ─── Plant Disease Report ─────────────────────────────────────────────────────
export interface IPlantDiseaseReport {
  _id: string;
  userId: string;
  imageUrl: string;
  diseaseName: string;
  confidence: number;
  description: string;
  treatment: string;
  prevention: string;
  fertilizerAdvice: string;
  wateringAdvice: string;
  relatedVideos: { title: string; url: string; thumbnail: string }[];
  cropType?: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
}

// ─── Expense ─────────────────────────────────────────────────────────────────
export type ExpenseCategory =
  | 'tilling' | 'ploughing' | 'seeds' | 'fertilizers'
  | 'watering' | 'labour' | 'harvesting' | 'pesticides'
  | 'machinery' | 'other';

export interface IExpense {
  _id: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  date: string;
  season?: string;
  cropType?: string;
  createdAt: string;
}

// ─── Crop Price ───────────────────────────────────────────────────────────────
export interface ICropPrice {
  _id: string;
  cropName: string;
  state: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  date: string;
  source: string;
  createdAt: string;
}

// ─── Reminder ────────────────────────────────────────────────────────────────
export interface IReminder {
  _id: string;
  userId: string;
  plantName: string;
  plantId?: string;
  type: ReminderType;
  scheduledAt: string;
  repeatEvery?: number;
  repeatUnit?: 'hours' | 'days' | 'weeks';
  note?: string;
  isCompleted: boolean;
  notificationSent: boolean;
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface INotification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: 'order' | 'disease' | 'reminder' | 'price' | 'system';
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  language?: string;
  state?: string;
  district?: string;
}

export interface AuthResponse {
  user: IUser;
  token: string;
  refreshToken: string;
}

// ─── AI Feature Types ─────────────────────────────────────────────────────────
export interface FertilizerCalculatorInput {
  cropType: string;
  soilType: string;
  fieldArea: number;
  fieldAreaUnit: 'acres' | 'hectares' | 'bigha';
  plantAge: number;
}

export interface FertilizerRecommendation {
  nitrogen: { amount: number; unit: string; product: string };
  phosphorus: { amount: number; unit: string; product: string };
  potassium: { amount: number; unit: string; product: string };
  applicationSchedule: string[];
  estimatedCost: number;
  notes: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  forecast: {
    date: string;
    condition: string;
    maxTemp: number;
    minTemp: number;
    rainProbability: number;
  }[];
  alerts: string[];
}
