/**
 * routes/settings/seo.js
 * Single-row: meta_title, meta_description, meta_keywords,
 *             og_title, og_description, og_image, canonical_url
 */
const express = require('express');
const pool    = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const router  = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings_seo LIMIT 1');
    res.json({ success: true, data: rows[0] || null });
  } catch { res.status(500).json({ success: false, message: 'Failed to fetch.' }); }
});

router.put('/', verifyToken, async (req, res) => {
  try {
    const { meta_title, meta_description, meta_keywords, og_title, og_description, og_image, canonical_url } = req.body;
    const vals = [meta_title||null, meta_description||null, meta_keywords||null,
                  og_title||null, og_description||null, og_image||null, canonical_url||null];
    const [existing] = await pool.query('SELECT id FROM settings_seo LIMIT 1');
    if (existing[0]) {
      await pool.query(
        `UPDATE settings_seo
           SET meta_title=?,meta_description=?,meta_keywords=?,
               og_title=?,og_description=?,og_image=?,canonical_url=?
         WHERE id=?`,
        [...vals, existing[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO settings_seo
           (meta_title,meta_description,meta_keywords,og_title,og_description,og_image,canonical_url)
         VALUES (?,?,?,?,?,?,?)`, vals
      );
    }
    const [updated] = await pool.query('SELECT * FROM settings_seo LIMIT 1');
    res.json({ success: true, message: 'SEO settings saved.', data: updated[0] });
  } catch { res.status(500).json({ success: false, message: 'Failed to save.' }); }
});

module.exports = router;