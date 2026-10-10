require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50kb' }));

// Request logging in development
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Serve built React app from dist if present
const DIST_DIR = path.join(__dirname, '..', 'dist');
app.use(express.static(DIST_DIR));

// Keep public assets as the development/fallback source when no production build exists.
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR, {
  maxAge: '1d'
}));

app.get('/{*splat}', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, error: 'Endpoint not found.' });
  }
  const indexPath = path.join(DIST_DIR, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // In dev mode when dist is not yet built, serve public index or informative response
      res.sendFile(path.join(PUBLIC_DIR, 'index.html'), (e2) => {
        if (e2) res.status(200).send('HuQ API running. Start Vite dev server for frontend.');
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  Humane Quotient (HuQ) Backend running on port ${PORT}`);
  console.log(`  API Base URL: http://localhost:${PORT}/api`);
  console.log(`  Admin Email : ${process.env.ADMIN_EMAIL || 'admin@huq.org'}`);
  console.log(`======================================================\n`);
});
