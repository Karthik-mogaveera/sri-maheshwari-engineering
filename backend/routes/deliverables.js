/**
 * routes/deliverables.js
 * ─────────────────────────────────────────────────────────────
 * Module-wise backend for "Deliverables" section.
 * Table: deliverables  (single-row design — only one entry allowed)
 * Content stored as plain text with bullet-point lines (•  item).
 *
 * GET  /api/admin/deliverables         → fetch entry (public + admin)
 * POST /api/admin/deliverables         → create (only if empty) [protected]
 * PUT  /api/admin/deliverables         → update existing [protected]
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const pool    = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/deliverables  (public)
// ══════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM deliverables ORDER BY id ASC LIMIT 1'
    );
    res.json({ success: true, data: rows.length > 0 ? rows[0] : null });
  } catch (err) {
    console.error('GET deliverables error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch content.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/admin/deliverables  [Protected]
//  Create — only allowed if table is currently empty.
//  Body: { content }
// ══════════════════════════════════════════════════════════════
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim())
      return res.status(400).json({ success: false, message: 'Content is required.' });

    const [existing] = await pool.query('SELECT id FROM deliverables LIMIT 1');
    if (existing.length > 0)
      return res.status(409).json({ success: false, message: 'Entry already exists. Use PUT to update.' });

    const [result] = await pool.query(
      'INSERT INTO deliverables (content) VALUES (?)', [content.trim()]
    );
    const [rows] = await pool.query('SELECT * FROM deliverables WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Deliverables saved.', data: rows[0] });
  } catch (err) {
    console.error('POST deliverables error:', err);
    res.status(500).json({ success: false, message: 'Failed to save content.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/admin/deliverables  [Protected]
//  Update the single existing entry.
//  Body: { content }
// ══════════════════════════════════════════════════════════════
router.put('/', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim())
      return res.status(400).json({ success: false, message: 'Content is required.' });

    const [existing] = await pool.query('SELECT id FROM deliverables LIMIT 1');
    if (existing.length === 0)
      return res.status(404).json({ success: false, message: 'No entry found. Use POST to create first.' });

    await pool.query(
      'UPDATE deliverables SET content = ?, updated_at = NOW() WHERE id = ?',
      [content.trim(), existing[0].id]
    );
    const [rows] = await pool.query('SELECT * FROM deliverables WHERE id = ?', [existing[0].id]);
    res.json({ success: true, message: 'Deliverables updated.', data: rows[0] });
  } catch (err) {
    console.error('PUT deliverables error:', err);
    res.status(500).json({ success: false, message: 'Failed to update content.' });
  }
});

module.exports = router;