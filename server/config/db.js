const mongoose = require('mongoose');
const fallbackStore = require('./fallbackStore');
const User = require('../models/User');
const Submission = require('../models/Submission');

let isMongoConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/huq';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected successfully to ${uri}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[MongoDB] Notice: Could not connect to MongoDB (${err.message}).`);
    console.warn(`[MongoDB] Using local persistent JSON fallback store at data/local_db.json.`);
    console.warn(`[MongoDB] Provide a valid MONGODB_URI in .env to connect to your MongoDB cluster.`);
  }
}

// Unified Data Access Layer (DAL)
const db = {
  isConnected: () => isMongoConnected,

  async findUserByEmail(email) {
    if (isMongoConnected) {
      return await User.findOne({ email: String(email).toLowerCase() });
    }
    return await fallbackStore.findUserByEmail(email);
  },

  async findUserById(id) {
    if (isMongoConnected) {
      return await User.findById(id).select('-password');
    }
    const u = await fallbackStore.findUserById(id);
    if (u) {
      const { password, ...safe } = u;
      return safe;
    }
    return null;
  },

  async createUser(userData) {
    if (isMongoConnected) {
      const user = new User(userData);
      return await user.save();
    }
    return await fallbackStore.createUser(userData);
  },

  async createSubmission(subData) {
    if (isMongoConnected) {
      const submission = new Submission(subData);
      return await submission.save();
    }
    return await fallbackStore.createSubmission(subData);
  },

  async getSubmissionsByEmail(email) {
    if (isMongoConnected) {
      return await Submission.find({ email: String(email).toLowerCase() }).sort({ createdAt: -1 });
    }
    const list = await fallbackStore.getSubmissionsByEmail(email);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getSubmissionsByUserId(userId) {
    if (isMongoConnected) {
      return await Submission.find({ userId }).sort({ createdAt: -1 });
    }
    const list = await fallbackStore.getSubmissionsByUserId(userId);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getAllSubmissions() {
    if (isMongoConnected) {
      return await Submission.find().sort({ createdAt: -1 });
    }
    const list = await fallbackStore.getAllSubmissions();
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async countSubmissions() {
    if (isMongoConnected) {
      return await Submission.countDocuments();
    }
    return await fallbackStore.countSubmissions();
  },

  async countUsers() {
    if (isMongoConnected) {
      return await User.countDocuments();
    }
    return await fallbackStore.countUsers();
  }
};

module.exports = { connectDB, db };
