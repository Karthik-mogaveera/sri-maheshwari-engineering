/**
 * routes/aboutCompany.js
 * ─────────────────────────────────────────────────────────────
 * Module-wise backend for About → Company tab.
 * Table: about_company  (single-row — only one entry allowed)
 * Mirrors routes/whoweare.js exactly.
 *
 * GET  /api/admin/about-company   → fetch entry (public + admin)
 * POST /api/admin/about-company   → create (only if empty) [protected]
 * PUT  /api/admin/about-company   → update existing [protected]
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const pool    = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/about-company  (public — used by frontend too)
// ══════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM about_company ORDER BY id ASC LIMIT 1'
    );
    res.json({ success: true, data: rows.length > 0 ? rows[0] : null });
  } catch (err) {
    console.error('GET about_company error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch content.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/admin/about-company  [Protected]
//  Create — only if table is currently empty.
//  Body: { content }
// ══════════════════════════════════════════════════════════════
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim())
      return res.status(400).json({ success: false, message: 'Content is required.' });

    // Guard: only one entry allowed
    const [existing] = await pool.query('SELECT id FROM about_company LIMIT 1');
    if (existing.length > 0)
      return res.status(409).json({
        success: false,
        message: 'Entry already exists. Use PUT to update it.'
      });

    const [result] = await pool.query(
      'INSERT INTO about_company (content) VALUES (?)',
      [content.trim()]
    );

    const [rows] = await pool.query(
      'SELECT * FROM about_company WHERE id = ?', [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Content saved successfully.',
      data: rows[0]
    });
  } catch (err) {
    console.error('POST about_company error:', err);
    res.status(500).json({ success: false, message: 'Failed to save content.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/admin/about-company  [Protected]
//  Update the single existing entry.
//  Body: { content }
// ══════════════════════════════════════════════════════════════
router.put('/', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim())
      return res.status(400).json({ success: false, message: 'Content is required.' });

    const [existing] = await pool.query('SELECT id FROM about_company LIMIT 1');
    if (existing.length === 0)
      return res.status(404).json({
        success: false,
        message: 'No entry found. Use POST to create one first.'
      });

    await pool.query(
      'UPDATE about_company SET content = ?, updated_at = NOW() WHERE id = ?',
      [content.trim(), existing[0].id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM about_company WHERE id = ?', [existing[0].id]
    );

    res.json({
      success: true,
      message: 'Content updated successfully.',
      data: rows[0]
    });
  } catch (err) {
    console.error('PUT about_company error:', err);
    res.status(500).json({ success: false, message: 'Failed to update content.' });
  }
});

module.exports = router;