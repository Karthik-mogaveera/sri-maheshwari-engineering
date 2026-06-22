/**
 * routes/whoweare.js
 * ─────────────────────────────────────────────────────────────
 * Module-wise backend for "Who We Are" section.
 * Table: who_we_are  (single-row design — only one entry allowed)
 *
 * GET    /api/admin/whoweare         → fetch the entry (public + admin)
 * POST   /api/admin/whoweare         → create (only if no entry exists) [protected]
 * PUT    /api/admin/whoweare         → update existing entry [protected]
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const pool    = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/whoweare
//  Public — used by both admin panel and homepage.
//  Returns the single who_we_are row, or null if not written yet.
// ══════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM who_we_are ORDER BY id ASC LIMIT 1'
    );
    res.json({
      success: true,
      data: rows.length > 0 ? rows[0] : null
    });
  } catch (err) {
    console.error('GET who_we_are error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch content.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/admin/whoweare  [Protected]
//  Creates the entry — only allowed if table is currently empty.
//  Body: { content }
// ══════════════════════════════════════════════════════════════
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required.' });
    }

    // Guard: only one entry allowed
    const [existing] = await pool.query('SELECT id FROM who_we_are LIMIT 1');
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Entry already exists. Use PUT to update it.'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO who_we_are (content) VALUES (?)',
      [content.trim()]
    );

    const [rows] = await pool.query('SELECT * FROM who_we_are WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Content saved successfully.',
      data: rows[0]
    });
  } catch (err) {
    console.error('POST who_we_are error:', err);
    res.status(500).json({ success: false, message: 'Failed to save content.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/admin/whoweare  [Protected]
//  Updates the single existing entry.
//  Body: { content }
// ══════════════════════════════════════════════════════════════
router.put('/', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required.' });
    }

    const [existing] = await pool.query('SELECT id FROM who_we_are LIMIT 1');
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No entry found. Use POST to create one first.'
      });
    }

    await pool.query(
      'UPDATE who_we_are SET content = ?, updated_at = NOW() WHERE id = ?',
      [content.trim(), existing[0].id]
    );

    const [rows] = await pool.query('SELECT * FROM who_we_are WHERE id = ?', [existing[0].id]);

    res.json({
      success: true,
      message: 'Content updated successfully.',
      data: rows[0]
    });
  } catch (err) {
    console.error('PUT who_we_are error:', err);
    res.status(500).json({ success: false, message: 'Failed to update content.' });
  }
});

module.exports = router;