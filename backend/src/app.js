const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const componentRoutes = require('./routes/componentRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const pricingBreakdownRoutes = require('./routes/pricingBreakdownRoutes');
const configurationRoutes = require('./routes/configurationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// --------------- CORS ---------------
const allowedOrigins = [
  'https://hero-cycles-pricing-engine.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin requests (Postman, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS: blocked request from origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Must be first — so CORS headers appear on ALL responses including 500s
app.use(cors(corsOptions));
// Explicitly handle preflight for every route
app.options('*', cors(corsOptions));

// --------------- Body Parsing ---------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --------------- Health Check ---------------
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Hero Cycles Pricing Engine API is running', timestamp: new Date() });
});

// --------------- API Routes ---------------
app.use('/api/auth', authRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/prices', pricingRoutes);
app.use('/api/pricing', pricingBreakdownRoutes);
app.use('/api/configurations', configurationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --------------- Error Handling ---------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
