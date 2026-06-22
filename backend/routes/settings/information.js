/**
 * routes/settings/information.js
 * Single-row settings: logo, favicon, phone, email, address, map_url
 */
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const pool    = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads', 'settings');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = ['.jpg','.jpeg','.png','.webp','.svg','.ico'].includes(
      path.extname(file.originalname).toLowerCase()
    );
    cb(ok ? null : new Error('Image files only'), ok);
  },
  limits: { fileSize: 2 * 1024 * 1024 }
}).fields([
  { name: 'logo',    maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]);

const imgUrl = (req, f) =>
  f ? `${req.protocol}://${req.get('host')}/uploads/settings/${f}` : null;

const deleteFile = (f) => {
  if (!f) return;
  const p = path.join(__dirname, '..', '..', 'uploads', 'settings', f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
};

// GET /api/admin/settings/information
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings_information LIMIT 1');
    const row = rows[0] || null;
    res.json({
      success: true,
      data: row ? {
        ...row,
        logo_url:    imgUrl(req, row.logo_filename),
        favicon_url: imgUrl(req, row.favicon_filename)
      } : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch.' });
  }
});

// PUT /api/admin/settings/information  (create or update)
router.put('/', verifyToken, (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { phone, email, address, map_url } = req.body;
    const [existing] = await pool.query('SELECT * FROM settings_information LIMIT 1');
    const row = existing[0];

    let logoFile    = row?.logo_filename    || null;
    let faviconFile = row?.favicon_filename || null;

    if (req.files?.logo?.[0]) {
      deleteFile(logoFile);
      logoFile = req.files.logo[0].filename;
    }
    if (req.files?.favicon?.[0]) {
      deleteFile(faviconFile);
      faviconFile = req.files.favicon[0].filename;
    }

    if (row) {
      await pool.query(
        `UPDATE settings_information
           SET logo_filename=?, favicon_filename=?, phone=?, email=?, address=?, map_url=?
         WHERE id=?`,
        [logoFile, faviconFile, phone||null, email||null, address||null, map_url||null, row.id]
      );
    } else {
      await pool.query(
        `INSERT INTO settings_information (logo_filename, favicon_filename, phone, email, address, map_url)
         VALUES (?,?,?,?,?,?)`,
        [logoFile, faviconFile, phone||null, email||null, address||null, map_url||null]
      );
    }

    const [updated] = await pool.query('SELECT * FROM settings_information LIMIT 1');
    const d = updated[0];
    res.json({
      success: true, message: 'Information saved.',
      data: { ...d, logo_url: imgUrl(req, d.logo_filename), favicon_url: imgUrl(req, d.favicon_filename) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to save.' });
  }
});

module.exports = router;