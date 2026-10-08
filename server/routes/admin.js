const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const HUQ = require('../huq-data');
const { db } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

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

// GET /api/admin/user-data?email=...
router.get('/user-data', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const email = req.query.email ? String(req.query.email).trim().toLowerCase() : '';
    if (!email) {
      return res.status(400).json({ ok: false, error: 'User email query parameter is required.' });
    }

    const registeredUser = await db.findUserByEmail(email);
    const submissions = await db.getSubmissionsByEmail(email);

    res.json({
      ok: true,
      data: {
        email,
        isRegistered: !!registeredUser,
        user: registeredUser ? {
          id: registeredUser._id || registeredUser.id,
          name: registeredUser.name,
          email: registeredUser.email,
          role: registeredUser.role,
          createdAt: registeredUser.createdAt
        } : null,
        submissions: submissions.map((s) => ({
          submissionId: s.submissionId || s.id,
          name: s.name,
          email: s.email,
          demographics: s.demographics,
          scores: s.scores,
          answers: s.answers,
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
