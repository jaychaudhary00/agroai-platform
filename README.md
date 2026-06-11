# 🌾 AgroAI Platform

> AI-powered full-stack agriculture platform for Indian farmers — built with MERN + TypeScript

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)

---

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Quick Start](#quick-start)
5. [Environment Variables](#environment-variables)
6. [API Documentation](#api-documentation)
7. [Database Models](#database-models)
8. [Deployment Guide](#deployment-guide)
9. [External APIs & Keys](#external-apis--keys)
10. [Contributing](#contributing)

---

## ✨ Features

### 🔬 Farmer AI Assistant
- **Plant Disease Detection** — Upload crop photo → AI detects disease with 90%+ accuracy, shows treatment, prevention, fertilizer & watering advice
- **Related YouTube Videos** — Auto-fetches Hindi/Gujarati farming videos for each detected disease
- **Voice Input** — Web Speech API for illiterate farmers; supports Hindi, Gujarati, Punjabi, Marathi
- **AI Fertilizer Calculator** — Input crop type, soil, area, age → precise NPK recommendations
- **Cost Tracker** — Track all farming expenses by category, generate monthly P&L charts, export PDF reports
- **Live Mandi Prices** — Real-time APMC market rates via Agmarknet API, filterable by state/crop/market
- **Multi-language UI** — English, Hindi, Gujarati, Punjabi, Marathi via i18next

### 🛒 Marketplace
- Product listings (seeds, fertilizers, pesticides, tools, plants, soil)
- Seller verification by admin before listing approval
- Advanced filters (category, state, price, rating)
- Shopping cart & order management
- Order tracking with status updates (pending → packed → shipped → delivered)
- Push notifications via Firebase Cloud Messaging
- Ratings & verified buyer reviews

### 🌱 Home Grower
- Plant care reminder system (watering, fertilizing, pruning, repotting)
- AI plant species identification & disease diagnosis
- Weather-aware care advice (skip watering if rain expected)
- YouTube video recommendations

### ⚙️ Admin Dashboard
- User management (activate/deactivate)
- Seller verification workflow
- Product approval queue
- Platform analytics (users, revenue, orders, API health)
- Fake listing removal

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite |
| State | Redux Toolkit |
| Backend | Node.js + Express.js + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) + bcrypt |
| AI | Google Gemini 1.5 Flash API |
| File Upload | Multer + Cloudinary |
| Push Notifications | Firebase Cloud Messaging |
| Email | Nodemailer + Gmail SMTP |
| Scheduling | node-cron |
| Validation | Zod |
| Charts | Recharts |
| i18n | i18next |
| PWA | Vite PWA Plugin |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## 📁 Project Structure

```
agroai/
├── shared/
│   └── types/
│       └── index.ts          # Shared TypeScript interfaces
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts   # MongoDB connection
│   │   │   ├── cloudinary.ts # File upload config
│   │   │   └── logger.ts     # Winston logger
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── ai.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   └── expense.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts        # JWT + role-based auth
│   │   │   ├── validate.ts    # Zod validation
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   └── index.ts       # All Mongoose models
│   │   ├── routes/
│   │   │   └── index.ts       # All route definitions
│   │   ├── services/
│   │   │   ├── fcm.service.ts     # Push notifications
│   │   │   ├── email.service.ts   # Email via Nodemailer
│   │   │   └── cron.service.ts    # Scheduled jobs
│   │   └── utils/
│   │       └── seed.ts            # Database seeder
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       └── AppLayout.tsx  # Sidebar + topbar
    │   ├── pages/
    │   │   ├── DashboardPage.tsx
    │   │   ├── DiseaseScannerPage.tsx
    │   │   ├── MarketplacePage.tsx
    │   │   ├── ExpenseTrackerPage.tsx
    │   │   ├── MandiPricesPage.tsx
    │   │   ├── HomeGrowerPage.tsx
    │   │   ├── AIChatPage.tsx
    │   │   ├── AdminDashboardPage.tsx
    │   │   └── index.ts           # Auth, Orders, Notifications pages
    │   ├── services/
    │   │   ├── api.ts             # Axios + all API methods
    │   │   └── firebase.ts        # FCM client
    │   ├── store/
    │   │   └── index.ts           # Redux slices (auth, products, cart, expenses...)
    │   ├── i18n/
    │   │   └── index.ts           # English, Hindi, Gujarati translations
    │   └── App.tsx                # Router + Provider
    ├── public/
    │   └── firebase-messaging-sw.js
    ├── .env.example
    ├── vite.config.ts
    └── tailwind.config.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and install

```bash
git clone https://github.com/yourname/agroai.git
cd agroai

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your API keys (see Environment Variables section)

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your values
```

### 3. Seed demo data

```bash
cd backend
npx ts-node src/utils/seed.ts
```

### 4. Start development servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Visit **http://localhost:5173**

**Demo login:** `farmer@demo.com` / `demo1234`

---

## 🔑 Environment Variables

### Backend `.env`

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | ✅ |
| `JWT_REFRESH_SECRET` | Refresh token secret | ✅ |
| `GEMINI_API_KEY` | Google AI Studio API key | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | ✅ |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK JSON (1 line) | ⚠️ |
| `SMTP_USER` | Gmail address for emails | ⚠️ |
| `SMTP_PASS` | Gmail App Password | ⚠️ |
| `AGMARKNET_API_KEY` | data.gov.in API key for mandi prices | ⚠️ |
| `WEATHER_API_KEY` | OpenWeatherMap API key | ⚠️ |

### Frontend `.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_FIREBASE_*` | Firebase Web App config values |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JS API |

---

## 📡 API Documentation

### Authentication
```
POST   /api/auth/register       Register new user
POST   /api/auth/login          Login → returns JWT tokens
POST   /api/auth/refresh        Refresh access token
POST   /api/auth/logout         Logout (clears refresh token)
GET    /api/auth/me             Get current user profile
```

### AI Features
```
POST   /api/ai/disease-detect   Upload plant image → disease diagnosis
POST   /api/ai/fertilizer-calc  Calculate fertilizer recommendations
POST   /api/ai/plant-care       Upload plant image → care advice
POST   /api/ai/chat             Chat with AI assistant
POST   /api/ai/weather-advice   Get weather-based care advice
GET    /api/ai/disease-reports  Get user's past scan history
```

### Products
```
GET    /api/products            List products (with filters & pagination)
GET    /api/products/:id        Get single product
POST   /api/products            Create product (seller only)
PUT    /api/products/:id        Update product (seller only)
DELETE /api/products/:id        Delete product
```

### Orders
```
POST   /api/orders              Place new order
GET    /api/orders              Get user's orders
GET    /api/orders/:id          Get single order
PATCH  /api/orders/:id/status   Update order status (admin/seller)
```

### Expenses
```
POST   /api/expenses            Add expense
GET    /api/expenses            Get expenses (with month/year filter)
GET    /api/expenses/analytics  Get expense analytics & charts
GET    /api/expenses/export-pdf Export as PDF report
DELETE /api/expenses/:id        Delete expense
```

### Mandi Prices
```
GET    /api/crop-prices         Get crop prices (filter by state/crop/market)
```

### Reminders
```
GET    /api/reminders           Get user's reminders
POST   /api/reminders           Create reminder
PATCH  /api/reminders/:id/complete  Mark as completed
DELETE /api/reminders/:id       Delete reminder
```

### Admin
```
GET    /api/admin/stats             Platform statistics
GET    /api/admin/sellers/pending   Pending seller verifications
PATCH  /api/admin/sellers/:id/verify  Verify seller
GET    /api/admin/products/pending  Products awaiting approval
PATCH  /api/admin/products/:id/approve  Approve/reject product
PATCH  /api/admin/users/:id/toggle  Activate/deactivate user
```

---

## 🗄 Database Models

| Model | Description |
|-------|-------------|
| `User` | Farmers, home growers, sellers, admins with role-based access |
| `Seller` | Seller profiles with verification status and business details |
| `Product` | Product listings with approval workflow |
| `Order` | Orders with item details, status history, shipping info |
| `Review` | Product/seller ratings from verified buyers |
| `PlantDiseaseReport` | AI scan results with treatment advice |
| `Expense` | Farming expense records by category |
| `CropPrice` | Live mandi prices from Agmarknet |
| `Reminder` | Plant care reminders with repeat scheduling |
| `Notification` | In-app notification history |

---

## 🚀 Deployment Guide

### Frontend → Vercel

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_API_URL = https://your-backend.onrender.com/api
# VITE_FIREBASE_* = (your Firebase config)
```

### Backend → Render

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect GitHub repo, select `backend` folder
4. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Node version:** 20
5. Add all environment variables from `.env.example`
6. Deploy!

### Database → MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Create database user and whitelist IPs (or allow 0.0.0.0/0 for Render)
3. Get connection string → set as `MONGODB_URI` in backend
4. Run seed: `npx ts-node src/utils/seed.ts`

### Cloudinary (Image Storage)

1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Get Cloud Name, API Key, API Secret from dashboard
3. Set as `CLOUDINARY_*` variables in backend

---

## 🔑 External APIs & Keys

### Google Gemini AI (Required)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create API key → set as `GEMINI_API_KEY`
3. Free tier: 1500 requests/day

### YouTube Data API (For video suggestions)
1. [console.cloud.google.com](https://console.cloud.google.com)
2. Enable YouTube Data API v3
3. Create API key → set as `YOUTUBE_API_KEY`
4. Free tier: 10,000 units/day

### Firebase Cloud Messaging (Push Notifications)
1. [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → Add Web App → Copy config to frontend `.env`
3. Project Settings → Service Accounts → Generate Admin SDK key → Set as `FIREBASE_SERVICE_ACCOUNT` (JSON as single line)
4. Cloud Messaging → Web Push → Generate VAPID key → set as `VITE_FIREBASE_VAPID_KEY`

### Agmarknet API (Mandi Prices)
1. Register at [data.gov.in](https://data.gov.in)
2. Search for "agmarknet" resource
3. Get API key → set as `AGMARKNET_API_KEY`
4. Free government API

### OpenWeatherMap (Weather Alerts)
1. Register at [openweathermap.org/api](https://openweathermap.org/api)
2. Free tier: 1000 calls/day
3. Set as `WEATHER_API_KEY`

---

## 🌐 Multi-language Support

The platform supports 5 Indian languages via i18next:

| Code | Language | Region |
|------|----------|--------|
| `en` | English | Default/All India |
| `hi` | हिंदी (Hindi) | North India |
| `gu` | ગુજરાતી (Gujarati) | Gujarat |
| `pa` | ਪੰਜਾਬੀ (Punjabi) | Punjab |
| `mr` | मराठी (Marathi) | Maharashtra |

Voice input also supports all 5 languages via the Web Speech API.

---

## 📱 PWA Support

The app is a Progressive Web App:
- Installable on Android/iOS
- Offline mode with service worker caching
- Background push notifications
- Fast loading with pre-cached assets

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file.

---

**Built with ❤️ for Indian farmers by the AgroAI team**

> "Technology should reach the last farmer in the last village." — AgroAI Mission
