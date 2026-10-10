const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const HUQ = require('../huq-data');
const { db } = require('../config/db');
const { optionalToken, authenticateToken } = require('../middleware/auth');
const { sendReportEmail } = require('../utils/mailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function matchesSubmission(existing, answers, email) {
  return !!existing &&
    String(existing.email || '').toLowerCase() === email &&
    Array.isArray(existing.answers) &&
    existing.answers.length === answers.length &&
    existing.answers.every((answer, index) => answer === answers[index]);
}

// POST /api/submit
router.post('/submit', optionalToken, async (req, res) => {
  let subId = '';
  let submittedAnswers = null;
  let respondentEmail = '';
  try {
    const { answers, demographics, name, email, submissionId, sendEmail } = req.body || {};

    if (!Array.isArray(answers) || answers.length !== HUQ.totalQuestions ||
        !answers.every((a) => Number.isInteger(a) && a >= 1 && a <= 5)) {
      return res.status(400).json({ ok: false, error: 'Invalid answers. Exactly 96 answers (1–5) required.' });
    }

    if (submissionId !== undefined && (typeof submissionId !== 'string' || submissionId.trim().length > 100)) {
      return res.status(400).json({ ok: false, error: 'Invalid submission ID.' });
    }

    const respondentName = String(name || (req.user && req.user.name) || 'Anonymous').trim().slice(0, 80);
    respondentEmail = String(email || (req.user && req.user.email) || '').trim().toLowerCase();

    if (!respondentEmail || !EMAIL_RE.test(respondentEmail)) {
      return res.status(400).json({ ok: false, error: 'A valid email address is required.' });
    }

    submittedAnswers = answers;
    const calculatedResult = HUQ.score(answers);
    subId = submissionId ? submissionId.trim() : ('HuQ-' + crypto.randomBytes(4).toString('hex').toUpperCase());

    if (submissionId) {
      const existing = await db.findSubmissionById(subId);
      if (existing) {
        if (!matchesSubmission(existing, answers, respondentEmail)) {
          return res.status(409).json({ ok: false, error: 'This submission ID is already associated with a different response.' });
        }
        return res.json({
          ok: true,
          id: subId,
          result: existing.scores || calculatedResult,
          emailed: !!existing.emailed
        });
      }
    }

    const isGuest = !req.user;
    const userId = req.user ? (req.user._id || req.user.id) : null;

    let emailed = false;
    if (sendEmail !== false) {
      emailed = await sendReportEmail(respondentName, respondentEmail, calculatedResult);
    }

    const submissionDoc = {
      submissionId: subId,
      userId,
      name: respondentName,
      email: respondentEmail,
      isGuest,
      demographics: demographics || {},
      answers,
      scores: calculatedResult,
      emailed
    };

    await db.createSubmission(submissionDoc);

    res.json({
      ok: true,
      id: subId,
      result: calculatedResult,
      emailed
    });
  } catch (err) {
    if (err && err.code === 11000 && subId && submittedAnswers) {
      try {
        const existing = await db.findSubmissionById(subId);
        if (matchesSubmission(existing, submittedAnswers, respondentEmail)) {
          return res.json({
            ok: true,
            id: subId,
            result: existing.scores || HUQ.score(submittedAnswers),
            emailed: !!existing.emailed
          });
        }
      } catch (lookupErr) {
        console.error('Could not verify duplicate submission:', lookupErr);
      }
    }
    console.error('Submission error:', err);
    res.status(500).json({ ok: false, error: 'Could not record test response.' });
  }
});

// GET /api/my-submissions (logged-in user history)
router.get('/my-submissions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let submissions = await db.getSubmissionsByUserId(userId);
    if (!submissions || submissions.length === 0) {
      submissions = await db.getSubmissionsByEmail(req.user.email);
    }
    res.json({ ok: true, submissions });
  } catch (err) {
    console.error('Fetch my submissions error:', err);
    res.status(500).json({ ok: false, error: 'Could not fetch your submission history.' });
  }
});

// POST /api/share-report (share results to an entered email)
router.post('/share-report', async (req, res) => {
  try {
    const { targetEmail, name, results } = req.body || {};
    if (!targetEmail || !EMAIL_RE.test(String(targetEmail).trim())) {
      return res.status(400).json({ ok: false, error: 'A valid target email address is required.' });
    }
    if (!results || !results.huq) {
      return res.status(400).json({ ok: false, error: 'Test results are required to share.' });
    }

    const success = await sendReportEmail(name || 'Friend', String(targetEmail).trim(), results);
    if (!success) {
      return res.status(500).json({ ok: false, error: 'Email service is currently offline. Please print or save as PDF.' });
    }

    res.json({ ok: true, message: `Report successfully sent to ${targetEmail}` });
  } catch (err) {
    console.error('Share report error:', err);
    res.status(500).json({ ok: false, error: 'Could not share report.' });
  }
});

module.exports = router;
