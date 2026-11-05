-- =====================================================================
-- PRICETRACK DATABASE ARCHITECTURE (MySQL 8.0+)
-- Relational Schema with Constraints, Foreign Keys, Indexes & Triggers
-- =====================================================================

CREATE DATABASE IF NOT EXISTS pricetrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pricetrack_db;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL DEFAULT 1,
    avatar_url VARCHAR(500),
    currency VARCHAR(10) DEFAULT 'INR',
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON users(email);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Tag',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_categories_slug ON categories(slug);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    gallery_images JSON,
    specifications JSON,
    status ENUM('active', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category_id);
CREATE FULLTEXT INDEX idx_products_search ON products(name, brand, description);

-- 5. STORES TABLE
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(500) NOT NULL,
    accent_color VARCHAR(20) DEFAULT '#FFD43B',
    website_url VARCHAR(500) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    adapter_status ENUM('connected', 'demo', 'error') DEFAULT 'connected',
    last_sync_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. PRODUCT STORE LISTINGS TABLE
CREATE TABLE IF NOT EXISTS product_store_listings (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    store_id VARCHAR(36) NOT NULL,
    store_product_url VARCHAR(1000) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
        ROUND(((original_price - current_price) / original_price) * 100, 2)
    ) STORED,
    availability ENUM('in_stock', 'out_of_stock', 'limited_stock') DEFAULT 'in_stock',
    verification_status ENUM('VERIFIED_LIVE', 'DEMO_PRICE', 'UNAVAILABLE') DEFAULT 'VERIFIED_LIVE',
    data_source ENUM('API_FEED', 'ADMIN_VERIFIED', 'STORE_CRAWLER', 'MANUAL_UPDATE') DEFAULT 'API_FEED',
    delivery_info VARCHAR(255) DEFAULT 'Standard Delivery',
    rating DECIMAL(3, 2) DEFAULT 4.5,
    reviews_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_product_store (product_id, store_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_listings_price ON product_store_listings(current_price);
CREATE INDEX idx_listings_verification ON product_store_listings(verification_status);

-- 7. PRICE HISTORY TABLE
CREATE TABLE IF NOT EXISTS price_history (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    store_id VARCHAR(36) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    notes VARCHAR(255),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_history_product_date ON price_history(product_id, recorded_at);
CREATE INDEX idx_history_store_date ON price_history(store_id, recorded_at);

-- 8. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS wishlists (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    target_price DECIMAL(10, 2) NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_product_wishlist (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. PRICE ALERTS TABLE
CREATE TABLE IF NOT EXISTS price_alerts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    target_price DECIMAL(10, 2) NOT NULL,
    current_price_at_creation DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP NULL,
    last_checked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_alerts_active ON price_alerts(is_active, is_triggered);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('price_drop', 'target_reached', 'system', 'welcome') DEFAULT 'price_drop',
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    price_difference DECIMAL(10, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_notif_user_unread ON notifications(user_id, is_read);

-- 11. TRACKING JOBS TABLE (APScheduler audit & monitoring)
CREATE TABLE IF NOT EXISTS tracking_jobs (
    job_id VARCHAR(50) PRIMARY KEY,
    status ENUM('idle', 'running', 'success', 'failed') DEFAULT 'idle',
    interval_minutes INT DEFAULT 15,
    last_run TIMESTAMP NULL,
    next_run TIMESTAMP NULL,
    items_checked INT DEFAULT 0,
    drops_detected INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 12. ADMIN LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_logs (
    id VARCHAR(36) PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL,
    admin_email VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type ENUM('product', 'price', 'store', 'user', 'alert', 'settings') NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
