import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI, productAPI, expenseAPI, cropPriceAPI, orderAPI } from '../services/api';

// ─── AUTH SLICE ───────────────────────────────────────────────────────────────
interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authAPI.login(email, password);
      const { user, token, refreshToken } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      return { user, token };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: object, { rejectWithValue }) => {
    try {
      const res = await authAPI.register(data);
      const { user, token, refreshToken } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      return { user, token };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await authAPI.getMe();
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  } as AuthState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    clearError(state) { state.error = null; },
    updateUser(state, action: PayloadAction<any>) { state.user = { ...state.user, ...action.payload }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload; });
  },
});

// ─── PRODUCTS SLICE ───────────────────────────────────────────────────────────
interface ProductsState {
  items: any[];
  loading: boolean;
  error: string | null;
  pagination: any;
  filters: Record<string, any>;
}

export const fetchProducts = createAsyncThunk('products/fetch', async (params: object = {}) => {
  const res = await productAPI.getAll(params);
  return res.data;
});

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], loading: false, error: null, pagination: null, filters: {} } as ProductsState,
  reducers: {
    setFilters(state, action: PayloadAction<Record<string, any>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) { state.filters = {}; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      });
  },
});

// ─── CART SLICE ───────────────────────────────────────────────────────────────
interface CartItem { product: any; quantity: number; }
interface CartState { items: CartItem[]; }

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] } as CartState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: any; quantity: number }>) {
      const existing = state.items.find((i) => i.product._id === action.payload.product._id);
      if (existing) existing.quantity += action.payload.quantity;
      else state.items.push(action.payload);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.product._id !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find((i) => i.product._id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
    },
    clearCart(state) { state.items = []; },
  },
});

// ─── EXPENSES SLICE ───────────────────────────────────────────────────────────
interface ExpenseState { items: any[]; analytics: any; loading: boolean; }

// Fix: provide default argument so it can be called with no args
export const fetchExpenses = createAsyncThunk(
  'expenses/fetch',
  async (params: object = {}) => {
    const res = await expenseAPI.getAll(params);
    return res.data.data;
  }
);

export const fetchAnalytics = createAsyncThunk(
  'expenses/analytics',
  async (year: number | undefined = undefined) => {
    const res = await expenseAPI.getAnalytics(year);
    return res.data.data;
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: { items: [], analytics: null, loading: false } as ExpenseState,
  reducers: {
    addExpenseLocal(state, action: PayloadAction<any>) { state.items.unshift(action.payload); },
    removeExpenseLocal(state, action: PayloadAction<string>) {
      state.items = state.items.filter((e) => e._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => { state.loading = true; })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.expenses || action.payload || [];
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => { state.analytics = action.payload; });
  },
});

// ─── CROP PRICES SLICE ────────────────────────────────────────────────────────
interface CropPriceState { items: any[]; loading: boolean; pagination: any; }

export const fetchCropPrices = createAsyncThunk(
  'cropPrices/fetch',
  async (params: object = {}) => {
    const res = await cropPriceAPI.getAll(params);
    return res.data;
  }
);

const cropPricesSlice = createSlice({
  name: 'cropPrices',
  initialState: { items: [], loading: false, pagination: null } as CropPriceState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCropPrices.pending, (state) => { state.loading = true; })
      .addCase(fetchCropPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.pagination = action.payload.pagination;
      });
  },
});

// ─── ORDERS SLICE ─────────────────────────────────────────────────────────────
interface OrdersState { items: any[]; loading: boolean; pagination: any; }

export const fetchOrders = createAsyncThunk(
  'orders/fetch',
  async (page: number = 1) => {
    const res = await orderAPI.getAll(page);
    return res.data;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [], loading: false, pagination: null } as OrdersState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.pagination = action.payload.pagination;
      });
  },
});

// ─── UI SLICE ─────────────────────────────────────────────────────────────────
interface UIState { theme: 'light' | 'dark'; sidebarOpen: boolean; language: string; }

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    sidebarOpen: true,
    language: localStorage.getItem('lang') || 'en',
  } as UIState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
      localStorage.setItem('lang', action.payload);
    },
  },
});

// ─── Store ────────────────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    products: productsSlice.reducer,
    cart: cartSlice.reducer,
    expenses: expensesSlice.reducer,
    cropPrices: cropPricesSlice.reducer,
    orders: ordersSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ─── Export all actions ───────────────────────────────────────────────────────
export const { logout, clearError, updateUser } = authSlice.actions;
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export const { setFilters, resetFilters } = productsSlice.actions;
export const { addExpenseLocal, removeExpenseLocal } = expensesSlice.actions;
export const { toggleTheme, toggleSidebar, setLanguage } = uiSlice.actions;
