const mongoose = require('mongoose');
const User = require('../models/User');
const Submission = require('../models/Submission');

let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI must be configured before connecting to MongoDB.');
  }
  if (process.env.VERCEL && /(?:localhost|127\.0\.0\.1)/i.test(uri)) {
    throw new Error('MONGODB_URI must point to a reachable MongoDB deployment on Vercel.');
  }
  connectionPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  }).then((connection) => {
    console.log(`[MongoDB] Connected successfully to database "${connection.connection.name}".`);
    return connection;
  }).catch((err) => {
    console.error(`[MongoDB] Connection failed (${err.name}): ${err.message}`);
    throw err;
  }).finally(() => {
    connectionPromise = null;
  });

  return connectionPromise;
}

// Unified Data Access Layer (DAL)
const db = {
  isConnected: () => mongoose.connection.readyState === 1,

  async findUserByEmail(email) {
    await connectDB();
    return User.findOne({ email: String(email).toLowerCase() });
  },

  async findUserById(id) {
    await connectDB();
    return User.findById(id).select('-password');
  },

  async createUser(userData) {
    await connectDB();
    const user = new User(userData);
    return user.save();
  },

  async createSubmission(subData) {
    await connectDB();
    const submission = new Submission(subData);
    return submission.save();
  },

  async findSubmissionById(submissionId) {
    await connectDB();
    return Submission.findOne({ submissionId });
  },

  async getSubmissionsByEmail(email) {
    await connectDB();
    return Submission.find({ email: String(email).toLowerCase() }).sort({ createdAt: -1 });
  },

  async getSubmissionsByUserId(userId) {
    await connectDB();
    return Submission.find({ userId }).sort({ createdAt: -1 });
  },

  async getAllSubmissions() {
    await connectDB();
    return Submission.find().sort({ createdAt: -1 });
  },

  async countSubmissions() {
    await connectDB();
    return Submission.countDocuments();
  },

  async countUsers() {
    await connectDB();
    return User.countDocuments();
  }
};

module.exports = { connectDB, db };
