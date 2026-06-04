# Uniblox Store — Take-Home Assignment

A small e-commerce demo with an **Express + TypeScript** API (in-memory persistence) and a **React + Bootstrap 5** storefront. Supports cart checkout, nth-order coupon generation, product-scoped discount codes, admin analytics, and order fulfillment status.

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm 10+**

## Quick start

From the repository root:

```bash
# Install dependencies (backend + frontend)
npm run install:all

# Start API (port 3000) and Vite (port 5174) together
npm run dev
```

Open **http://localhost:5174**

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:5174 |
| Backend  | http://localhost:3000 |
| Health   | http://localhost:3000/health |

### Run separately (optional)

```bash
npm run dev:api   # backend only
npm run dev:web   # frontend only (API must be running on :3000)
```

## Project structure

```
backend/     Express API, in-memory store, unit tests
frontend/    Vite + React UI, proxies /api → :3000
DECISIONS.md Design choices and trade-offs
```

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/catalog/products` | List active products |
| POST | `/api/customer/cart/items` | Add item `{ cartId, productId, quantity }` |
| GET | `/api/customer/cart/:cartId` | Get cart |
| POST | `/api/customer/cart/preview-coupon` | Preview discount `{ cartId, couponCode }` |
| POST | `/api/customer/cart/checkout` | Checkout `{ cartId, couponCode? }` |
| GET | `/api/admin/statistics` | Dashboard metrics |
| GET | `/api/admin/discount-codes` | List coupons |
| POST | `/api/admin/discount-codes` | Create coupon `{ productId, percentage }` |
| POST | `/api/admin/discount-codes/generate` | Nth-order rule `{ orderNumber }` |
| GET | `/api/admin/orders` | List orders |
| PATCH | `/api/admin/orders/:orderId/status` | Update `{ deliveryStatus }` |

**Delivery status:** `pending` | `out_for_shipment` | `delivered`

## Discount rules

1. **Nth-order coupon** — Every **3rd** completed order generates a **10%** cart-wide coupon (`SAVE-XXXXXXXX`). Configured in `backend/src/routes/index.ts`.
2. **Admin coupons** — Create a code for a **specific product** and **percentage** (1–99). Discount applies only to matching line items in the cart.
3. **Checkout** — Optional `couponCode`; each code is **single-use**.

## Tests

```bash
cd backend && npm test
```

## Production build

```bash
cd frontend && npm run build
cd backend && npm run build && npm start
```

## Design documentation

See **[DECISIONS.md](./DECISIONS.md)** for architecture and trade-off notes.
