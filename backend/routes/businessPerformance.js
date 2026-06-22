/**
 * routes/businessPerformance.js
 * ─────────────────────────────────────────────────────────────
 * Module-wise backend for About → Performance tab.
 * Table: business_performance (multi-row)
 *
 * GET /api/admin/business-performance   → fetch all rows (public + admin)
 * PUT /api/admin/business-performance   → bulk replace all rows [protected]
 *      Body: { rows: [ { financial_year, annual_turnover }, ... ] }
 *      The whole table is rewritten on every save — simplest way
 *      to support "Add Row" / edit / reorder from a single form.
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const pool    = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/business-performance  (public)
// ══════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM business_performance ORDER BY sort_order ASC, id ASC'
    );
    res.json({ success: true, rows });
  } catch (err) {
    console.error('GET business_performance error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch data.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/admin/business-performance  [Protected]
//  Bulk replace — deletes all existing rows and inserts the
//  provided array in order, assigning sort_order 0..n-1.
//  Body: { rows: [ { financial_year, annual_turnover }, ... ] }
// ══════════════════════════════════════════════════════════════
router.put('/', verifyToken, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows)) {
      conn.release();
      return res.status(400).json({ success: false, message: 'rows must be an array.' });
    }

    // Validate each row
    for (const r of rows) {
      if (!r.financial_year?.trim() || !r.annual_turnover?.toString().trim()) {
        conn.release();
        return res.status(400).json({
          success: false,
          message: 'Each row must have a financial year and annual turnover.'
        });
      }
    }

    await conn.beginTransaction();

    // Wipe existing rows
    await conn.query('DELETE FROM business_performance');

    // Insert fresh rows with sort_order = array index
    for (let i = 0; i < rows.length; i++) {
      await conn.query(
        'INSERT INTO business_performance (financial_year, annual_turnover, sort_order) VALUES (?, ?, ?)',
        [rows[i].financial_year.trim(), rows[i].annual_turnover.toString().trim(), i]
      );
    }

    await conn.commit();

    const [saved] = await conn.query(
      'SELECT * FROM business_performance ORDER BY sort_order ASC, id ASC'
    );

    res.json({ success: true, message: 'Business performance data saved successfully.', rows: saved });
  } catch (err) {
    await conn.rollback();
    console.error('PUT business_performance error:', err);
    res.status(500).json({ success: false, message: 'Failed to save data.' });
  } finally {
    conn.release();
  }
});

module.exports = router;