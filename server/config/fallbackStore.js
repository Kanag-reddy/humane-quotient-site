const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const STORE_PATH = path.join(DATA_DIR, 'local_db.json');

function readStore() {
  if (fs.existsSync(STORE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    } catch (e) {
      console.error('Error reading fallback store:', e);
      throw e;
    }
  }
  return { users: [], submissions: [] };
}

function writeStore(data) {
  const tempPath = STORE_PATH + '.tmp';
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, STORE_PATH);
  } catch (e) {
    try {
      fs.unlinkSync(tempPath);
    } catch (cleanupError) {
      if (cleanupError.code !== 'ENOENT') console.error('Error cleaning fallback store temp file:', cleanupError);
    }
    console.error('Error writing fallback store:', e);
    throw e;
  }
}

const fallbackStore = {
  async findUserByEmail(email) {
    const store = readStore();
    return store.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
  },

  async findUserById(id) {
    const store = readStore();
    return store.users.find((u) => u.id === id) || null;
  },

  async createUser(userData) {
    const store = readStore();
    const newUser = {
      id: 'usr_' + crypto.randomBytes(8).toString('hex'),
      ...userData,
      createdAt: new Date().toISOString()
    };
    store.users.push(newUser);
    writeStore(store);
    return newUser;
  },

  async createSubmission(subData) {
    const store = readStore();
    const existing = store.submissions.find((s) => s.submissionId === subData.submissionId);
    if (existing) return existing;
    const newSub = {
      id: 'HuQ-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      ...subData,
      createdAt: new Date().toISOString()
    };
    store.submissions.push(newSub);
    writeStore(store);
    return newSub;
  },

  async findSubmissionById(submissionId) {
    const store = readStore();
    return store.submissions.find((s) => s.submissionId === submissionId) || null;
  },

  async getSubmissionsByEmail(email) {
    const store = readStore();
    const target = String(email).toLowerCase().trim();
    return store.submissions.filter((s) => (s.email && s.email.toLowerCase().trim() === target) || (s.guestEmail && s.guestEmail.toLowerCase().trim() === target));
  },

  async getSubmissionsByUserId(userId) {
    const store = readStore();
    return store.submissions.filter((s) => s.userId === userId);
  },

  async getAllSubmissions() {
    const store = readStore();
    return store.submissions;
  },

  async countSubmissions() {
    const store = readStore();
    return store.submissions.length;
  },

  async countUsers() {
    const store = readStore();
    return store.users.length;
  }
};

module.exports = fallbackStore;
