const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  submissionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  isGuest: {
    type: Boolean,
    default: true
  },
  demographics: {
    age: { type: String, default: '' },
    gender: { type: String, default: '' },
    role: { type: String, default: '' },
    organization: { type: String, default: '' },
    qualification: { type: String, default: '' },
    course: { type: String, default: '' },
    stage: { type: String, default: '' }
  },
  answers: {
    type: [Number],
    required: true
  },
  scores: {
    values: [{
      key: String,
      code: String,
      name: String,
      score: Number,
      quotient: Number,
      level: Number
    }],
    total: Number,
    huq: Number,
    level: Number,
    strongest: [String],
    max: Number
  },
  emailed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
