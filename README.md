# PriceTrack

> **Track Prices. Compare Smarter. Save More.**  
> A Commercial-Grade Full-Stack E-Commerce Price Comparison and Price Tracking Platform.

---

## 🌟 Executive Summary

PriceTrack solves a fundamental consumer challenge: online shoppers routinely overpay due to artificial price inflation, deceptive sale strikes, and rapid fluctuations across retailers. 

PriceTrack continuously monitors verified product listings across **Amazon India**, **Flipkart**, **Croma Retail**, and **Reliance Digital**, stores granular historical audit records, computes the mathematically lowest available price, and notifies users the moment prices match their custom target thresholds.

### 🚫 Strict Deterministic Engineering Standard
PriceTrack adheres to traditional software architecture principles:
- **Zero Generative AI Hallucinations**: Real verified retailer prices, moving mathematical averages, and relational SQL queries.
- **Relational Consistency**: 12 normalized database tables with strict foreign keys and audit logging.
- **Scheduled Tracking Tasks**: Automated background intervals via APScheduler / cron jobs.

---

## 🏗️ Technology Architecture

```
PriceTrack/
├── frontend/               # React 19 + Vite + Tailwind CSS + Chart.js
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ProductCard, PriceHistoryChart, SetAlertModal, Toast
│   │   ├── context/        # Auth, Wishlist, Alerts, Notifications
│   │   ├── pages/          # 25 Complete public, customer & admin pages
│   │   ├── services/       # REST API client
│   │   ├── types/          # TypeScript domain interfaces
│   │   └── data/           # Seed datasets & schema
├── backend/                # Python 3 + Flask + Flask-SQLAlchemy + APScheduler
│   ├── app.py              # Flask application entry point
│   ├── config.py           # Database & JWT configurations
│   ├── requirements.txt    # Python dependencies
│   ├── models/             # Relational ORM models
│   ├── routes/             # RESTful API route blueprints
│   └── services/           # Tracker engine & alert evaluator
├── database/               # Relational Database Architecture
│   ├── schema.sql          # MySQL 8.0 DDL (12 Normalized Tables & Constraints)
│   └── seed_data.sql       # Realistic seed data for Indian e-commerce
├── tests/                  # Pytest backend test suites
└── server.ts               # Full-Stack live runtime server mounted with Vite & API routes
```

---

## 🚀 Live Demo & Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Lead Administrator** | `admin@pricetrack.com` | `admin123` | Full admin console, catalog CRUD, store & price management, scheduler trigger |
| **Verified Customer** | `customer@pricetrack.com` | `customer123` | Custom price alerts, saved wishlist, dashboard, notifications |

*Note: You can also use the **1-Click Demo Switcher** located directly on the top banner of the application to test both customer and administrator workflows instantly!*

---

## 📊 Relational Database Architecture (12 Tables)

The database schema (`/database/schema.sql`) contains:
1. `roles`: Role definitions (Customer, Administrator).
2. `users`: PBKDF2/SHA-512 password hashes, session tokens, notification preferences.
3. `categories`: E-commerce categories with slug indexes.
4. `products`: Multi-store hardware specifications, brand metadata, and image links.
5. `stores`: Retail store registry (Amazon, Flipkart, Croma, Reliance Digital) with adapter states.
6. `product_store_listings`: Store-specific URLs, current prices, original MSRP, stock status, verification labels (`VERIFIED_LIVE`, `DEMO_PRICE`).
7. `price_history`: Multi-month chronological price records for Chart.js analytics.
8. `wishlists`: User-saved products with target price monitoring.
9. `price_alerts`: Active target-price thresholds and trigger states.
10. `notifications`: In-app notification center logs with read/unread statuses.
11. `tracking_jobs`: Periodic scheduler audit trail, last run time, next run time, drops detected.
12. `admin_logs`: Complete administrative audit trail for price adjustments.

---

## ⚡ Quickstart Guide

### 1. Live Web Server (Node.js + Express + Vite dev server)
The application runs natively on port `3000`:
```bash
npm install
npm run dev
```

### 2. Standalone Python Flask + MySQL Backend
To deploy the Python backend independently:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Import database schema into MySQL
mysql -u root -p < ../database/schema.sql
mysql -u root -p < ../database/seed_data.sql

# Start Flask API server
python app.py
```

### 3. Run Backend Test Suite
```bash
pytest tests/backend/test_api.py -v
```

---

## 🛡️ Security & Integrity Highlights
- **No Plaintext Passwords**: Cryptographic key derivation with salts.
- **Role-Based Access Control (RBAC)**: Protected admin routes preventing privilege escalation.
- **Duplicate Prevention**: Unique relational constraints on email and user wishlists.
- **Verification Badging**: Explicit visual markers distinguishing *Verified Live Price* from *Demonstration Price*.
