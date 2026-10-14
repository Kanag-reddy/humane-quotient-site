const bcrypt = require('bcryptjs');
const { db } = require('./db');

let setupPromise = null;

function ensureAdminUser() {
  if (setupPromise) return setupPromise;

  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !password) {
    return Promise.reject(new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured.'));
  }

  setupPromise = (async () => {
    const existing = await db.findUserByEmail(email);
    if (existing) return;

    const hashedPassword = await bcrypt.hash(password, 12);
    try {
      await db.createUser({
        name: 'HuQ Administrator',
        email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('[Admin] Configured administrator account is ready.');
    } catch (err) {
      if (err.code !== 11000 || !(await db.findUserByEmail(email))) throw err;
    }
  })().catch((err) => {
    setupPromise = null;
    throw err;
  });

  return setupPromise;
}

module.exports = { ensureAdminUser };
