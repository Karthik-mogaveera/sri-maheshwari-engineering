const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/* ──────────────────────────────────────────────
   GET /api/admin/dashboard/stats   [Protected]
   Returns aggregate counts for dashboard cards.
────────────────────────────────────────────── */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Run all counts in parallel
    const [
      [contactRows],
      [projectRows],
      [serviceRows],
      [adminRows]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM contact_messages'),
      pool.query('SELECT COUNT(*) AS total FROM projects'),
      pool.query('SELECT COUNT(*) AS total FROM services'),
      pool.query('SELECT COUNT(*) AS total FROM admin_users WHERE is_active = 1')
    ]);

    res.json({
      success: true,
      stats: {
        totalInquiries: contactRows[0].total,
        totalProjects: projectRows[0].total,
        totalServices: serviceRows[0].total,
        totalAdmins: adminRows[0].total
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ──────────────────────────────────────────────
   GET /api/admin/dashboard/recent-inquiries   [Protected]
   Returns last 5 contact messages
────────────────────────────────────────────── */
router.get('/recent-inquiries', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, subject, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 5'
    );
    res.json({ success: true, inquiries: rows });
  } catch (err) {
    console.error('Recent inquiries error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
