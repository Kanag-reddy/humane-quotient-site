const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Seed default admin user on first load
async function ensureAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@huq.org').toLowerCase().trim();
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123';
  try {
    const existing = await db.findUserByEmail(adminEmail);
    if (!existing) {
      const hash = await bcrypt.hash(adminPass, 10);
      await db.createUser({
        name: 'HuQ Administrator',
        email: adminEmail,
        password: hash,
        role: 'admin'
      });
      console.log(`[Admin] Default admin created: ${adminEmail} (password: ${adminPass})`);
    }
  } catch (err) {
    console.error('Error ensuring admin user:', err.message);
  }
}
setTimeout(ensureAdminUser, 1000);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: 'Name, email, and password are required.' });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      return res.status(400).json({ ok: false, error: 'Invalid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
    }

    const existing = await db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ ok: false, error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser({
      name: String(name).trim().slice(0, 100),
      email: cleanEmail,
      password: hashedPassword,
      role: 'user'
    });

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      ok: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ ok: false, error: 'Failed to create account.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required.' });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const user = await db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ ok: false, error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found.' });
    }
    res.json({
      ok: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Auth me error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch user profile.' });
  }
});

module.exports = router;
