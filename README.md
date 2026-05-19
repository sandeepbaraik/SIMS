# StockFlow MVP

Multi-tenant inventory SaaS built with React, Bootstrap, Express.js, Sequelize, and MySQL.

## What is included

- Email/password signup and login
- One organization created per signup
- Organization-scoped product CRUD
- Dashboard with total products, total units, and low stock items
- Settings page for default low stock threshold

## Tech stack

- Frontend: React + Vite + Bootstrap
- Backend: Express.js + Sequelize
- Database: MySQL
- Auth: JWT stored in an HttpOnly cookie

## Project structure

- `frontend` - React app
- `backend` - Express API and Sequelize models

## Setup

1. Create a MySQL database named `stockflow`.
2. Copy `backend/.env.example` to `backend/.env` and fill in your MySQL credentials plus `JWT_SECRET`.
3. Copy `frontend/.env.example` to `frontend/.env` if you want to override the default API URL.
4. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

5. Start the backend:

```bash
cd backend
npm run dev
```

6. Start the frontend:

```bash
cd frontend
npm run dev
```

## Default local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## API notes

- Backend routes are mounted under `/api`
- Auth cookie name is `stockflow_token`
- Product `sku` is unique within an organization
- If a product-level low stock threshold is empty, the organization default is used
