# Hero Cycles Pricing Engine

A production-quality MERN stack application for managing bicycle component pricing, configurations, and generating pricing breakdowns.

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB Atlas, Mongoose
- **Auth**: JWT Authentication, bcryptjs, Role-Based Access Control

## Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Manage components, update prices, view price history |
| **Salesperson** | Create/edit configurations, generate pricing breakdowns |

## Project Structure

```
hero-cycles-pricing-engine/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express API
└── README.md
```

## Setup & Running

### 1. Configure MongoDB Atlas

Edit `backend/.env` and update `MONGO_URI` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hero-cycles-pricing?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```
Server runs on `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/components` | Private | Get components (paginated) |
| POST | `/api/components` | Admin | Create component |
| PUT | `/api/components/:id` | Admin | Update component |
| DELETE | `/api/components/:id` | Admin | Delete component |
| POST | `/api/prices/update` | Admin | Update component price |
| GET | `/api/prices/history` | Admin | Get all price history |
| POST | `/api/configurations` | Salesperson | Create configuration |
| PUT | `/api/configurations/:id` | Salesperson | Update configuration |
| GET | `/api/configurations/:id` | Private | Get configuration |
| GET | `/api/pricing/:configurationId` | Private | Get pricing breakdown |
| GET | `/api/dashboard/summary` | Private | Dashboard stats |

## Key Features

- **Pricing Engine**: Automatically calculates configuration total price using latest component prices
- **Mandatory Components**: Frame, Tyre, and Gear Set are required for every configuration
- **Price History**: All price changes are tracked with old/new price, who made the change, and when
- **Role Protection**: Admin and Salesperson routes are fully separated with JWT + RBAC
- **Responsive UI**: Clean enterprise-style dark theme with Tailwind CSS
