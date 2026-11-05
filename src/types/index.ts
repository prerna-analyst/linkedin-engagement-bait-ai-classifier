export type Role = 'customer' | 'admin';

export type Availability = 'in_stock' | 'out_of_stock' | 'limited_stock';

export type VerificationStatus = 'VERIFIED_LIVE' | 'DEMO_PRICE' | 'UNAVAILABLE';

export type DataSource = 'API_FEED' | 'ADMIN_VERIFIED' | 'STORE_CRAWLER' | 'MANUAL_UPDATE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  preferredStores?: string[];
  currency?: string;
  emailNotifications?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  productCount?: number;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string;
  accentColor: string;
  websiteUrl: string;
  status: 'active' | 'inactive';
  adapterStatus: 'connected' | 'demo' | 'error';
  lastSync?: string;
}

export interface StoreListing {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  storeLogo: string;
  accentColor: string;
  storeProductUrl: string;
  currentPrice: number;
  originalPrice: number;
  discountPercentage: number;
  availability: Availability;
  verificationStatus: VerificationStatus;
  dataSource: DataSource;
  deliveryInfo: string;
  rating: number;
  reviewsCount: number;
  lastUpdated: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  galleryImages: string[];
  specifications: Record<string, string>;
  createdAt: string;
  status: 'active' | 'archived';
  // Computed price metadata across listings
  lowestPrice?: number;
  highestPrice?: number;
  cheapestStore?: string;
  cheapestStoreId?: string;
  discountPercentage?: number;
  listingsCount?: number;
  listings?: StoreListing[];
}

export interface PriceHistoryRecord {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  price: number;
  recordedAt: string;
  isVerified: boolean;
  notes?: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  targetPrice?: number;
  addedAt: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  targetPrice: number;
  currentPriceAtCreation: number;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  createdAt: string;
  lastCheckedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'price_drop' | 'target_reached' | 'system' | 'welcome';
  productId?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  priceDifference?: number;
}

export interface TrackingJob {
  jobId: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  intervalMinutes: number;
  lastRun: string;
  nextRun: string;
  itemsChecked: number;
  dropsDetected: number;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'product' | 'price' | 'store' | 'user' | 'alert' | 'settings';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface PlatformSettings {
  trackingIntervalMinutes: number;
  currency: string;
  currencySymbol: string;
  marketSimulationMode: 'live' | 'demo' | 'hybrid';
  emailAlertsEnabled: boolean;
  smtpServer: string;
  smtpPort: number;
  senderEmail: string;
  priceDropNotificationThreshold: number; // percentage drop
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalStores: number;
  activeTrackedProducts: number;
  activePriceAlerts: number;
  totalHistoricalRecords: number;
  priceDropsToday: number;
  averageSavingsPercent: number;
}
