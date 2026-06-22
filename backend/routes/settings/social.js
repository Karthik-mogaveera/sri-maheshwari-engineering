/**
 * routes/settings/social.js
 * Single-row: facebook, instagram, twitter, linkedin, youtube, whatsapp
 */
const express = require('express');
const pool    = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const router  = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings_social LIMIT 1');
    res.json({ success: true, data: rows[0] || null });
  } catch { res.status(500).json({ success: false, message: 'Failed to fetch.' }); }
});

router.put('/', verifyToken, async (req, res) => {
  try {
    const { facebook, instagram, twitter, linkedin, youtube, whatsapp } = req.body;
    const vals = [facebook||null, instagram||null, twitter||null, linkedin||null, youtube||null, whatsapp||null];
    const [existing] = await pool.query('SELECT id FROM settings_social LIMIT 1');
    if (existing[0]) {
      await pool.query(
        'UPDATE settings_social SET facebook=?,instagram=?,twitter=?,linkedin=?,youtube=?,whatsapp=? WHERE id=?',
        [...vals, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO settings_social (facebook,instagram,twitter,linkedin,youtube,whatsapp) VALUES (?,?,?,?,?,?)', vals
      );
    }
    const [updated] = await pool.query('SELECT * FROM settings_social LIMIT 1');
    res.json({ success: true, message: 'Social media links saved.', data: updated[0] });
  } catch { res.status(500).json({ success: false, message: 'Failed to save.' }); }
});

module.exports = router;