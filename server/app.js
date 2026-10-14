require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');
const adminRoutes = require('./routes/admin');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50kb' }));

// Security and caching headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    const missingUri = err.message === 'MONGODB_URI must be configured before connecting to MongoDB.';
    console.error('API request rejected because MongoDB is unavailable:', err.message);
    res.status(503).json({
      ok: false,
      code: missingUri ? 'DATABASE_CONFIGURATION_MISSING' : 'DATABASE_UNAVAILABLE',
      error: missingUri
        ? 'MongoDB is not configured. Set MONGODB_URI in the deployment environment.'
        : 'MongoDB could not be reached. Check the deployment MONGODB_URI and database network access.'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

module.exports = app;
