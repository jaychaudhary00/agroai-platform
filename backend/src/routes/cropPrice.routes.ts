import { Router } from 'express';
import { CropPrice } from '../models';
import axios from 'axios';
import { logger } from '../config/logger';

const router = Router();

// Track last successful API fetch to avoid hammering the API on every request
let lastFetchTime = 0;
const FETCH_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

const fetchFromGovAPI = async (state?: string, commodity?: string): Promise<number> => {
  const apiKey = process.env.AGMARKNET_API_KEY;
  if (!apiKey) {
    logger.warn('[Mandi] AGMARKNET_API_KEY not set in .env');
    return 0;
  }

  try {
    const params: Record<string, string> = {
      'api-key': apiKey,
      format: 'json',
      limit: '500',
      offset: '0',
    };
    if (state) params['filters[state]'] = state;
    if (commodity) params['filters[commodity]'] = commodity;

    logger.info(`[Mandi] Fetching from data.gov.in — state=${state||'all'} commodity=${commodity||'all'}`);

    const response = await axios.get(
      'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
      { params, timeout: 20000 }
    );

    const records: any[] = response.data?.records || [];
    logger.info(`[Mandi] API returned ${records.length} records`);

    if (!records.length) return 0;

    // Bulk upsert — use today as date window
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const ops = records.map(r => ({
      updateOne: {
        filter: {
          commodity: r.commodity,
          state: r.state,
          market: r.market,
          date: { $gte: todayStart },
        },
        update: {
          $set: {
            commodity: r.commodity,
            variety: r.variety || '',
            state: r.state,
            district: r.district || '',
            market: r.market,
            minPrice: parseFloat(r.min_price) || 0,
            maxPrice: parseFloat(r.max_price) || 0,
            modalPrice: parseFloat(r.modal_price) || 0,
            unit: 'quintal',
            date: r.arrival_date ? new Date(r.arrival_date) : new Date(),
            source: 'agmarknet',
          },
        },
        upsert: true,
      },
    }));

    const result = await CropPrice.bulkWrite(ops, { ordered: false });
    const saved = (result.upsertedCount || 0) + (result.modifiedCount || 0);
    logger.info(`[Mandi] Saved/updated ${saved} records from API`);
    lastFetchTime = Date.now();
    return saved;
  } catch (err: any) {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err?.message;
    logger.error(`[Mandi] API fetch failed — HTTP ${status}: ${msg}`);
    return 0;
  }
};

// GET /api/crop-prices
router.get('/', async (req, res) => {
  try {
    const { state, commodity, crop, market, limit = '200', forceRefresh } = req.query;
    const searchCommodity = ((commodity || crop) as string) || undefined;
    const stateFilter = (state as string) || undefined;

    // Fetch from live API if:
    // 1. forceRefresh=true (user clicked refresh button), OR
    // 2. cooldown has passed (10 min), OR
    // 3. DB is empty
    const dbCount = await CropPrice.countDocuments();
    const cooldownPassed = Date.now() - lastFetchTime > FETCH_COOLDOWN_MS;

    if (forceRefresh === 'true' || cooldownPassed || dbCount === 0) {
      await fetchFromGovAPI(stateFilter, searchCommodity);
    }

    // Build query filter
    const filter: Record<string, any> = {};
    if (stateFilter) filter.state = new RegExp(stateFilter, 'i');
    if (searchCommodity) filter.commodity = new RegExp(searchCommodity, 'i');
    if (market) filter.market = new RegExp(market as string, 'i');

    let prices = await CropPrice.find(filter)
      .sort({ date: -1, commodity: 1 })
      .limit(parseInt(limit as string));

    // Only use fallback if DB is completely empty after API attempt
    if (prices.length === 0) {
      logger.warn('[Mandi] DB empty after API fetch — using fallback static data');
      prices = await seedFallbackData();
    }

    const isFallback = prices.some((p: any) => p.source === 'seed');

    res.json({
      success: true,
      data: prices,
      total: prices.length,
      source: isFallback ? 'fallback' : 'live',
      lastFetched: lastFetchTime ? new Date(lastFetchTime).toISOString() : null,
    });
  } catch (err: any) {
    logger.error('[Mandi] GET / error:', err?.message);
    res.status(500).json({ success: false, message: 'Server error fetching crop prices' });
  }
});

// Fallback: insert static data ONLY if DB is completely empty
// These are approximate real market prices — labelled as 'seed' so frontend can distinguish
const seedFallbackData = async (): Promise<any[]> => {
  const existing = await CropPrice.countDocuments();
  if (existing > 0) {
    return CropPrice.find().sort({ date: -1 }).limit(200);
  }

  logger.info('[Mandi] Seeding fallback crop price data');
  const now = new Date();
  const samples = [
    { commodity:'Wheat',      market:'Ahmedabad',   state:'Gujarat',          minPrice:2100, maxPrice:2400,  modalPrice:2250 },
    { commodity:'Rice',       market:'Surat',        state:'Gujarat',          minPrice:1800, maxPrice:2200,  modalPrice:2000 },
    { commodity:'Cotton',     market:'Rajkot',       state:'Gujarat',          minPrice:6500, maxPrice:7200,  modalPrice:6800 },
    { commodity:'Groundnut',  market:'Junagadh',     state:'Gujarat',          minPrice:5200, maxPrice:5800,  modalPrice:5500 },
    { commodity:'Tomato',     market:'Pune',         state:'Maharashtra',      minPrice:800,  maxPrice:1500,  modalPrice:1100 },
    { commodity:'Onion',      market:'Nashik',       state:'Maharashtra',      minPrice:1200, maxPrice:1800,  modalPrice:1500 },
    { commodity:'Potato',     market:'Agra',         state:'Uttar Pradesh',    minPrice:900,  maxPrice:1300,  modalPrice:1100 },
    { commodity:'Mustard',    market:'Jaipur',       state:'Rajasthan',        minPrice:4800, maxPrice:5400,  modalPrice:5100 },
    { commodity:'Maize',      market:'Ludhiana',     state:'Punjab',           minPrice:1700, maxPrice:2000,  modalPrice:1850 },
    { commodity:'Soybean',    market:'Indore',       state:'Madhya Pradesh',   minPrice:3800, maxPrice:4300,  modalPrice:4050 },
    { commodity:'Sugarcane',  market:'Lucknow',      state:'Uttar Pradesh',    minPrice:280,  maxPrice:320,   modalPrice:300  },
    { commodity:'Bajra',      market:'Jodhpur',      state:'Rajasthan',        minPrice:1900, maxPrice:2200,  modalPrice:2050 },
    { commodity:'Chilli',     market:'Guntur',       state:'Andhra Pradesh',   minPrice:8000, maxPrice:12000, modalPrice:10000},
    { commodity:'Turmeric',   market:'Erode',        state:'Tamil Nadu',       minPrice:6500, maxPrice:8000,  modalPrice:7200 },
    { commodity:'Garlic',     market:'Mandsaur',     state:'Madhya Pradesh',   minPrice:3000, maxPrice:5000,  modalPrice:4000 },
    { commodity:'Jowar',      market:'Solapur',      state:'Maharashtra',      minPrice:2000, maxPrice:2500,  modalPrice:2250 },
    { commodity:'Arhar Dal',  market:'Delhi',        state:'Delhi',            minPrice:7000, maxPrice:8500,  modalPrice:7800 },
    { commodity:'Moong Dal',  market:'Nagpur',       state:'Maharashtra',      minPrice:7500, maxPrice:9000,  modalPrice:8200 },
    { commodity:'Paddy',      market:'Patna',        state:'Bihar',            minPrice:1800, maxPrice:2100,  modalPrice:1950 },
    { commodity:'Sunflower',  market:'Bijapur',      state:'Karnataka',        minPrice:4500, maxPrice:5200,  modalPrice:4850 },
    { commodity:'Banana',     market:'Anand',        state:'Gujarat',          minPrice:1200, maxPrice:2000,  modalPrice:1600 },
    { commodity:'Mango',      market:'Valsad',       state:'Gujarat',          minPrice:3000, maxPrice:6000,  modalPrice:4500 },
    { commodity:'Cumin',      market:'Unjha',        state:'Gujarat',          minPrice:18000,maxPrice:22000, modalPrice:20000},
    { commodity:'Fennel',     market:'Unjha',        state:'Gujarat',          minPrice:8000, maxPrice:10000, modalPrice:9000 },
    { commodity:'Coriander',  market:'Kota',         state:'Rajasthan',        minPrice:5000, maxPrice:7000,  modalPrice:6000 },
  ];

  await CropPrice.insertMany(
    samples.map(s => ({ ...s, unit: 'quintal', date: now, variety: '', district: '', source: 'seed' }))
  );
  return CropPrice.find().sort({ commodity: 1 }).limit(200);
};

// GET /api/crop-prices/meta/states — distinct states in DB
router.get('/meta/states', async (_req, res) => {
  try {
    const states = await CropPrice.distinct('state');
    res.json({ success: true, data: states.filter(Boolean).sort() });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/crop-prices/meta/crops — distinct commodities in DB
router.get('/meta/crops', async (_req, res) => {
  try {
    const crops = await CropPrice.distinct('commodity');
    res.json({ success: true, data: crops.filter(Boolean).sort() });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
