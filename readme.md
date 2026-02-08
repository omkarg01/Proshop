# ProShop eCommerce Platform - Live : [link](https://proshop-6ko3.onrender.com/)

> eCommerce platform built with the MERN stack & Redux.

<img src="./frontend/public/images/screens.png">

<!-- toc -->

- [Features](#features)
- [Tambo Integration](#tambo-integration-ai-features)
- [Usage](#usage)
  - [Env Variables](#env-variables)
  - [Install Dependencies (frontend & backend)](#install-dependencies-frontend--backend)
  - [Run](#run)
- [Build & Deploy](#build--deploy)
  - [Seed Database](#seed-database)

<!-- tocstop -->

## Features

- Full featured shopping cart
- Product reviews and ratings
- Top products carousel
- Product pagination
- Product search feature
- User profile with orders
- Admin product management
- Admin user management
- Admin Order details page
- Mark orders as delivered option
- Checkout process (shipping, payment method, etc)
- PayPal / credit card integration
- Database seeder (products & users)

## Tambo Integration (AI Features)

- **SmartProductCard**: AI-driven product insights, review summaries, and smart stock alerts for individual items.
- **AdminDashboard**: Comprehensive inventory management tool for tracking stock levels, flagging low inventory, and restocking.
- **SalesDashboard**: Visual analytics dashboard displaying real-time revenue, order trends, and top-selling products.
- **OrderHistoryCard**: Personalized assistant for users to track recent orders, view status updates, and manage purchase history.
- **Review Analysis**: Tools that automatically summarize customer sentiment and extract pros/cons from product reviews.

### 🎤 Sample Prompts
Try asking these questions in the chat to see the AI components in action:
1. **"Show me details and reviews for the iPhone 15 Pro."** (Triggers *SmartProductCard*)
2. **"Which products are low in stock and need restocking?"** (Triggers *AdminDashboard*)
3. **"Show me the sales statistics and revenue trends."** (Triggers *SalesDashboard*)
4. **"Where is my recent order?"** (Triggers *OrderHistoryCard*)
5. **"What do people like about the Amazon Echo?"** (Triggers *Review Analysis*)

## Usage

- Create a MongoDB database and obtain your `MongoDB URI` - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- Create a PayPal account and obtain your `Client ID` - [PayPal Developer](https://developer.paypal.com/)

### Env Variables

Rename the `.env.example` file to `.env` and add the following

```
NODE_ENV = development
PORT = 5000
MONGO_URI = your mongodb uri
JWT_SECRET = 'abc123'
PAYPAL_CLIENT_ID = your paypal client id
PAGINATION_LIMIT = 8
```

Change the JWT_SECRET and PAGINATION_LIMIT to what you want

### Install Dependencies (frontend & backend)

```
npm install
cd frontend
npm install
```

### Run

```

# Run frontend (:3000) & backend (:5000)
npm run dev

# Run backend only
npm run server
```

## Build & Deploy

```
# Create frontend prod build
cd frontend
npm run build
```

### Seed Database

You can use the following commands to seed the database with some sample users and products as well as destroy all data

```
# Import data
npm run data:import

# Destroy data
npm run data:destroy
```

```
Sample User Logins

admin@email.com (Admin)
123456

john@email.com (Customer)
123456

jane@email.com (Customer)
123456
```
