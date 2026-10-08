const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'huq-secret-key-2026-safe-default';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ ok: false, error: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ ok: false, error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Admin access required.' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  optionalToken,
  requireAdmin
};
