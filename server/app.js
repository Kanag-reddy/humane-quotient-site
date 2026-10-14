require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { connectDB } = require('./config/db');
const { ensureAdminUser } = require('./config/adminUser');

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
    await ensureAdminUser();
    next();
  } catch (err) {
    console.error('API request rejected because database setup is unavailable:', err.message);
    res.status(503).json({ ok: false, error: 'Database unavailable. Please try again later.' });
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
