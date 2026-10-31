
# ShopSphere — Full-Stack E-Commerce Application

A responsive full-stack e-commerce application built using React, Node.js, Express.js, and MongoDB.

ShopSphere provides product browsing, search, category filtering, shopping cart, user authentication, demo checkout, order history, and an admin dashboard.

## Technologies Used

- React.js
- Vite
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- CSS
- Git and GitHub

## Features

### Customer Features
- Responsive e-commerce storefront
- Browse and search products
- Category filtering and sorting
- Product details and quick view
- Shopping cart with local storage
- User registration and login
- Demo checkout
- Order history

### Admin Features
- Admin dashboard
- View products and recent orders
- Add new products
- Edit product details
- Delete products
- Update order status

### Payment
- Simulated checkout
- No real payments collected
- No card details requested

## Project Structure

```text
ShopSphere/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

## Requirements

- Node.js and npm
- MongoDB Atlas or local MongoDB
- Git

## Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/pranav-chauhan9/ShopSphere.git
cd ShopSphere
```

### 2. Install Dependencies

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 3. Configure Environment Variables

Create `server/.env` and `client/.env` using their respective `.env.example` files.

Backend configuration:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Frontend configuration:

```env
VITE_API_URL=http://localhost:5000/api
```

Never upload actual credentials or secret keys to GitHub.

### 4. Seed Demo Products

```bash
cd server
node scripts/seed.js
cd ..
```

### 5. Start the Application

```bash
npm run dev
```

### 6. Open the Website

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Products API: http://localhost:5000/api/products

## Admin Account Setup

1. Register an account through the website.
2. Open MongoDB Atlas.
3. Find your account in the `users` collection.
4. Change the `role` field from `customer` to `admin`.
5. Log out and sign in again.

There is no public admin-registration endpoint.

## Important Notes

- MongoDB Atlas or a replica-set-enabled MongoDB deployment is required for transaction support.
- Checkout is simulated and does not process real payments.
- Product images use remote demo images.
- Production deployment requires HTTPS, secure environment configuration, appropriate CORS settings, monitoring, and secure authentication handling.

## Future Improvements

- Product reviews and ratings
- Wishlist functionality
- Advanced analytics
- Email notifications
- Cloud image storage
- Payment gateway integration

---

**Developed as a Full-Stack Web Development Project.**
