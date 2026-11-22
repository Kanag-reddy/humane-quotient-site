const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const HUQ = require('../huq-data');
const { db } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const ADMIN_SUBMISSION_SORT_FIELDS = {
  name: 'name',
  email: 'email',
  organization: 'demographics.organization',
  huq: 'scores.huq',
  careLevel: 'scores.level',
  version: 'version',
  createdAt: 'createdAt'
};

// GET /api/admin/overview
router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const submissions = await db.getAllSubmissions();
    const totalUsers = await db.countUsers();
    const totalSubmissions = submissions.length;

    let totalHuqSum = 0;
    const valueSums = { se: 0, em: 0, in: 0, ac: 0, re: 0, eq: 0, di: 0, ic: 0 };
    const levelCounts = [0, 0, 0]; // 0: Self, 1: Socio, 2: Universal
    let guestCount = 0;

    submissions.forEach((sub) => {
      if (sub.isGuest) guestCount++;
      const sc = sub.scores;
      if (sc) {
        totalHuqSum += sc.total || 0;
        if (typeof sc.level === 'number' && sc.level >= 0 && sc.level <= 2) {
          levelCounts[sc.level]++;
        }
        if (Array.isArray(sc.values)) {
          sc.values.forEach((v) => {
            if (valueSums[v.key] !== undefined) {
              valueSums[v.key] += (v.score || 0);
            }
          });
        }
      }
    });

    const avgOverallHuq = totalSubmissions ? (totalHuqSum / totalSubmissions / 48) : 0;
    const quotientAverages = HUQ.values.map((v) => {
      const sum = valueSums[v.key] || 0;
      const avgScore = totalSubmissions ? (sum / totalSubmissions) : 0;
      return {
        key: v.key,
        code: v.code,
        name: v.name,
        averageScore: Math.round(avgScore * 10) / 10,
        averageQuotient: Math.round((avgScore / 6) * 10) / 10
      };
    });

    res.json({
      ok: true,
      stats: {
        totalSubmissions,
        totalUsers,
        guestSubmissions: guestCount,
        registeredSubmissions: totalSubmissions - guestCount,
        avgHuq: Math.round(avgOverallHuq * 10) / 10,
        careLevels: {
          selfCare: levelCounts[0],
          socioCare: levelCounts[1],
          universalCare: levelCounts[2]
        },
        quotientAverages,
        recentSubmissions: submissions.slice(0, 8).map((s) => ({
          id: s.submissionId || s.id,
          name: s.name,
          email: s.email,
          huq: s.scores ? Math.round(s.scores.huq * 10) / 10 : 0,
          careLevel: s.scores ? HUQ.levels[s.scores.level]?.name : 'N/A',
          isGuest: s.isGuest,
          createdAt: s.createdAt
        }))
      }
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ ok: false, error: 'Failed to generate overview statistics.' });
  }
});

// GET /api/admin/submissions?page=1&limit=50&sortBy=createdAt&sortOrder=desc
router.get('/submissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'createdAt';
    const sortOrder = req.query.sortOrder ? String(req.query.sortOrder).toLowerCase() : 'desc';
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);

    if (!Object.prototype.hasOwnProperty.call(ADMIN_SUBMISSION_SORT_FIELDS, sortBy)) {
      return res.status(400).json({ ok: false, error: 'Unsupported submissions sort field.' });
    }
    if (!['asc', 'desc'].includes(sortOrder)) {
      return res.status(400).json({ ok: false, error: 'Sort order must be asc or desc.' });
    }
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({ ok: false, error: 'Page must be a positive integer.' });
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ ok: false, error: 'Page size must be between 1 and 100.' });
    }

    const { submissions, total } = await db.getAdminSubmissions({
      sortField: ADMIN_SUBMISSION_SORT_FIELDS[sortBy],
      sortOrder: sortOrder === 'asc' ? 1 : -1,
      skip: (page - 1) * limit,
      limit
    });

    res.json({
      ok: true,
      data: {
        submissions: submissions.map((submission) => ({
          id: submission.submissionId || submission.id,
          name: submission.name,
          email: submission.email,
          organization: submission.demographics?.organization || '',
          huq: Number.isFinite(submission.scores?.huq)
            ? Math.round(submission.scores.huq * 10) / 10
            : 0,
          careLevel: HUQ.levels[submission.scores?.level]?.name || 'N/A',
          isGuest: submission.isGuest,
          version: submission.version || 'full',
          createdAt: submission.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Admin submissions query error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch submissions.' });
  }
});

// GET /api/admin/user-data?name=...&organization=...&...
router.get('/user-data', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const email = req.query.email ? String(req.query.email).trim().toLowerCase() : '';
    const textFilters = {
      name: 'name',
      email: 'email',
      organization: 'demographics.organization',
      role: 'demographics.role',
      age: 'demographics.age',
      gender: 'demographics.gender',
      qualification: 'demographics.qualification',
      course: 'demographics.course',
      submissionId: 'submissionId'
    };
    const clauses = [];

    for (const [parameter, field] of Object.entries(textFilters)) {
      const value = req.query[parameter] ? String(req.query[parameter]).trim() : '';
      if (!value) continue;
      if (value.length > 100) {
        return res.status(400).json({ ok: false, error: `${parameter} must be 100 characters or fewer.` });
      }
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      clauses.push({ [field]: { $regex: escapedValue, $options: 'i' } });
    }

    const version = req.query.version ? String(req.query.version).trim().toLowerCase() : '';
    if (version) {
      if (!['full', 'quick'].includes(version)) {
        return res.status(400).json({ ok: false, error: 'Test type must be full or quick.' });
      }
      clauses.push({ version });
    }

    const careLevel = req.query.careLevel === undefined || req.query.careLevel === ''
      ? null
      : Number(req.query.careLevel);
    if (careLevel !== null) {
      if (!Number.isInteger(careLevel) || careLevel < 0 || careLevel > 2) {
        return res.status(400).json({ ok: false, error: 'Care level must be between 0 and 2.' });
      }
      clauses.push({ 'scores.level': careLevel });
    }

    const scoreRange = {};
    for (const parameter of ['minHuq', 'maxHuq']) {
      if (req.query[parameter] === undefined || req.query[parameter] === '') continue;
      const score = Number(req.query[parameter]);
      if (!Number.isFinite(score) || score < 0 || score > 10) {
        return res.status(400).json({ ok: false, error: `${parameter} must be a number from 0 to 10.` });
      }
      scoreRange[parameter === 'minHuq' ? '$gte' : '$lte'] = score;
    }
    if (Object.keys(scoreRange).length) clauses.push({ 'scores.huq': scoreRange });

    if (!clauses.length) {
      return res.status(400).json({ ok: false, error: 'Enter at least one search filter.' });
    }
    if (scoreRange.$gte !== undefined && scoreRange.$lte !== undefined && scoreRange.$gte > scoreRange.$lte) {
      return res.status(400).json({ ok: false, error: 'HuQ minimum cannot be greater than HuQ maximum.' });
    }

    const query = clauses.length === 1 ? clauses[0] : { $and: clauses };
    const { submissions, total } = await db.searchSubmissions(query);
    const exactEmailOnly = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && clauses.length === 1 && req.query.name === undefined &&
      req.query.organization === undefined && req.query.role === undefined && req.query.age === undefined &&
      req.query.gender === undefined && req.query.qualification === undefined && req.query.course === undefined &&
      req.query.submissionId === undefined && req.query.version === undefined && req.query.careLevel === undefined &&
      req.query.minHuq === undefined && req.query.maxHuq === undefined;
    const registeredUser = exactEmailOnly
      ? await db.findUserByEmail(email)
      : null;

    res.json({
      ok: true,
      data: {
        email: exactEmailOnly ? email : '',
        isRegistered: !!registeredUser,
        user: registeredUser ? {
          id: registeredUser._id || registeredUser.id,
          name: registeredUser.name,
          email: registeredUser.email,
          role: registeredUser.role,
          createdAt: registeredUser.createdAt
        } : null,
        totalMatches: total,
        truncated: total > submissions.length,
        submissions: submissions.map((s) => ({
          submissionId: s.submissionId || s.id,
          name: s.name,
          email: s.email,
          demographics: s.demographics,
          scores: s.scores,
          ...(exactEmailOnly ? { answers: s.answers } : {}),
          emailed: s.emailed,
          createdAt: s.createdAt
        }))
      }
    });
  } catch (err) {
    console.error('Admin user-data error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch user data.' });
  }
});

// GET /api/admin/download-excel
router.get('/download-excel', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const submissions = await db.getAllSubmissions();
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Humane Quotient Website';
    const ws = wb.addWorksheet('Responses');

    const HEADERS = ['Response ID', 'Submitted Date', 'Name', 'Email', 'Type', 'Age Group', 'Gender', 'Role', 'Organization', 'Qualification'];
    HUQ.values.forEach((v) => HEADERS.push(`${v.code} Score (/60)`));
    HUQ.values.forEach((v) => HEADERS.push(`${v.code} Quotient (/10)`));
    HEADERS.push('HuQ Total (/480)', 'HuQ (/10)', 'Care Level');
    ws.addRow(HEADERS);

    submissions.forEach((s) => {
      const demo = s.demographics || {};
      const sc = s.scores || {};
      const valMap = {};
      (sc.values || []).forEach((v) => { valMap[v.key] = v; });

      const row = [
        s.submissionId || s.id,
        new Date(s.createdAt).toISOString().slice(0, 19).replace('T', ' '),
        s.name,
        s.email,
        s.isGuest ? 'Guest' : 'User',
        demo.age || '',
        demo.gender || '',
        demo.role || '',
        demo.organization || '',
        demo.qualification || ''
      ];
      HUQ.values.forEach((v) => row.push(valMap[v.key] ? valMap[v.key].score : ''));
      HUQ.values.forEach((v) => row.push(valMap[v.key] ? (Math.round(valMap[v.key].quotient * 10) / 10) : ''));
      row.push(sc.total || '', sc.huq ? (Math.round(sc.huq * 10) / 10) : '', sc.level !== undefined ? HUQ.levels[sc.level]?.name : '');
      ws.addRow(row);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=HuQ_Responses.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Download excel error:', err);
    res.status(500).json({ ok: false, error: 'Could not generate Excel spreadsheet.' });
  }
});

module.exports = router;
