/**
 * routes/settings/socialMedia.js
 * ─────────────────────────────────────────────────────────────
 * Full CRUD for the social_media table.
 *
 * GET    /api/admin/settings/social-media          → list all (protected)
 * GET    /api/admin/settings/social-media/public   → list all (public, for footer)
 * POST   /api/admin/settings/social-media          → create entry [protected]
 * PUT    /api/admin/settings/social-media/:id      → update entry [protected]
 * DELETE /api/admin/settings/social-media/:id      → delete entry [protected]
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const pool    = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');

const router = express.Router();

// ── GET all (admin — protected) ────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM social_media ORDER BY sort_order ASC, id ASC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET social_media error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch.' });
  }
});

// ── GET all (public — used by footer) ─────────────────────────
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, icon, link FROM social_media ORDER BY sort_order ASC, id ASC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET social_media public error:', err);
    res.status(500).json({ success: false, data: [] });
  }
});

// ── POST create ────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, icon, link } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: 'Name is required.' });
    if (!icon || !icon.trim())
      return res.status(400).json({ success: false, message: 'Icon is required.' });
    if (!link || !link.trim())
      return res.status(400).json({ success: false, message: 'Link is required.' });

    const [result] = await pool.query(
      `INSERT INTO social_media (name, icon, link, sort_order)
       VALUES (?, ?, ?, (SELECT IFNULL(MAX(s.sort_order), 0) + 1 FROM social_media s))`,
      [name.trim(), icon.trim(), link.trim()]
    );

    const [rows] = await pool.query(
      'SELECT * FROM social_media WHERE id = ?', [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Social media added.', data: rows[0] });
  } catch (err) {
    console.error('POST social_media error:', err);
    res.status(500).json({ success: false, message: 'Failed to create.' });
  }
});

// ── PUT update ─────────────────────────────────────────────────
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, link } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: 'Name is required.' });
    if (!icon || !icon.trim())
      return res.status(400).json({ success: false, message: 'Icon is required.' });
    if (!link || !link.trim())
      return res.status(400).json({ success: false, message: 'Link is required.' });

    const [existing] = await pool.query('SELECT id FROM social_media WHERE id = ?', [id]);
    if (!existing.length)
      return res.status(404).json({ success: false, message: 'Entry not found.' });

    await pool.query(
      'UPDATE social_media SET name = ?, icon = ?, link = ?, updated_at = NOW() WHERE id = ?',
      [name.trim(), icon.trim(), link.trim(), id]
    );

    const [rows] = await pool.query('SELECT * FROM social_media WHERE id = ?', [id]);
    res.json({ success: true, message: 'Social media updated.', data: rows[0] });
  } catch (err) {
    console.error('PUT social_media error:', err);
    res.status(500).json({ success: false, message: 'Failed to update.' });
  }
});

// ── DELETE ─────────────────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM social_media WHERE id = ?', [id]);
    if (!existing.length)
      return res.status(404).json({ success: false, message: 'Entry not found.' });

    await pool.query('DELETE FROM social_media WHERE id = ?', [id]);
    res.json({ success: true, message: 'Social media deleted.' });
  } catch (err) {
    console.error('DELETE social_media error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete.' });
  }
});

module.exports = router;