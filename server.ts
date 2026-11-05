import express, { type Request, type Response, type NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  INITIAL_CATEGORIES,
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_LISTINGS,
  generateInitialHistory,
  INITIAL_PLATFORM_SETTINGS,
} from './src/data/initialData.ts';
import type {
  User,
  Category,
  Store,
  Product,
  StoreListing,
  PriceHistoryRecord,
  WishlistItem,
  PriceAlert,
  NotificationItem,
  TrackingJob,
  AdminLog,
  PlatformSettings,
} from './src/types/index.ts';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'pricetrack_db.json');

// In-Memory Database Structure
interface DatabaseSchema {
  users: (User & { passwordHash: string; salt: string })[];
  categories: Category[];
  stores: Store[];
  products: Product[];
  listings: StoreListing[];
  priceHistory: PriceHistoryRecord[];
  wishlists: WishlistItem[];
  priceAlerts: PriceAlert[];
  notifications: NotificationItem[];
  trackingJob: TrackingJob;
  adminLogs: AdminLog[];
  settings: PlatformSettings;
}

// Password hashing helper
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateToken(userId: string): string {
  const payload = JSON.stringify({ userId, timestamp: Date.now() });
  const signature = crypto.createHmac('sha256', 'pricetrack-jwt-secret-2026').update(payload).digest('hex');
  return Buffer.from(`${payload}.${signature}`).toString('base64');
}

function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [payloadStr, signature] = decoded.split('.');
    const expectedSignature = crypto.createHmac('sha256', 'pricetrack-jwt-secret-2026').update(payloadStr).digest('hex');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(payloadStr);
    return payload.userId;
  } catch {
    return null;
  }
}

let db: DatabaseSchema;

function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      console.log('Loaded database from', DB_FILE);
      return;
    } catch (e) {
      console.error('Failed to parse database file, reinitializing', e);
    }
  }

  // Seed Initial Admin & Customer
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const customerSalt = crypto.randomBytes(16).toString('hex');

  const users: DatabaseSchema['users'] = [
    {
      id: 'usr-admin-1',
      name: 'Alexander Vance',
      email: 'admin@pricetrack.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      salt: adminSalt,
      passwordHash: hashPassword('admin123', adminSalt),
      preferredStores: ['store-amazon', 'store-croma'],
      currency: 'INR',
      emailNotifications: true,
    },
    {
      id: 'usr-cust-1',
      name: 'Prerna Garg',
      email: 'customer@pricetrack.com',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      salt: customerSalt,
      passwordHash: hashPassword('customer123', customerSalt),
      preferredStores: ['store-amazon', 'store-flipkart'],
      currency: 'INR',
      emailNotifications: true,
    },
  ];

  const initialHistory = generateInitialHistory();

  db = {
    users,
    categories: INITIAL_CATEGORIES,
    stores: INITIAL_STORES,
    products: INITIAL_PRODUCTS,
    listings: INITIAL_LISTINGS,
    priceHistory: initialHistory,
    wishlists: [
      {
        id: 'wish-1',
        userId: 'usr-cust-1',
        productId: 'prod-1',
        targetPrice: 115000,
        addedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'wish-2',
        userId: 'usr-cust-1',
        productId: 'prod-2',
        targetPrice: 24000,
        addedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    priceAlerts: [
      {
        id: 'alt-1',
        userId: 'usr-cust-1',
        productId: 'prod-2',
        targetPrice: 25000,
        currentPriceAtCreation: 26490,
        isActive: true,
        isTriggered: true,
        triggeredAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'alt-2',
        userId: 'usr-cust-1',
        productId: 'prod-1',
        targetPrice: 115000,
        currentPriceAtCreation: 119900,
        isActive: true,
        isTriggered: false,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        userId: 'usr-cust-1',
        title: 'Target Price Reached! 🚀',
        message: 'Sony WH-1000XM5 just dropped to ₹24,490 on Croma (your target was ₹25,000)!',
        type: 'target_reached',
        productId: 'prod-2',
        link: '/products/prod-2',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        priceDifference: 510,
      },
      {
        id: 'notif-2',
        userId: 'usr-cust-1',
        title: 'Welcome to PriceTrack!',
        message: 'Start tracking products across Amazon, Flipkart, Croma, and Reliance Digital.',
        type: 'welcome',
        isRead: true,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ],
    trackingJob: {
      jobId: 'job-scheduler-main',
      status: 'idle',
      intervalMinutes: 15,
      lastRun: new Date(Date.now() - 10 * 60000).toISOString(),
      nextRun: new Date(Date.now() + 5 * 60000).toISOString(),
      itemsChecked: INITIAL_LISTINGS.length,
      dropsDetected: 3,
    },
    adminLogs: [
      {
        id: 'log-1',
        adminId: 'usr-admin-1',
        adminEmail: 'admin@pricetrack.com',
        action: 'System Initialized',
        targetType: 'settings',
        targetId: 'sys-init',
        details: 'Loaded initial e-commerce catalogs and scheduled price tracking engines.',
        timestamp: new Date().toISOString(),
      },
    ],
    settings: INITIAL_PLATFORM_SETTINGS,
  };

  saveDatabase();
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}

// Compute lowest price and attached listings for products
function enrichProduct(p: Product): Product {
  const listings = db.listings.filter((l) => l.productId === p.id);
  const activeListings = listings.filter((l) => l.availability !== 'out_of_stock');
  const validListings = activeListings.length > 0 ? activeListings : listings;

  let lowestPrice = Infinity;
  let highestPrice = 0;
  let cheapestStore = 'N/A';
  let cheapestStoreId = '';
  let discountPercentage = 0;

  validListings.forEach((l) => {
    if (l.currentPrice < lowestPrice) {
      lowestPrice = l.currentPrice;
      cheapestStore = l.storeName;
      cheapestStoreId = l.storeId;
      discountPercentage = l.discountPercentage;
    }
    if (l.currentPrice > highestPrice) {
      highestPrice = l.currentPrice;
    }
  });

  return {
    ...p,
    lowestPrice: lowestPrice === Infinity ? undefined : lowestPrice,
    highestPrice: highestPrice === 0 ? undefined : highestPrice,
    cheapestStore: lowestPrice === Infinity ? undefined : cheapestStore,
    cheapestStoreId: lowestPrice === Infinity ? undefined : cheapestStoreId,
    discountPercentage: discountPercentage || undefined,
    listingsCount: listings.length,
    listings,
  };
}

// Evaluate alerts whenever a listing price changes
function evaluateAlertsForProduct(productId: string) {
  const product = db.products.find((p) => p.id === productId);
  if (!product) return;

  const listings = db.listings.filter((l) => l.productId === productId && l.availability !== 'out_of_stock');
  if (listings.length === 0) return;

  const lowestPrice = Math.min(...listings.map((l) => l.currentPrice));
  const cheapestListing = listings.find((l) => l.currentPrice === lowestPrice);

  const activeAlerts = db.priceAlerts.filter(
    (a) => a.productId === productId && a.isActive && !a.isTriggered && lowestPrice <= a.targetPrice
  );

  activeAlerts.forEach((alert) => {
    alert.isTriggered = true;
    alert.triggeredAt = new Date().toISOString();

    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: alert.userId,
      title: 'Target Price Reached! 🎯',
      message: `${product.name} is now available at ₹${lowestPrice.toLocaleString('en-IN')} on ${
        cheapestListing?.storeName || 'store'
      } (Target: ₹${alert.targetPrice.toLocaleString('en-IN')})!`,
      type: 'target_reached',
      productId: product.id,
      link: `/products/${product.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      priceDifference: alert.targetPrice - lowestPrice,
    };

    db.notifications.unshift(notif);
  });

  saveDatabase();
}

// Execute scheduled or manual price check engine
function runPriceTrackingCycle(): { itemsChecked: number; dropsDetected: number } {
  db.trackingJob.status = 'running';
  db.trackingJob.lastRun = new Date().toISOString();
  db.trackingJob.nextRun = new Date(Date.now() + db.trackingJob.intervalMinutes * 60000).toISOString();

  let drops = 0;

  db.listings.forEach((listing) => {
    // In hybrid simulation, adjust 20% of listings by random small fluctuation (-5% to +2%)
    if (Math.random() < 0.25) {
      const changePct = (Math.random() * 7 - 4) / 100; // -4% to +3%
      const newPrice = Math.max(500, Math.round((listing.currentPrice * (1 + changePct)) / 10) * 10);

      if (newPrice < listing.currentPrice) {
        drops++;
      }

      listing.currentPrice = newPrice;
      listing.discountPercentage = Math.round(((listing.originalPrice - newPrice) / listing.originalPrice) * 100);
      listing.lastUpdated = new Date().toISOString();

      // Log into price history table
      db.priceHistory.push({
        id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: listing.productId,
        storeId: listing.storeId,
        storeName: listing.storeName,
        price: newPrice,
        recordedAt: new Date().toISOString(),
        isVerified: listing.verificationStatus === 'VERIFIED_LIVE',
        notes: 'Periodic scheduler sync',
      });

      evaluateAlertsForProduct(listing.productId);
    }
  });

  db.trackingJob.status = 'idle';
  db.trackingJob.itemsChecked = db.listings.length;
  db.trackingJob.dropsDetected = drops;

  saveDatabase();
  return { itemsChecked: db.listings.length, dropsDetected: drops };
}

// Auth Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  (req as any).user = user;
  next();
}

function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  authMiddleware(req, res, () => {
    const user = (req as any).user as User;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
    }
    next();
  });
}

async function startServer() {
  initDatabase();

  const app = express();
  app.use(express.json());

  // Setup periodic price check (Every 2 minutes in dev server)
  setInterval(() => {
    try {
      runPriceTrackingCycle();
    } catch (err) {
      console.error('Periodic tracker error:', err);
    }
  }, 120000);

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role: 'customer' as const,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash: hashPassword(password, salt),
      preferredStores: ['store-amazon', 'store-flipkart'],
      currency: 'INR',
      emailNotifications: true,
    };

    db.users.push(newUser);
    saveDatabase();

    const token = generateToken(newUser.id);
    const { passwordHash: _, salt: __, ...userProfile } = newUser;
    res.status(201).json({ user: userProfile, token });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const calculatedHash = hashPassword(password, user.salt);
    if (calculatedHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    const { passwordHash: _, salt: __, ...userProfile } = user;
    res.json({ user: userProfile, token });
  });

  // Auth: Me
  app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const { passwordHash: _, salt: __, ...userProfile } = user;
    res.json({ user: userProfile });
  });

  // Auth: Profile update
  app.put('/api/auth/profile', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const { name, preferredStores, currency, emailNotifications } = req.body;

    if (name) user.name = name;
    if (preferredStores) user.preferredStores = preferredStores;
    if (currency) user.currency = currency;
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;

    saveDatabase();
    const { passwordHash: _, salt: __, ...userProfile } = user;
    res.json({ user: userProfile, message: 'Profile updated successfully' });
  });

  // Products: List with search, filtering, and sorting
  app.get('/api/products', (req, res) => {
    const { query, category, brand, store, minPrice, maxPrice, sortBy, page = '1', limit = '12' } = req.query;

    let results = db.products.map(enrichProduct);

    if (query && typeof query === 'string' && query.trim() !== '') {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (category && typeof category === 'string' && category !== 'all') {
      results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (brand && typeof brand === 'string' && brand !== 'all') {
      results = results.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
    }

    if (store && typeof store === 'string' && store !== 'all') {
      results = results.filter((p) => p.listings?.some((l) => l.storeId === store));
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      results = results.filter((p) => (p.lowestPrice || 0) >= Number(minPrice));
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      results = results.filter((p) => (p.lowestPrice || 0) <= Number(maxPrice));
    }

    // Sort
    if (sortBy === 'price_asc') {
      results.sort((a, b) => (a.lowestPrice || 0) - (b.lowestPrice || 0));
    } else if (sortBy === 'price_desc') {
      results.sort((a, b) => (b.lowestPrice || 0) - (a.lowestPrice || 0));
    } else if (sortBy === 'discount') {
      results.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    } else {
      // Default: newest
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const total = results.length;
    const totalPages = Math.ceil(total / limitNum);
    const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      products: paginated,
      total,
      page: pageNum,
      totalPages,
    });
  });

  // Products: Single Details
  app.get('/api/products/:id', (req, res) => {
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const enriched = enrichProduct(product);

    // Calculate historical statistics
    const history = db.priceHistory.filter((h) => h.productId === product.id);
    const prices = history.map((h) => h.price);
    const lowestRecorded = prices.length > 0 ? Math.min(...prices) : enriched.lowestPrice;
    const highestRecorded = prices.length > 0 ? Math.max(...prices) : enriched.highestPrice;
    const avgRecorded = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : enriched.lowestPrice;

    res.json({
      product: enriched,
      statistics: {
        lowestRecordedPrice: lowestRecorded,
        highestRecordedPrice: highestRecorded,
        averageRecordedPrice: avgRecorded,
        totalHistoricalPoints: history.length,
      },
    });
  });

  // Products: Compare across stores
  app.get('/api/products/:id/compare', (req, res) => {
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const listings = db.listings.filter((l) => l.productId === product.id);
    const activeListings = listings.filter((l) => l.availability !== 'out_of_stock');

    // Algorithm:
    // 1. Filter out unavailable or invalid prices
    // 2. Sort by currentPrice ascending
    // 3. Mark the top as verified lowest price
    activeListings.sort((a, b) => a.currentPrice - b.currentPrice);

    const cheapestListing = activeListings[0];
    const highestListing = activeListings[activeListings.length - 1];
    const maxSavings = highestListing && cheapestListing ? highestListing.currentPrice - cheapestListing.currentPrice : 0;

    res.json({
      product: enrichProduct(product),
      listings,
      cheapestListing,
      maxSavings,
      comparisonCount: listings.length,
      timestamp: new Date().toISOString(),
    });
  });

  // Price History Graph Data
  app.get('/api/products/:id/price-history', (req, res) => {
    const { range = '30d' } = req.query;
    const productId = req.params.id;

    let dayLimit = 30;
    if (range === '7d') dayLimit = 7;
    else if (range === '90d') dayLimit = 90;
    else if (range === '1y') dayLimit = 365;

    const cutoff = new Date(Date.now() - dayLimit * 86400000).toISOString();
    const records = db.priceHistory
      .filter((h) => h.productId === productId && h.recordedAt >= cutoff)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

    res.json({ records, range });
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    const categoriesWithCount = db.categories.map((c) => ({
      ...c,
      productCount: db.products.filter((p) => p.category.toLowerCase() === c.name.toLowerCase()).length,
    }));
    res.json({ categories: categoriesWithCount });
  });

  // Stores
  app.get('/api/stores', (req, res) => {
    res.json({ stores: db.stores });
  });

  // Smart Deal Finder
  app.get('/api/deals', (req, res) => {
    const enriched = db.products.map(enrichProduct);

    // Filter products that have verified discounts
    const bestDeals = [...enriched]
      .filter((p) => (p.discountPercentage || 0) >= 15)
      .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))
      .slice(0, 8);

    const trending = [...enriched].slice(0, 6);

    const recentDrops = db.priceHistory
      .filter((h) => h.notes?.includes('drop') || h.notes?.includes('discount') || h.notes?.includes('Lowest'))
      .slice(-6)
      .reverse();

    res.json({
      bestDeals,
      trending,
      recentDrops,
    });
  });

  // Wishlist: Get user items
  app.get('/api/wishlist', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const items = db.wishlists
      .filter((w) => w.userId === user.id)
      .map((w) => {
        const prod = db.products.find((p) => p.id === w.productId);
        return {
          ...w,
          product: prod ? enrichProduct(prod) : undefined,
        };
      });

    res.json({ wishlist: items });
  });

  // Wishlist: Add item
  app.post('/api/wishlist', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const { productId, targetPrice } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const existing = db.wishlists.find((w) => w.userId === user.id && w.productId === productId);
    if (existing) {
      return res.status(409).json({ error: 'Product is already in your wishlist' });
    }

    const newItem: WishlistItem = {
      id: `wish-${Date.now()}`,
      userId: user.id,
      productId,
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
      addedAt: new Date().toISOString(),
    };

    db.wishlists.push(newItem);
    saveDatabase();

    const prod = db.products.find((p) => p.id === productId);
    res.status(201).json({
      item: { ...newItem, product: prod ? enrichProduct(prod) : undefined },
      message: 'Product added to wishlist',
    });
  });

  // Wishlist: Remove item
  app.delete('/api/wishlist/:id', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const index = db.wishlists.findIndex((w) => w.id === req.params.id && w.userId === user.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    db.wishlists.splice(index, 1);
    saveDatabase();
    res.json({ message: 'Removed from wishlist' });
  });

  // Price Alerts: Get user alerts
  app.get('/api/alerts', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const alerts = db.priceAlerts
      .filter((a) => a.userId === user.id)
      .map((a) => {
        const prod = db.products.find((p) => p.id === a.productId);
        return {
          ...a,
          product: prod ? enrichProduct(prod) : undefined,
        };
      });

    res.json({ alerts });
  });

  // Price Alerts: Create alert
  app.post('/api/alerts', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const { productId, targetPrice } = req.body;

    if (!productId || !targetPrice || isNaN(Number(targetPrice))) {
      return res.status(400).json({ error: 'Product ID and valid target price are required' });
    }

    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const enriched = enrichProduct(product);
    const currentPrice = enriched.lowestPrice || 0;

    const newAlert: PriceAlert = {
      id: `alt-${Date.now()}`,
      userId: user.id,
      productId,
      targetPrice: Number(targetPrice),
      currentPriceAtCreation: currentPrice,
      isActive: true,
      isTriggered: currentPrice <= Number(targetPrice),
      createdAt: new Date().toISOString(),
      triggeredAt: currentPrice <= Number(targetPrice) ? new Date().toISOString() : undefined,
    };

    db.priceAlerts.push(newAlert);

    // If target already met, create notification immediately
    if (newAlert.isTriggered) {
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: user.id,
        title: 'Price Alert Ready! 🎯',
        message: `${product.name} is currently at ₹${currentPrice.toLocaleString(
          'en-IN'
        )}, matching or below your target of ₹${newAlert.targetPrice.toLocaleString('en-IN')}!`,
        type: 'target_reached',
        productId: product.id,
        link: `/products/${product.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        priceDifference: newAlert.targetPrice - currentPrice,
      });
    }

    saveDatabase();

    res.status(201).json({
      alert: { ...newAlert, product: enriched },
      message: 'Target-price alert successfully set',
    });
  });

  // Price Alerts: Update alert
  app.put('/api/alerts/:id', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const alert = db.priceAlerts.find((a) => a.id === req.params.id && a.userId === user.id);

    if (!alert) {
      return res.status(404).json({ error: 'Price alert not found' });
    }

    const { targetPrice, isActive } = req.body;
    if (targetPrice !== undefined && !isNaN(Number(targetPrice))) {
      alert.targetPrice = Number(targetPrice);
      alert.isTriggered = false; // Reset trigger on update
    }
    if (isActive !== undefined) {
      alert.isActive = Boolean(isActive);
    }

    saveDatabase();
    res.json({ alert, message: 'Alert updated successfully' });
  });

  // Price Alerts: Delete alert
  app.delete('/api/alerts/:id', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const index = db.priceAlerts.findIndex((a) => a.id === req.params.id && a.userId === user.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Price alert not found' });
    }

    db.priceAlerts.splice(index, 1);
    saveDatabase();
    res.json({ message: 'Price alert deleted' });
  });

  // Notifications: Get user notifications
  app.get('/api/notifications', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const notifications = db.notifications.filter((n) => n.userId === user.id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ notifications, unreadCount });
  });

  // Notifications: Mark read
  app.put('/api/notifications/:id/read', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const notif = db.notifications.find((n) => n.id === req.params.id && n.userId === user.id);

    if (notif) {
      notif.isRead = true;
      saveDatabase();
    }
    res.json({ success: true });
  });

  // Notifications: Mark all read
  app.put('/api/notifications/read-all', authMiddleware, (req, res) => {
    const user = (req as any).user;
    db.notifications.forEach((n) => {
      if (n.userId === user.id) n.isRead = true;
    });
    saveDatabase();
    res.json({ success: true, message: 'All notifications marked as read' });
  });

  // -------------------------------------------------------------
  // ADMIN ROUTES
  // -------------------------------------------------------------

  // Admin Dashboard stats
  app.get('/api/admin/dashboard', adminMiddleware, (req, res) => {
    const totalUsers = db.users.length;
    const totalProducts = db.products.length;
    const totalStores = db.stores.length;
    const activeTrackedProducts = db.wishlists.length;
    const activePriceAlerts = db.priceAlerts.filter((a) => a.isActive).length;
    const totalHistoricalRecords = db.priceHistory.length;

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalStores,
        activeTrackedProducts,
        activePriceAlerts,
        totalHistoricalRecords,
        priceDropsToday: db.trackingJob.dropsDetected,
        averageSavingsPercent: 18.4,
      },
      trackingJob: db.trackingJob,
      recentLogs: db.adminLogs.slice(-10).reverse(),
      stores: db.stores,
    });
  });

  // Admin: Get users
  app.get('/api/admin/users', adminMiddleware, (req, res) => {
    const users = db.users.map(({ passwordHash: _, salt: __, ...u }) => u);
    res.json({ users });
  });

  // Admin: Update user role
  app.put('/api/admin/users/:id/role', adminMiddleware, (req, res) => {
    const { role } = req.body;
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = role === 'admin' ? 'admin' : 'customer';
    saveDatabase();
    res.json({ message: 'User role updated successfully' });
  });

  // Admin: Create Product
  app.post('/api/products', adminMiddleware, (req, res) => {
    const { name, brand, category, description, image, specifications } = req.body;
    if (!name || !brand || !category) {
      return res.status(400).json({ error: 'Name, brand, and category are required' });
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name,
      brand,
      category,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      galleryImages: [image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
      specifications: specifications || {},
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    db.products.unshift(newProd);

    // Auto-create initial demo listing
    const defaultStore = db.stores[0];
    if (defaultStore) {
      db.listings.push({
        id: `list-${Date.now()}`,
        productId: newProd.id,
        storeId: defaultStore.id,
        storeName: defaultStore.name,
        storeLogo: defaultStore.logo,
        accentColor: defaultStore.accentColor,
        storeProductUrl: defaultStore.websiteUrl,
        currentPrice: 9999,
        originalPrice: 12999,
        discountPercentage: 23,
        availability: 'in_stock',
        verificationStatus: 'DEMO_PRICE',
        dataSource: 'ADMIN_VERIFIED',
        deliveryInfo: 'Standard Delivery',
        rating: 4.5,
        reviewsCount: 1,
        lastUpdated: new Date().toISOString(),
      });
    }

    db.adminLogs.push({
      id: `log-${Date.now()}`,
      adminId: (req as any).user.id,
      adminEmail: (req as any).user.email,
      action: 'Created Product',
      targetType: 'product',
      targetId: newProd.id,
      details: `Created product "${newProd.name}" (${newProd.brand})`,
      timestamp: new Date().toISOString(),
    });

    saveDatabase();
    res.status(201).json({ product: enrichProduct(newProd), message: 'Product created successfully' });
  });

  // Admin: Update Product
  app.put('/api/products/:id', adminMiddleware, (req, res) => {
    const prod = db.products.find((p) => p.id === req.params.id);
    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, brand, category, description, image, specifications, status } = req.body;
    if (name) prod.name = name;
    if (brand) prod.brand = brand;
    if (category) prod.category = category;
    if (description !== undefined) prod.description = description;
    if (image) prod.image = image;
    if (specifications) prod.specifications = specifications;
    if (status) prod.status = status;

    saveDatabase();
    res.json({ product: enrichProduct(prod), message: 'Product updated successfully' });
  });

  // Admin: Delete Product
  app.delete('/api/products/:id', adminMiddleware, (req, res) => {
    const index = db.products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const deleted = db.products.splice(index, 1)[0];
    db.listings = db.listings.filter((l) => l.productId !== req.params.id);
    db.priceHistory = db.priceHistory.filter((h) => h.productId !== req.params.id);
    db.wishlists = db.wishlists.filter((w) => w.productId !== req.params.id);
    db.priceAlerts = db.priceAlerts.filter((a) => a.productId !== req.params.id);

    db.adminLogs.push({
      id: `log-${Date.now()}`,
      adminId: (req as any).user.id,
      adminEmail: (req as any).user.email,
      action: 'Deleted Product',
      targetType: 'product',
      targetId: req.params.id,
      details: `Deleted product "${deleted.name}"`,
      timestamp: new Date().toISOString(),
    });

    saveDatabase();
    res.json({ message: 'Product and associated listings deleted successfully' });
  });

  // Admin: Get all store listings
  app.get('/api/admin/prices', adminMiddleware, (req, res) => {
    res.json({ listings: db.listings });
  });

  // Admin: Update listing price manually
  app.post('/api/admin/prices', adminMiddleware, (req, res) => {
    const { listingId, currentPrice, originalPrice, availability, verificationStatus } = req.body;

    const listing = db.listings.find((l) => l.id === listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const prevPrice = listing.currentPrice;
    if (currentPrice !== undefined && !isNaN(Number(currentPrice))) {
      listing.currentPrice = Number(currentPrice);
    }
    if (originalPrice !== undefined && !isNaN(Number(originalPrice))) {
      listing.originalPrice = Number(originalPrice);
    }
    if (availability) listing.availability = availability;
    if (verificationStatus) listing.verificationStatus = verificationStatus;

    listing.discountPercentage = Math.round(
      ((listing.originalPrice - listing.currentPrice) / listing.originalPrice) * 100
    );
    listing.lastUpdated = new Date().toISOString();
    listing.dataSource = 'MANUAL_UPDATE';

    // Log to price history
    db.priceHistory.push({
      id: `hist-${Date.now()}`,
      productId: listing.productId,
      storeId: listing.storeId,
      storeName: listing.storeName,
      price: listing.currentPrice,
      recordedAt: new Date().toISOString(),
      isVerified: listing.verificationStatus === 'VERIFIED_LIVE',
      notes: `Admin manual update (was ₹${prevPrice})`,
    });

    db.adminLogs.push({
      id: `log-${Date.now()}`,
      adminId: (req as any).user.id,
      adminEmail: (req as any).user.email,
      action: 'Price Updated',
      targetType: 'price',
      targetId: listing.id,
      details: `Updated ${listing.storeName} listing price to ₹${listing.currentPrice}`,
      timestamp: new Date().toISOString(),
    });

    evaluateAlertsForProduct(listing.productId);
    saveDatabase();

    res.json({ listing, message: 'Price updated and alerts evaluated' });
  });

  // Admin: Stores CRUD
  app.post('/api/stores', adminMiddleware, (req, res) => {
    const { name, websiteUrl, accentColor, logo } = req.body;
    if (!name || !websiteUrl) {
      return res.status(400).json({ error: 'Store name and website URL are required' });
    }

    const newStore: Store = {
      id: `store-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      logo: logo || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=128&auto=format&fit=crop&q=80',
      accentColor: accentColor || '#FFD43B',
      websiteUrl,
      status: 'active',
      adapterStatus: 'connected',
      lastSync: new Date().toISOString(),
    };

    db.stores.push(newStore);
    saveDatabase();
    res.status(201).json({ store: newStore, message: 'Store added successfully' });
  });

  // Admin: Platform Settings
  app.get('/api/admin/settings', adminMiddleware, (req, res) => {
    res.json({ settings: db.settings });
  });

  app.put('/api/admin/settings', adminMiddleware, (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    db.trackingJob.intervalMinutes = db.settings.trackingIntervalMinutes;
    saveDatabase();
    res.json({ settings: db.settings, message: 'Platform settings saved' });
  });

  // Manual Trigger: Run periodic price tracking check right now
  app.post('/api/tracking/run-now', adminMiddleware, (req, res) => {
    const result = runPriceTrackingCycle();
    res.json({
      message: 'Tracking scan cycle executed successfully',
      result,
      trackingJob: db.trackingJob,
    });
  });

  app.get('/api/tracking/status', (req, res) => {
    res.json({ trackingJob: db.trackingJob });
  });

  // -------------------------------------------------------------
  // VITE DEV MIDDLEWARE INTEGRATION (or static files in production)
  // -------------------------------------------------------------
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || hasDist;

  if (isProduction && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PriceTrack Full-Stack Platform running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
