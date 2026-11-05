-- =====================================================================
-- PRICETRACK INITIAL SEED DATA (MySQL 8.0+)
-- =====================================================================

USE pricetrack_db;

-- ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'customer', 'Registered Shopper with tracking, wishlist, and alert privileges'),
(2, 'administrator', 'Platform Administrator with store, pricing, and system management');

-- USERS (Password for admin: admin123, for customer: customer123 - Argon2/PBKDF2/SHA256 hashed)
INSERT INTO users (id, name, email, password_hash, role_id, avatar_url, currency) VALUES
('usr-admin-1', 'Alexander Vance (Lead Admin)', 'admin@pricetrack.com', 'scrypt:32768:8:1$k8L9a1Z$89ab10f9e31d4d38ac5db3b9e4a3b7d12a690e76fb21c5f3c92849b2ef329124', 2, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80', 'INR'),
('usr-cust-1', 'Prerna Garg', 'prerna@example.com', 'scrypt:32768:8:1$k8L9a1Z$89ab10f9e31d4d38ac5db3b9e4a3b7d12a690e76fb21c5f3c92849b2ef329124', 1, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&auto=format&fit=crop&q=80', 'INR'),
('usr-cust-2', 'Rahul Sharma', 'rahul@example.com', 'scrypt:32768:8:1$k8L9a1Z$89ab10f9e31d4d38ac5db3b9e4a3b7d12a690e76fb21c5f3c92849b2ef329124', 1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80', 'INR');

-- CATEGORIES
INSERT INTO categories (id, name, slug, description, icon_name) VALUES
('cat-1', 'Mobiles & Tablets', 'mobiles', 'Smartphones, flagships, and tablets', 'Smartphone'),
('cat-2', 'Laptops & Computers', 'laptops', 'Ultrabooks, gaming rigs, and work machines', 'Laptop'),
('cat-3', 'Audio & Headphones', 'audio', 'Noise cancelling headphones, TWS earbuds, and speakers', 'Headphones'),
('cat-4', 'Wearables & Smartwatches', 'wearables', 'Fitness bands and luxury smartwatches', 'Watch'),
('cat-5', 'Home Appliances', 'appliances', 'Smart TVs, vacuum cleaners, and kitchen tech', 'Tv'),
('cat-6', 'Gaming Consoles', 'gaming', 'PlayStation, Xbox, and gaming peripherals', 'Gamepad2');

-- STORES
INSERT INTO stores (id, name, slug, logo_url, accent_color, website_url, status, adapter_status) VALUES
('store-amazon', 'Amazon India', 'amazon', 'https://images.unsplash.com/photo-1523474253246-6302e1a2f64f?w=128&auto=format&fit=crop&q=80', '#FF9900', 'https://www.amazon.in', 'active', 'connected'),
('store-flipkart', 'Flipkart', 'flipkart', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=128&auto=format&fit=crop&q=80', '#2874F0', 'https://www.flipkart.com', 'active', 'connected'),
('store-croma', 'Croma Retail', 'croma', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=128&auto=format&fit=crop&q=80', '#00E9BF', 'https://www.croma.com', 'active', 'demo'),
('store-reliance', 'Reliance Digital', 'reliance', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=128&auto=format&fit=crop&q=80', '#E42529', 'https://www.reliancedigital.in', 'active', 'demo');

-- PRODUCTS
INSERT INTO products (id, category_id, name, brand, description, image_url, specifications, status) VALUES
('prod-1', 'cat-1', 'Apple iPhone 16 Pro (128GB, Natural Titanium)', 'Apple', 'Forged in titanium with A18 Pro chip, 48MP Fusion camera system, and all-day battery life.', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80', '{"Display": "6.3-inch Super Retina XDR OLED 120Hz", "Processor": "A18 Pro", "Storage": "128GB", "Camera": "48MP Triple"}', 'active'),
('prod-2', 'cat-3', 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', 'Sony', 'Industry-leading noise cancellation optimized with two processors and eight microphones.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', '{"Driver": "30mm", "Battery": "30 Hours ANC", "Bluetooth": "5.2 LDAC", "Weight": "250g"}', 'active'),
('prod-3', 'cat-2', 'Apple MacBook Air 13-inch M3 (16GB RAM, 512GB SSD)', 'Apple', 'Supercharged by Apple M3 chip with liquid retina display and silent fanless design.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', '{"Processor": "Apple M3 8-core", "RAM": "16GB Unified", "Storage": "512GB NVMe", "Battery": "18 Hours"}', 'active'),
('prod-4', 'cat-4', 'Samsung Galaxy Watch 6 Classic (47mm, Bluetooth & LTE)', 'Samsung', 'Rotating physical bezel, sapphire crystal screen, and comprehensive BioActive body sensor.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', '{"Screen": "1.5-inch Super AMOLED", "Case": "Stainless Steel", "Sensors": "ECG + Optical + BIA", "Water": "5ATM IP68"}', 'active');

-- PRODUCT STORE LISTINGS
INSERT INTO product_store_listings (id, product_id, store_id, store_product_url, current_price, original_price, availability, verification_status, data_source, delivery_info, rating, reviews_count) VALUES
('list-1', 'prod-1', 'store-amazon', 'https://www.amazon.in/dp/B0CHX1W1XY', 119900.00, 129900.00, 'in_stock', 'VERIFIED_LIVE', 'API_FEED', 'FREE Prime One-Day Delivery', 4.7, 1420),
('list-2', 'prod-1', 'store-flipkart', 'https://www.flipkart.com/apple-iphone-16-pro', 118499.00, 129900.00, 'in_stock', 'VERIFIED_LIVE', 'API_FEED', 'Free Delivery by Tomorrow', 4.8, 980),
('list-3', 'prod-1', 'store-croma', 'https://www.croma.com/apple-iphone-16-pro', 121900.00, 129900.00, 'in_stock', 'DEMO_PRICE', 'ADMIN_VERIFIED', 'Express Store Pickup in 2 Hours', 4.6, 310),
('list-5', 'prod-2', 'store-amazon', 'https://www.amazon.in/dp/B09XS7JWHH', 24990.00, 34990.00, 'in_stock', 'VERIFIED_LIVE', 'API_FEED', 'FREE Delivery by Tomorrow', 4.6, 5200),
('list-6', 'prod-2', 'store-flipkart', 'https://www.flipkart.com/sony-wh-1000xm5', 26490.00, 34990.00, 'in_stock', 'VERIFIED_LIVE', 'API_FEED', 'Free Delivery by Friday', 4.5, 3800),
('list-7', 'prod-2', 'store-croma', 'https://www.croma.com/sony-wh-1000xm5', 24490.00, 34990.00, 'in_stock', 'VERIFIED_LIVE', 'STORE_CRAWLER', 'Store Pickup Available', 4.7, 1100);

-- PRICE HISTORY (Multi-day audit snapshots)
INSERT INTO price_history (id, product_id, store_id, price, is_verified, notes, recorded_at) VALUES
('h-1', 'prod-2', 'store-croma', 29990.00, TRUE, 'Initial listing scan', NOW() - INTERVAL 30 DAY),
('h-2', 'prod-2', 'store-croma', 27490.00, TRUE, 'Weekly automated price check', NOW() - INTERVAL 15 DAY),
('h-3', 'prod-2', 'store-croma', 25990.00, TRUE, 'Weekend promotional discount', NOW() - INTERVAL 5 DAY),
('h-4', 'prod-2', 'store-croma', 24490.00, TRUE, 'Verified Lowest Price recorded', NOW()),
('h-5', 'prod-1', 'store-flipkart', 124900.00, TRUE, 'Launch retail scan', NOW() - INTERVAL 45 DAY),
('h-6', 'prod-1', 'store-flipkart', 121900.00, TRUE, 'Periodic audit', NOW() - INTERVAL 20 DAY),
('h-7', 'prod-1', 'store-flipkart', 118499.00, TRUE, 'Festival flash sale drop', NOW());

-- PRICE ALERTS
INSERT INTO price_alerts (id, user_id, product_id, target_price, current_price_at_creation, is_active, is_triggered) VALUES
('alt-1', 'usr-cust-1', 'prod-2', 25000.00, 26490.00, TRUE, TRUE),
('alt-2', 'usr-cust-1', 'prod-1', 115000.00, 119900.00, TRUE, FALSE);

-- NOTIFICATIONS
INSERT INTO notifications (id, user_id, product_id, title, message, type, is_read, price_difference) VALUES
('notif-1', 'usr-cust-1', 'prod-2', 'Target Price Reached! 🎉', 'Sony WH-1000XM5 just dropped to ₹24,490 on Croma (your target was ₹25,000)!', 'target_reached', FALSE, 510.00);

-- TRACKING JOBS
INSERT INTO tracking_jobs (job_id, status, interval_minutes, last_run, next_run, items_checked, drops_detected) VALUES
('job-scheduler-main', 'idle', 15, NOW(), NOW() + INTERVAL 15 MINUTE, 20, 3);
