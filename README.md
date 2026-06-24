# Hero Cycles Pricing Engine

A production-quality MERN stack application for managing bicycle component pricing,
configurations, and generating real-time pricing breakdowns.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs, Role-Based Access Control |
| Tests | Jest, Supertest |

---

## Roles & Permissions

| Action | Admin | Salesperson |
|--------|-------|-------------|
| Manage components | ✅ | ❌ |
| Update prices | ✅ | ❌ |
| View price history | ✅ | ❌ |
| Create configurations | ✅ | ✅ |
| Edit **own** configurations | ✅ | ✅ |
| Edit **others'** configurations | ✅ | ❌ (403) |
| Delete **own** configurations | ✅ | ✅ |
| Delete **others'** configurations | ✅ | ❌ (403) |
| Generate pricing breakdown | ✅ | ✅ |

---

## Environment Setup

### 1. Copy the example env file

```bash
cp .env.example backend/.env
```

Edit `backend/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/hero-cycles-pricing
JWT_SECRET=your_long_random_secret_here
FRONTEND_URL=http://localhost:5173

# Optional — separate DB for tests
MONGO_URI_TEST=mongodb+srv://<user>:<password>@cluster0.mongodb.net/hero-cycles-test
```

> **Never commit your actual `.env` file.** It is in `.gitignore`.

---

## Running the Project

### Backend

```bash
cd backend
npm install
npm run dev        # Development (nodemon)
npm start          # Production
```

Server starts on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

### Frontend environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For a deployed backend, replace the URL with your production API base URL.

---

## Seed Data

Populate the database with sample users, components, and configurations:

```bash
cd backend
npm run seed
```

**Seeded credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@herocycles.com | admin123 |
| Salesperson | sales@herocycles.com | sales123 |

Seeded data includes 13 components (across all 5 categories) and 2 sample
configurations: **Mountain Bike** and **Road Bike**.

---

## Running Tests

```bash
cd backend
npm test           # Run all tests once
npm run test:watch # Watch mode
```

Tests cover:
- **Auth** — register, login, token validation
- **Configuration** — CRUD, ownership checks (403), mandatory category validation (400)
- **Pricing** — breakdown calculation, quantity × price, 404 for unknown IDs

> Tests use a separate test database (`MONGO_URI_TEST`). If not set, they fall back
> to `MONGO_URI` and clean up after themselves.

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |

### Components
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/components` | Private |
| GET | `/api/components/all` | Private |
| POST | `/api/components` | Admin |
| PUT | `/api/components/:id` | Admin |
| DELETE | `/api/components/:id` | Admin |

### Prices
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/prices/update` | Admin |
| GET | `/api/prices/history` | Admin |
| GET | `/api/prices/history/:componentId` | Admin |

### Configurations
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/configurations` | Private |
| POST | `/api/configurations` | Admin / Salesperson |
| GET | `/api/configurations/:id` | Private |
| PUT | `/api/configurations/:id` | Owner or Admin |
| DELETE | `/api/configurations/:id` | Owner or Admin |
| POST | `/api/configurations/:id/components` | Owner or Admin |

### Pricing Breakdown
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/pricing/:configurationId` | Private |

### Dashboard
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/dashboard/summary` | Private |
| GET | `/api/dashboard/recent-price-updates` | Private |

---

## Business Rules

- **Mandatory categories**: Every configuration must always include at least one
  component from **Frame**, **Tyre**, and **Gear Set**.
- **Ownership**: Salespersons may only update or delete configurations they created.
  Admins can mutate any configuration.
- **Price history**: Every price change is logged with old price, new price, who made
  the change, and the effective date.

---

## Project Structure

```
hero-cycles-pricing-engine/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, role, error middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── seed/            # seedData.js
│   │   ├── services/        # pricingEngine, dashboardService
│   │   ├── tests/           # Jest + Supertest test suites
│   │   │   └── helpers/     # testDb.js, testData.js
│   │   └── utils/           # generateToken, validators, configValidation
│   ├── .env                 # Local env (git-ignored)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env                 # Local env (git-ignored)
│   └── package.json
├── .env.example             # Template — copy to backend/.env
├── .gitignore
└── README.md
```

---

Hero Cycles Pricing Engine © 2026
