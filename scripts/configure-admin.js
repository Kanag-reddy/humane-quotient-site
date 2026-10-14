require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('../server/config/db');
const User = require('../server/models/User');

async function configureAdmin() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !password) {
    throw new Error('Set valid ADMIN_EMAIL and ADMIN_PASSWORD environment variables first.');
  }

  await connectDB();
  const hashedPassword = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: 'HuQ Administrator',
        email,
        password: hashedPassword,
        role: 'admin'
      }
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  const result = await User.deleteMany({ role: 'admin', email: { $ne: email } });
  console.log(`Configured the administrator account; permanently deleted ${result.deletedCount} other admin account(s).`);
}

configureAdmin()
  .catch((err) => {
    console.error(`Admin configuration failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
