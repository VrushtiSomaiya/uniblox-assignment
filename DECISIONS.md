# Design Decisions

This document records intentional choices for the Uniblox take-home assignment. The goal is to show *why* the system is shaped the way it is—not only that it works.

---

## Decision: In-memory persistence instead of a database

**Context:** The assignment allows an in-memory store. We still need carts, orders, coupons, and statistics to behave consistently during a demo session.

**Options Considered:**
- Option A: In-memory Maps in a single `InMemoryStore` singleton
- Option B: SQLite or PostgreSQL with migrations
- Option C: JSON file persistence on disk

**Choice:** Option A — centralized in-memory store with repository interfaces.

**Why:** Fastest path to a working API with clear layering. Repositories mirror what a real DB adapter would look like, so swapping to Postgres later is straightforward. No migration or Docker overhead for reviewers. Trade-off: all data resets on server restart, which is acceptable for a take-home demo.

---

## Decision: Client-supplied `cartId` (no session auth)

**Context:** Customers add items and checkout without login. We still need a stable cart identity across requests.

**Options Considered:**
- Option A: Server-generated session cookie with anonymous cart
- Option B: Client generates `cartId` (UUID) and sends it on every request; persisted in `localStorage`
- Option C: Single global cart for the whole app

**Choice:** Option B.

**Why:** Keeps the API stateless and easy to test with curl or Postman. The frontend `CartContext` stores `cartId` in `localStorage`, so refresh preserves the cart. Trade-off: anyone who knows a `cartId` can read that cart—fine for this scope; production would use signed tokens or server sessions.

---

## Decision: Nth-order coupon generation tied to a monotonic order counter

**Context:** Requirement: every nth order earns an x% discount code; codes are applied at a later checkout.

**Options Considered:**
- Option A: Use `statistics.totalOrders` to decide generation
- Option B: Dedicated `orderCounter` incremented once per successful checkout
- Option C: Generate coupon only via admin manual trigger

**Choice:** Option B, with admin manual trigger reusing the same rule for testing.

**Why:** `totalOrders` and coupon generation stay aligned—one increment per checkout, one place to apply `orderNumber % nthOrderThreshold === 0`. Default config: every **3rd** order, **10%** off (`nthOrderThreshold: 3`, `couponPercentage: 10` in `routes/index.ts`). Trade-off: admin “generate for order #N” does not create a real order but uses the same divisibility rule for demos.

---

## Decision: Product-scoped vs cart-wide coupons

**Context:** Auto-generated nth-order coupons should apply broadly; admin-created coupons should target a product (e.g. iPhone-only).

**Options Considered:**
- Option A: All coupons always discount full cart subtotal
- Option B: Optional `productId` on `DiscountCode`; discount only on matching line totals
- Option C: Separate coupon types with different APIs

**Choice:** Option B — optional `productId`; missing means cart-wide.

**Why:** Matches the business rule “coupon for iPhone must not reduce MacBook price.” `calculateDiscountForCart` computes `eligibleSubtotal` from matching lines only and rejects apply/preview if the product is not in the cart. Trade-off: slightly more UI and test surface; much clearer behavior for reviewers.

---

## Decision: Coupon preview endpoint before checkout (no side effects)

**Context:** Users should see savings before paying; checkout must not burn a coupon on a failed or abandoned attempt.

**Options Considered:**
- Option A: Only apply discount inside `POST /checkout` (no preview)
- Option B: `POST /preview-coupon` validates and returns breakdown without marking used
- Option C: Client-side math copying server rules

**Choice:** Option B.

**Why:** Single source of truth for discount math on the server; frontend shows subtotal, eligible amount, per-line savings, and total. Checkout calls the same calculation then `markCouponAsUsed`. Trade-off: extra round trip; better UX and fewer surprises.

---

## Decision: React + Bootstrap with a thin custom design system (no MUI/Ant)

**Context:** Frontend should look polished but stay lightweight and easy to maintain for a take-home.

**Options Considered:**
- Option A: Full component library (MUI, Chakra, Ant Design)
- Option B: Bootstrap 5 + CSS variables and a small set of custom classes
- Option C: Tailwind CSS

**Choice:** Option B.

**Why:** Bootstrap gives responsive grid, forms, and navbar with minimal setup. Custom tokens in `design-system.css` deliver a stationery-inspired look without learning a heavy library API. Trade-off: more custom CSS than a kit; still far less bundle and complexity than MUI.

---

## Decision: Product images as static SVG assets in `frontend/public`

**Context:** Catalog cards need visuals; backend is product-agnostic JSON.

**Options Considered:**
- Option A: `imageUrl` pointing to external CDN (Unsplash)
- Option B: Store image bytes in API / database
- Option C: `imageUrl` paths served from `frontend/public/products/*.svg`

**Choice:** Option C — `imageUrl` on each seeded product (e.g. `/products/notebook.svg`).

**Why:** Works offline, no CORS or hotlink issues in demos. API stays a simple field; Vite serves files as-is. SVG placeholders match the calm visual style without licensing photos. Trade-off: not real product photography; easy to swap URLs later.

---

## Decision: Order fulfillment as a simple status enum on `Order`

**Context:** Admin needs to see orders and mark delivery progress (not delivered / out for shipment / delivered).

**Options Considered:**
- Option A: Separate shipment tracking table with events
- Option B: Single `deliveryStatus` field on `Order` with PATCH update
- Option C: No fulfillment model

**Choice:** Option B.

**Why:** Enough for the assignment’s admin orders page and tab filters. New orders start as `pending` (shown as “Not Delivered” in UI). Trade-off: no carrier integration or history log; acceptable scope.
