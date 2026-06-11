import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Seller, Product, CropPrice, Expense } from '../models';

dotenv.config();

const DEMO_USERS = [
  {
    name: 'Admin User',
    email: 'admin@agree.com',
    password: 'jay@1234',
    role: 'admin',
    language: 'en',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Ramesh Kumar',
    email: 'farmer@demo.com',
    password: 'demo1234',
    role: 'farmer',
    language: 'hi',
    location: { state: 'Gujarat', district: 'Anand' },
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Priya Sharma',
    email: 'grower@demo.com',
    password: 'demo1234',
    role: 'homegrower',
    language: 'en',
    location: { state: 'Maharashtra', district: 'Pune' },
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Vikram Patel',
    email: 'seller@demo.com',
    password: 'demo1234',
    role: 'seller',
    language: 'gu',
    location: { state: 'Gujarat', district: 'Surat' },
    isVerified: true,
    isActive: true,
  },
];

const DEMO_CROP_PRICES = [
  { cropName: 'Wheat', state: 'Gujarat', market: 'Anand APMC', minPrice: 2180, maxPrice: 2340, modalPrice: 2260 },
  { cropName: 'Cotton', state: 'Gujarat', market: 'Rajkot APMC', minPrice: 6500, maxPrice: 7100, modalPrice: 6800 },
  { cropName: 'Soybean', state: 'Gujarat', market: 'Anand APMC', minPrice: 4200, maxPrice: 4650, modalPrice: 4430 },
  { cropName: 'Groundnut', state: 'Gujarat', market: 'Junagadh APMC', minPrice: 5100, maxPrice: 5800, modalPrice: 5450 },
  { cropName: 'Castor seed', state: 'Gujarat', market: 'Anand APMC', minPrice: 5900, maxPrice: 6400, modalPrice: 6150 },
  { cropName: 'Bajra', state: 'Gujarat', market: 'Surat APMC', minPrice: 2050, maxPrice: 2180, modalPrice: 2115 },
  { cropName: 'Cumin', state: 'Gujarat', market: 'Unjha APMC', minPrice: 18000, maxPrice: 21500, modalPrice: 19750 },
  { cropName: 'Maize', state: 'Gujarat', market: 'Anand APMC', minPrice: 1890, maxPrice: 2050, modalPrice: 1970 },
  { cropName: 'Rice', state: 'Punjab', market: 'Amritsar', minPrice: 2100, maxPrice: 2300, modalPrice: 2200 },
  { cropName: 'Wheat', state: 'Punjab', market: 'Ludhiana', minPrice: 2190, maxPrice: 2350, modalPrice: 2270 },
  { cropName: 'Onion', state: 'Maharashtra', market: 'Nashik APMC', minPrice: 800, maxPrice: 1400, modalPrice: 1100 },
  { cropName: 'Tomato', state: 'Maharashtra', market: 'Pune APMC', minPrice: 600, maxPrice: 1800, modalPrice: 1200 },
  { cropName: 'Rice', state: 'Gujarat', market: 'Surat APMC', minPrice: 2200, maxPrice: 2500, modalPrice: 2350 },
  { cropName: 'Mustard', state: 'Rajasthan', market: 'Jaipur APMC', minPrice: 4800, maxPrice: 5200, modalPrice: 5000 },
  { cropName: 'Jowar', state: 'Maharashtra', market: 'Aurangabad APMC', minPrice: 2100, maxPrice: 2400, modalPrice: 2250 },
  { cropName: 'Turmeric', state: 'Maharashtra', market: 'Sangli APMC', minPrice: 7000, maxPrice: 9000, modalPrice: 8000 },
  { cropName: 'Chilli', state: 'Andhra Pradesh', market: 'Guntur APMC', minPrice: 8000, maxPrice: 14000, modalPrice: 11000 },
  { cropName: 'Garlic', state: 'Madhya Pradesh', market: 'Mandsaur APMC', minPrice: 3000, maxPrice: 6000, modalPrice: 4500 },
  { cropName: 'Potato', state: 'Uttar Pradesh', market: 'Agra APMC', minPrice: 700, maxPrice: 1200, modalPrice: 950 },
  { cropName: 'Sugarcane', state: 'Uttar Pradesh', market: 'Lucknow APMC', minPrice: 350, maxPrice: 400, modalPrice: 375 },
];

const DEMO_PRODUCTS = [
  { name: 'Hybrid BT Cotton Seeds (Premium)', description: 'High yield hybrid BT cotton seeds. 90%+ germination rate. Bollworm resistant. Suitable for Gujarat black soil.', category: 'seeds', price: 1200, unit: 'kg', stock: 500, tags: ['cotton', 'hybrid', 'bt'] },
  { name: 'Neem-based Organic Pesticide', description: '100% organic neem oil pesticide. Safe for crops. Controls aphids, whiteflies, and bollworms.', category: 'pesticides', price: 450, unit: 'litre', stock: 200, tags: ['organic', 'neem'] },
  { name: 'NPK 19:19:19 Water Soluble Fertilizer', description: 'Balanced NPK fertilizer. Fully water soluble for fertigation. Boosts vegetative growth.', category: 'fertilizers', price: 1100, unit: '50kg bag', stock: 300, tags: ['npk', 'fertilizer'] },
  { name: 'Premium Wheat Seeds HD-3086', description: 'IARI recommended high yielding wheat variety. Rust resistant. Avg yield 55-60 qtl/hectare.', category: 'seeds', price: 680, unit: 'kg', stock: 1000, tags: ['wheat', 'iari'] },
  { name: 'Drip Irrigation Kit (1 Acre)', description: 'Complete drip irrigation set for 1 acre. Includes mainline pipe, drip laterals, emitters, filters.', category: 'tools', price: 3800, unit: 'set', stock: 50, tags: ['drip', 'irrigation'] },
  { name: 'Cocopeat Growing Medium (5kg)', description: 'Premium cocopeat for home gardening. Excellent water retention. pH neutral.', category: 'soil', price: 250, unit: '5kg bag', stock: 800, tags: ['cocopeat', 'organic'] },
];

const seed = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set in .env'); process.exit(1); }

  await mongoose.connect(uri, { dbName: process.env.DB_NAME || 'agroai' });
  console.log('✅ Connected to MongoDB');

  // Clear existing demo data
  const emails = DEMO_USERS.map(u => u.email);
  await User.deleteMany({ email: { $in: emails } });
  await CropPrice.deleteMany({});
  console.log('🧹 Cleared old demo data');

  // Create demo users one by one (triggers password hashing middleware)
  const createdUsers: any[] = [];
  for (const userData of DEMO_USERS) {
    const user = new User(userData);
    await user.save();
    createdUsers.push(user);
    console.log(`✅ Created user: ${userData.email} (${userData.role})`);
  }

  // Create seller profile for Vikram
  const sellerUser = createdUsers.find(u => u.role === 'seller');
  if (sellerUser) {
    const seller = await Seller.findOneAndUpdate(
      { userId: sellerUser._id },
      {
        userId: sellerUser._id,
        businessName: 'Patel Agri Solutions',
        businessType: 'Agricultural inputs & equipment',
        gstNumber: '24ABCDE1234F1Z5',
        address: '14, Ring Road, Surat',
        state: 'Gujarat',
        pincode: '395003',
        isVerified: true,
        verifiedAt: new Date(),
        rating: 4.5,
        totalReviews: 89,
      },
      { upsert: true, new: true }
    );

    for (const productData of DEMO_PRODUCTS) {
      await Product.findOneAndUpdate(
        { name: productData.name, sellerId: seller._id },
        { ...productData, sellerId: seller._id, state: 'Gujarat', isApproved: true, rating: 4.2 + Math.random() * 0.6 },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Created ${DEMO_PRODUCTS.length} demo products`);
  }

  // Seed crop prices
  for (const price of DEMO_CROP_PRICES) {
    await CropPrice.findOneAndUpdate(
      { cropName: price.cropName, state: price.state, market: price.market },
      { ...price, unit: 'quintal', date: new Date(), source: 'demo' },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Created ${DEMO_CROP_PRICES.length} crop prices`);

  // Add demo expenses for farmer user
  const farmerUser = createdUsers.find(u => u.role === 'farmer');
  if (farmerUser) {
    const expenseData = [
      { category: 'seeds', amount: 18000, description: 'BT Cotton seeds 15kg', cropType: 'Cotton' },
      { category: 'fertilizers', amount: 24000, description: 'NPK + Urea for 5 acres', cropType: 'Cotton' },
      { category: 'labour', amount: 22000, description: 'Sowing and weeding labor' },
      { category: 'watering', amount: 9000, description: 'Drip irrigation electricity' },
      { category: 'pesticides', amount: 12000, description: 'Neem pesticide + fungicide' },
      { category: 'tilling', amount: 7500, description: 'Tractor tilling 5 acres' },
      { category: 'harvesting', amount: 15000, description: 'Harvesting labor cost' },
      { category: 'machinery', amount: 8000, description: 'Equipment rental' },
    ];

    await Expense.deleteMany({ userId: farmerUser._id });
    for (const expense of expenseData) {
      await Expense.create({
        ...expense,
        userId: farmerUser._id,
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        season: 'Kharif 2025',
      });
    }
    console.log('✅ Created demo expenses');
  }

  console.log('\n🌾 ═══════════════════════════════');
  console.log('   SEED COMPLETE! Demo credentials:');
  console.log('═══════════════════════════════════');
  console.log('  Admin:   admin@agree.com  / jay@1234');
  console.log('  Farmer:  farmer@demo.com  / demo1234');
  console.log('  Grower:  grower@demo.com  / demo1234');
  console.log('  Seller:  seller@demo.com  / demo1234');
  console.log('═══════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
