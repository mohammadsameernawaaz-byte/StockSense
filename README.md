# StockSense – Inventory Management System.

//Deployment Note :
Currently, the application is optimized for laptop and desktop environments. A mobile-responsive version is currently under development and will be made available soon.

StockSense is a modular Inventory Management System (IMS) designed to digitize and streamline stock-related operations within a business.

The system provides centralized inventory management instead of relying on manual registers, spreadsheets, and scattered tracking methods..

## Features!

### Authentication
- User signup and login
- JWT-based authentication
- Password protection using bcrypt

### Product Management
- Create products
- SKU / product code management
- Product categories
- Unit of measure
- Initial stock
- Minimum stock / reorder point
- Reorder quantity
- Product search and filtering
- Stock status tracking

### Inventory Operations
- Receipts for incoming stock
- Delivery orders for outgoing stock
- Internal stock transfers
- Inventory adjustments
- Complete move history / stock ledger

### Dashboard
- Total products
- Total stock
- Low-stock products
- Out-of-stock products
- Reorder indicators
- Recent inventory movements

## Tech Stack

### Frontend
- React
- Vite
- React Router
- CSS
- Fetch API

### Backend
- Node.js
- Express.js
- JWT
- bcryptjs

### Database
- SQLite
- Node.js node:sqlite

## Project Structure

```text
StockSense/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── api.js
│   └── package.json
│
├── server/
│   ├── src/
│   │   └── server.js
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
Inventory Flow
Receipt
   ↓
Stock Increases
   ↓
Internal Transfer
   ↓
Location Changes
   ↓
Delivery
   ↓
Stock Decreases
   ↓
Adjustment
   ↓
Stock Reconciled

All inventory movements are recorded in the movement history.

Running the Project
1. Clone the repository
git clone https://github.com/roshanky2007/StockSense.git
cd StockSense
2. Install frontend dependencies
cd client
npm install
3. Start the frontend
npm run dev

Frontend:

http://localhost:5173
4. Install backend dependencies

Open another terminal:

cd server
npm install
5. Start the backend
npm run dev

Backend:

http://localhost:5000
API

The backend API is available under:

http://localhost:5000/api

Main endpoints include:

POST   /api/auth/signup
POST   /api/auth/login

GET    /api/products
POST   /api/products

GET    /api/dashboard

POST   /api/movements
GET    /api/movements

GET    /api/me
GET    /api/health
Inventory Rules
Receipt

Incoming stock increases product stock.

New Stock = Current Stock + Received Quantity
Delivery

Outgoing stock decreases product stock.

New Stock = Current Stock - Delivered Quantity
Internal Transfer

Internal transfers change the stock location while total stock remains unchanged.

Adjustment

An adjustment reconciles the recorded quantity with the physical count.

Stock Status
Healthy
    ↓
Stock > Minimum Stock

Needs Reorder
    ↓
Stock ≤ Minimum Stock

Out of Stock
    ↓
Stock ≤ 0
Security
Passwords are hashed using bcrypt.
Authentication uses JWT tokens.
SQLite database files are excluded from Git.
Environment files are excluded from Git.
Project Status

StockSense is currently under active development. Additional warehouse, location, reporting, and operational workflows can be extended as the system evolves.

Author

Roshan Kumar Yadav
Manideep
Sameer
Mithilesh
