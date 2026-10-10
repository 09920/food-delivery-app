# OFDS - Online Food Delivery System

A complete, production-grade **Online Food Delivery System (OFDS)** built with Next.js App Router, TypeScript (strict mode), Tailwind CSS, Prisma ORM, and Razorpay.

The platform provides a responsive, PWA-installable web application supporting four primary user roles:
1. **Customer** (Browsing, search, single-restaurant cart, coupon engine, Razorpay checkout, live order tracking with simulated GPS radar, doorstep OTP delivery verification, ratings & verified reviews, support dispute tickets).
2. **Restaurant Staff** (Kitchen live order management, real-time status transitions: `Accepted` → `Preparing` → `Ready`, menu dish CRUD, stock in/out toggle, restaurant open/close switch, sales metrics, CSV export).
3. **Delivery Rider** (Online/Offline status toggle, incoming trip assignments, pickup and drop addresses, active delivery progress, GPS location ping emitter, doorstep 4-digit OTP verification).
4. **Platform Administrator** (Gross Order Value & Commission KPI metrics, order monitor, restaurant FSSAI verification & approval queue, rider management, dispute resolution, audit trail, report exports).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm `v9+` or `v10+` or `v11+`

### 1. Installation
```powershell
npm.cmd install
```

### 2. Database Sync & Seeding
The project is configured out-of-the-box with SQLite (`dev.db`) for immediate zero-dependency local development, and includes a production-ready PostgreSQL schema (`prisma/schema.postgresql.prisma`) for Neon / Railway deployments.

```powershell
# Sync database schema
npx.cmd prisma db push

# Populate with realistic Indian restaurants, dishes, coupons, orders, and 4-role users
npm.cmd run seed
```

### 3. Run Automated Tests
```powershell
npm.cmd test
```
*Executes all 10 unit & integration tests covering integer paise calculations, least-privilege permissions, state machine transitions, Razorpay signature validation, and OTP verification.*

### 4. Run Next.js Development Server
```powershell
npm.cmd run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎭 Persona Switcher (Instant Testing Across All 4 Roles)

You can instantly switch between roles at any time using the **top-right role switcher dropdown** in the navigation bar:

| Role | Persona Name | Default Credentials / Context | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | Rahul Sharma | `rahul@example.com` | Browse menus, apply coupons (`FIRST50`), place orders, view live tracking, OTP, reviews |
| **Customer** | Priya Patel | `priya@example.com` | Alternative customer persona with saved addresses |
| **Restaurant Staff** | Vikram Singhania | `vikram@royalspice.com` | Owner of **Royal Spice Kitchen**; Accept orders, cooking timers, menu manager |
| **Restaurant Staff** | Chef Lin Mei | `lin@dragonwok.com` | Manager of **Dragon Wok & Bao** |
| **Delivery Rider** | Amit Kumar | `amit.rider@example.com` | Motorcycle partner; Live GPS pings, pickup orders, verify customer delivery OTP |
| **Platform Admin** | Sanjay Mehra | `admin@ofds-platform.com` | Super Admin; GOV analytics, restaurant approvals, dispute resolution, audit log |

---

## 💳 Payment Gateway (Razorpay)

- **Test Mode Active:** Simulated signatures and order creation are integrated into `/api/payments/razorpay/verify`.
- **Paise Currency:** Financial transactions are strictly processed in integer paise (e.g. ₹299.00 = `29900`), avoiding floating-point rounding errors.
- **Auto-Refund Engine:** Orders rejected by restaurants or cancelled during the grace period automatically generate audit refund records and update payment status to `REFUNDED`.

---

## 📱 Progressive Web App (PWA)

- **Manifest:** Accessible at `/manifest.json`.
- **Installable:** Meets PWA installability requirements on Chromium, Android, and iOS.
- **Offline Banner:** Detects network disconnection and displays a cached-state warning.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router) with React 19
- **Architecture:** Modular Monolith (`src/modules/{cart, orders, payments, delivery, menus}`)
- **Database:** Prisma ORM with SQLite (local) & PostgreSQL (Neon / Railway production)
- **State Machine:** Validated transitions (`PLACED` → `ACCEPTED` → `PREPARING` → `READY` → `PICKED_UP` → `DELIVERED`)
- **Real-Time:** Server-Sent Events (`/api/realtime/order-stream`) with polling fallback
- **Styling:** Tailwind CSS with custom responsive design system
