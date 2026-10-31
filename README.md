# ShopSphere — Full-stack e-commerce application

A responsive React storefront and Express/MongoDB API starter with product browsing, search, category filters, persistent cart, JWT authentication, demo checkout, order history, and an admin product/order workspace.

## Requirements
- Node.js 20 or newer
- MongoDB local instance or MongoDB Atlas

## Setup

1. Copy environment examples:
   - `server/.env.example` → `server/.env`
   - `client/.env.example` → `client/.env`
2. Put your MongoDB connection URI and a long random `JWT_SECRET` in `server/.env`.
3. From the project root run:

   ```bash
   npm install
   npm --prefix client install
   npm --prefix server install
   ```

4. Seed demo products:

   ```bash
   npm --prefix server run seed
   ```

5. Start frontend and backend together:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:5173`. API health check: `http://localhost:5000/api/health`.

## Admin account
Register through the website. To grant admin access for local development, update that user's `role` field to `admin` directly in MongoDB. There is intentionally no public admin-registration endpoint.

## Features
- Responsive customer storefront and category/product browsing
- Product search, sorting, quick view and add-to-cart
- Cart persists in browser local storage
- JWT register/login and account screen
- Backend-validated order creation with stock checks
- Order history
- Admin product CRUD and order status management
- Simulated checkout only; no real payment is collected and no card details are requested

## Important notes
- The storefront includes local demo product data so the UI can be explored before MongoDB is connected. Real registration, checkout, order history and admin actions require the backend and database.
- The order route uses MongoDB transactions. MongoDB Atlas or a replica-set-enabled MongoDB deployment is required for transaction support.
- Configure HTTPS, secure token handling, production CORS, image storage, monitoring, and a real payment provider before production deployment.
- Product images are remote Unsplash demo images. Replace them with properly licensed images before publishing.
