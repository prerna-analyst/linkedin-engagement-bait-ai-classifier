import {
  User,
  Product,
  Category,
  Store,
  StoreListing,
  PriceHistoryRecord,
  WishlistItem,
  PriceAlert,
  NotificationItem,
  TrackingJob,
  PlatformSettings,
} from '../types/index.ts';

const TOKEN_KEY = 'pricetrack_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(data: Partial<User>): Promise<{ user: User; message: string }> {
    return request<{ user: User; message: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout() {
    setStoredToken(null);
  },

  // Products
  async getProducts(params?: {
    query?: string;
    category?: string;
    brand?: string;
    store?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const qs = searchParams.toString();
    return request<{ products: Product[]; total: number; page: number; totalPages: number }>(
      `/api/products${qs ? `?${qs}` : ''}`
    );
  },

  async getProduct(id: string): Promise<{
    product: Product;
    statistics: {
      lowestRecordedPrice: number;
      highestRecordedPrice: number;
      averageRecordedPrice: number;
      totalHistoricalPoints: number;
    };
  }> {
    return request(`/api/products/${id}`);
  },

  async compareProduct(id: string): Promise<{
    product: Product;
    listings: StoreListing[];
    cheapestListing: StoreListing;
    maxSavings: number;
    comparisonCount: number;
    timestamp: string;
  }> {
    return request(`/api/products/${id}/compare`);
  },

  async getPriceHistory(id: string, range: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{
    records: PriceHistoryRecord[];
    range: string;
  }> {
    return request(`/api/products/${id}/price-history?range=${range}`);
  },

  // Categories & Stores
  async getCategories(): Promise<{ categories: Category[] }> {
    return request<{ categories: Category[] }>('/api/categories');
  },

  async getStores(): Promise<{ stores: Store[] }> {
    return request<{ stores: Store[] }>('/api/stores');
  },

  // Deals
  async getDeals(): Promise<{
    bestDeals: Product[];
    trending: Product[];
    recentDrops: PriceHistoryRecord[];
  }> {
    return request('/api/deals');
  },

  // Wishlist
  async getWishlist(): Promise<{ wishlist: WishlistItem[] }> {
    return request('/api/wishlist');
  },

  async addToWishlist(productId: string, targetPrice?: number): Promise<{ item: WishlistItem; message: string }> {
    return request('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId, targetPrice }),
    });
  },

  async removeFromWishlist(id: string): Promise<{ message: string }> {
    return request(`/api/wishlist/${id}`, {
      method: 'DELETE',
    });
  },

  // Price Alerts
  async getAlerts(): Promise<{ alerts: PriceAlert[] }> {
    return request('/api/alerts');
  },

  async createAlert(productId: string, targetPrice: number): Promise<{ alert: PriceAlert; message: string }> {
    return request('/api/alerts', {
      method: 'POST',
      body: JSON.stringify({ productId, targetPrice }),
    });
  },

  async updateAlert(id: string, data: { targetPrice?: number; isActive?: boolean }): Promise<{ alert: PriceAlert; message: string }> {
    return request(`/api/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAlert(id: string): Promise<{ message: string }> {
    return request(`/api/alerts/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    return request('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean; message: string }> {
    return request('/api/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Admin
  async getAdminDashboard(): Promise<any> {
    return request('/api/admin/dashboard');
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return request('/api/admin/users');
  },

  async updateAdminUserRole(id: string, role: string): Promise<{ message: string }> {
    return request(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async createProduct(data: Partial<Product>): Promise<{ product: Product; message: string }> {
    return request('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<{ product: Product; message: string }> {
    return request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    return request(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminPrices(): Promise<{ listings: StoreListing[] }> {
    return request('/api/admin/prices');
  },

  async updateListingPrice(data: {
    listingId: string;
    currentPrice?: number;
    originalPrice?: number;
    availability?: string;
    verificationStatus?: string;
  }): Promise<{ listing: StoreListing; message: string }> {
    return request('/api/admin/prices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createStore(data: Partial<Store>): Promise<{ store: Store; message: string }> {
    return request('/api/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAdminSettings(): Promise<{ settings: PlatformSettings }> {
    return request('/api/admin/settings');
  },

  async updateAdminSettings(settings: Partial<PlatformSettings>): Promise<{ settings: PlatformSettings; message: string }> {
    return request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async triggerTrackingScan(): Promise<{ message: string; result: any; trackingJob: TrackingJob }> {
    return request('/api/tracking/run-now', {
      method: 'POST',
    });
  },

  async getTrackingStatus(): Promise<{ trackingJob: TrackingJob }> {
    return request('/api/tracking/status');
  },
};
