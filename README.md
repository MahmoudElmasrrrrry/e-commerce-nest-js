# 🛒 E-Commerce REST API

A full-featured e-commerce backend API built with **NestJS**, **MongoDB (Mongoose)**, and **TypeScript**. This project provides a complete set of RESTful endpoints for managing users, products, categories, carts, orders, coupons, suppliers, taxes, and payments.

> **⚠️ Work in Progress** — This project is under active development. Features like Stripe payment checkout and OAuth authentication are planned for upcoming releases. See the [Roadmap](#-roadmap) section below.

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Authentication & Authorization](#-authentication--authorization)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🧰 Tech Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| Framework         | NestJS v11                          |
| Language          | TypeScript                          |
| Database          | MongoDB via Mongoose v9             |
| Authentication    | JWT (`@nestjs/jwt`)                 |
| Validation        | class-validator & class-transformer |
| Password Hashing  | bcrypt                              |
| Email             | Nodemailer                          |
| Payment (planned) | Stripe                              |
| Slug Generation   | slugify                             |
| Unique IDs        | nanoid                              |

---

## ✨ Features

### Implemented

- **Authentication** — Sign up, sign in, email verification via OTP, resend OTP, forgot password, reset password
- **User Management** — Admin CRUD for users, user self-service profile management (get / update / delete own account)
- **Product Catalog** — Full CRUD with slug generation, image cover, color variants, ratings, category/subcategory/brand relations
- **Categories & Sub-Categories** — Hierarchical product categorization
- **Brands** — Brand management and association with products
- **Cart** — Add to cart, update item quantity, remove items, clear cart, apply/remove discount coupons with automatic price recalculation
- **Coupon System** — Percentage-based coupons with expiration, min order value, max discount cap, usage tracking, per-user usage limits
- **Orders** — Create orders from cart, shipping address, tax & shipping price calculation, order status tracking (paid / delivered / canceled)
- **Order Admin** — Admin can view all orders with filters (paid, delivered, canceled), view order statistics, update order status
- **Suppliers** — Supplier management (CRUD)
- **Tax Configuration** — Admin can create, view, and reset tax settings
- **Payment Module** — Stripe checkout session service (initial integration)
- **Role-Based Access Control** — `user` and `admin` roles enforced via custom Guards and Decorators
- **Email Notifications** — OTP emails for verification and password reset using a custom event-based email system
- **Input Validation** — DTOs validated with `class-validator`, whitelisted and transformed via `ValidationPipe`

---

## 📁 Project Structure

```
src/
├── main.ts                    # Application entry point (global prefix: api/v1)
├── app.module.ts              # Root module — registers all feature modules
│
├── auth/                      # Authentication (sign up, sign in, OTP, password reset)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── dto/
│
├── user/                      # User management (admin & self-service)
│   ├── user.controller.ts     # UserController (admin) & UserMeController (self-service)
│   ├── user.service.ts
│   ├── user.schema.ts
│   ├── user.module.ts
│   └── dto/
│
├── product/                   # Product catalog
│   ├── product.controller.ts
│   ├── product.service.ts
│   ├── product.schema.ts
│   ├── product.module.ts
│   └── dto/
│
├── category/                  # Product categories
├── sub-category/              # Product sub-categories
├── brand/                     # Brands
├── cart/                      # Shopping cart
├── coupon/                    # Discount coupons
├── order/                     # Orders & order management
├── payment/                   # Stripe payment integration
├── suppliers/                 # Supplier management
├── tax/                       # Tax configuration
│
└── utils/
    ├── decorator/             # Custom decorators (@Roles) & enums (Role, Sex, EmailType)
    ├── guard/                 # Auth guard (JWT verification + role checking)
    ├── email/                 # OTP generation, HTML templates, event-based email system
    └── security/              # bcrypt hashing & comparing utilities
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** (local or cloud — e.g. MongoDB Atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/MahmoudElmasrrrrry/e-commerce-nest-js.git
cd e-commerce-nest-js

# 2. Install dependencies
npm install

# 3. Create your .env file (see Environment Variables below)
cp .env.example .env   # or create manually

# 4. Run in development mode
npm run start:dev
```

The server will start at `http://localhost:3000` with the global prefix `api/v1`.

### Available Scripts

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `npm run start`     | Start the app                     |
| `npm run start:dev` | Start in watch mode (development) |
| `npm run build`     | Build for production               |
| `npm run start:prod`| Run the production build          |
| `npm run lint`      | Lint and auto-fix source files    |
| `npm run format`    | Format code with Prettier         |
| `npm run test`      | Run unit tests                    |
| `npm run test:e2e`  | Run end-to-end tests              |

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server
PORT=3000

# MongoDB
mongo_url=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

# JWT
JWT_SECRET=your_jwt_secret_key

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Stripe (planned)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_CANCEL_URL=http://localhost:3000/cancel
STRIPE_SUCCESS_URL=http://localhost:3000/success
```

---

## 📖 API Reference

All endpoints are prefixed with **`/api/v1`**.

### 🔑 Auth — `/auth`

| Method | Endpoint            | Description              | Access  |
| ------ | ------------------- | ------------------------ | ------- |
| POST   | `/auth/sign-up`     | Register a new user      | Public  |
| POST   | `/auth/verify-email`| Verify email with OTP    | Public  |
| POST   | `/auth/resend-otp`  | Resend verification OTP  | Public  |
| POST   | `/auth/sign-in`     | Login & receive JWT      | Public  |
| POST   | `/auth/forgot-password` | Request password reset OTP | Public |
| POST   | `/auth/reset-password`  | Reset password with OTP    | Public |

### 👤 User — `/user` (Admin) & `/userMe` (Self-service)

| Method | Endpoint      | Description               | Access       |
| ------ | ------------- | ------------------------- | ------------ |
| POST   | `/user`       | Create a user             | Admin        |
| GET    | `/user`       | Get all users             | Admin        |
| GET    | `/user/:id`   | Get user by ID            | Admin        |
| PATCH  | `/user/:id`   | Update user by ID         | Admin        |
| DELETE | `/user/:id`   | Delete user by ID         | Admin        |
| GET    | `/userMe`     | Get own profile           | User / Admin |
| PATCH  | `/userMe`     | Update own profile        | User / Admin |
| DELETE | `/userMe`     | Delete own account        | User         |

### 📦 Product — `/product`

| Method | Endpoint         | Description           | Access |
| ------ | ---------------- | --------------------- | ------ |
| POST   | `/product`       | Create a product      | Admin  |
| GET    | `/product`       | Get all products      | Auth   |
| GET    | `/product/:id`   | Get product by ID     | Auth   |
| PATCH  | `/product/:id`   | Update product        | Admin  |
| DELETE | `/product/:id`   | Delete product        | Admin  |

### 🗂️ Category — `/category`

| Method | Endpoint          | Description         | Access |
| ------ | ----------------- | ------------------- | ------ |
| POST   | `/category`       | Create category     | Admin  |
| GET    | `/category`       | Get all categories  | Auth   |
| GET    | `/category/:id`   | Get category by ID  | Auth   |
| PATCH  | `/category/:id`   | Update category     | Admin  |
| DELETE | `/category/:id`   | Delete category     | Admin  |

### 🛒 Cart — `/cart`

| Method | Endpoint                | Description              | Access |
| ------ | ----------------------- | ------------------------ | ------ |
| GET    | `/cart`                 | Get logged user's cart   | User   |
| POST   | `/cart/:productId`      | Add product to cart      | User   |
| PATCH  | `/cart/apply-coupon`    | Apply coupon to cart     | User   |
| PATCH  | `/cart/:itemId`         | Update cart item quantity| User   |
| DELETE | `/cart`                 | Clear entire cart        | User   |
| DELETE | `/cart/remove-coupon`   | Remove applied coupon    | User   |
| DELETE | `/cart/:itemId`         | Remove item from cart    | User   |

### 🎟️ Coupon — `/coupon`

| Method | Endpoint        | Description        | Access |
| ------ | --------------- | ------------------ | ------ |
| POST   | `/coupon`       | Create coupon      | Admin  |
| GET    | `/coupon`       | Get all coupons    | Admin  |
| GET    | `/coupon/:id`   | Get coupon by ID   | Admin  |
| PATCH  | `/coupon/:id`   | Update coupon      | Admin  |
| DELETE | `/coupon/:id`   | Delete coupon      | Admin  |

### 📋 Order — `/order`

| Method | Endpoint              | Description                    | Access |
| ------ | --------------------- | ------------------------------ | ------ |
| POST   | `/order`              | Create order from cart         | User   |
| GET    | `/order`              | Get logged user's orders       | User   |
| GET    | `/order/:id`          | Get specific order             | User   |
| GET    | `/order/admin/all`    | Get all orders (with filters)  | Admin  |
| GET    | `/order/admin/stats`  | Get order statistics           | Admin  |
| PATCH  | `/order/:id/deliver`  | Mark order as delivered        | Admin  |
| PATCH  | `/order/:id/paid`     | Mark order as paid             | Admin  |
| DELETE | `/order/:id`          | Cancel order                   | User   |

### 🏭 Suppliers — `/suppliers`

| Method | Endpoint           | Description         | Access |
| ------ | ------------------ | ------------------- | ------ |
| POST   | `/suppliers`       | Create supplier     | Admin  |
| GET    | `/suppliers`       | Get all suppliers   | Admin  |
| GET    | `/suppliers/:id`   | Get supplier by ID  | Admin  |
| PATCH  | `/suppliers/:id`   | Update supplier     | Admin  |
| DELETE | `/suppliers/:id`   | Delete supplier     | Admin  |

### 💰 Tax — `/tax`

| Method | Endpoint | Description         | Access |
| ------ | -------- | ------------------- | ------ |
| POST   | `/tax`   | Create / update tax | Admin  |
| GET    | `/tax`   | Get tax settings    | Admin  |
| DELETE | `/tax`   | Reset tax settings  | Admin  |

---

## 🛡️ Authentication & Authorization

- **JWT-based**: Users receive a JWT token upon sign-in, which must be included in the `Authorization` header as `Bearer <token>`.
- **OTP Email Verification**: New accounts must verify their email using a 6-digit OTP sent via Nodemailer before they can sign in.
- **Role-Based Access Control (RBAC)**: 
  - `user` — Can manage own profile, cart, and orders.
  - `admin` — Full access to all resources including user management, product catalog, coupons, suppliers, taxes, and order administration.
- **Custom Guard & Decorator**: The `AuthGuard` validates JWT tokens and checks the user's role against the required roles defined by the `@Roles()` decorator.

---

## 🗺️ Roadmap

The following features are planned for upcoming releases:

- [ ] **Stripe Payment Gateway** — Complete the checkout session flow, webhook handling, and automatic order payment confirmation
- [ ] **OAuth Authentication** — Google / GitHub social login integration
- [ ] **Product Reviews & Ratings** — Allow users to review and rate products
- [ ] **Wishlist** — Save products for later
- [ ] **Image Upload** — Cloudinary / S3 integration for product images and user avatars
- [ ] **Search & Filtering** — Advanced product search with filters (price range, category, brand, rating)
- [ ] **Pagination** — Standardized pagination across all list endpoints
- [ ] **Swagger / OpenAPI Documentation** — Auto-generated interactive API docs
- [ ] **Rate Limiting** — Protect API from abuse
- [ ] **Unit & E2E Tests** — Comprehensive test coverage

---

## 📄 License

This project is **UNLICENSED** — private use only.

---

<p align="center">
  Built with ❤️ using <a href="https://nestjs.com/">NestJS</a>
</p>
