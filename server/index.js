const path = require('path');
const express = require('express');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Serve built React app from dist if present (for production preview)
const DIST_DIR = path.join(__dirname, '..', 'dist');
app.use(express.static(DIST_DIR));

// Fallback to public folder
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR, { maxAge: '1d' }));

app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, error: 'Endpoint not found.' });
  }
  const indexPath = path.join(DIST_DIR, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
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
  console.log(`======================================================\n`);
});
