/**
 * routes/services.js
 * ─────────────────────────────────────────────────────────────
 * Module-wise backend for Services management.
 * Handles: GET all, POST create, PUT update, DELETE — with image upload.
 * Images stored at /uploads/services/ and served statically.
 * Mirrors the structure of routes/slideshow.js for consistency.
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const pool    = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ── Multer storage config ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'services');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `service_${Date.now()}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only JPG, PNG, WEBP images are allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }   // 5 MB max
});

// ── Helper: build public image URL ────────────────────────────
const imageUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/services/${filename}`;

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/services
//  Returns all services ordered by sort_order. [Protected]
// ══════════════════════════════════════════════════════════════
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM services ORDER BY sort_order ASC, id ASC'
    );
    const services = rows.map(r => ({
      ...r,
      image_url: r.image_filename ? imageUrl(req, r.image_filename) : null
    }));
    res.json({ success: true, services });
  } catch (err) {
    console.error('GET services error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/services/public  (PUBLIC — no auth)
//  Used by the homepage Services section.
// ══════════════════════════════════════════════════════════════
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    const services = rows.map(r => ({
      id:           r.id,
      title:        r.title,
      short_desc:   r.short_desc,
      full_desc:    r.full_desc,
      image_url:    r.image_filename ? imageUrl(req, r.image_filename) : null,
      sort_order:   r.sort_order
    }));
    res.json({ success: true, services });
  } catch (err) {
    console.error('Public services error:', err);
    res.status(500).json({ success: false, services: [] });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/admin/services  [Protected]
//  Create a new service. multipart/form-data.
//  Fields: image (file), title, short_desc, full_desc
// ══════════════════════════════════════════════════════════════
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, short_desc, full_desc } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required.' });
    }
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO services (image_filename, title, short_desc, full_desc, sort_order)
       VALUES (?, ?, ?, ?, (SELECT IFNULL(MAX(s.sort_order), 0) + 1 FROM services s))`,
      [
        req.file.filename,
        title.trim(),
        (short_desc || '').trim(),
        (full_desc  || '').trim()
      ]
    );

    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [result.insertId]);
    const service = { ...rows[0], image_url: imageUrl(req, rows[0].image_filename) };

    res.status(201).json({ success: true, message: 'Service uploaded successfully.', service });
  } catch (err) {
    console.error('POST service error:', err);
    res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/admin/services/:id  [Protected]
//  Update title, short_desc, full_desc, optionally replace image.
// ══════════════════════════════════════════════════════════════
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, short_desc, full_desc } = req.body;

    const [existing] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    let filename = existing[0].image_filename;

    // Replace image on disk if a new one was uploaded
    if (req.file) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'services', filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      filename = req.file.filename;
    }

    await pool.query(
      `UPDATE services
         SET image_filename = ?, title = ?, short_desc = ?, full_desc = ?
       WHERE id = ?`,
      [
        filename,
        (title      || existing[0].title).trim(),
        ((short_desc ?? existing[0].short_desc) || '').trim(),
        ((full_desc  ?? existing[0].full_desc)  || '').trim(),
        id
      ]
    );

    const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    const service = { ...rows[0], image_url: imageUrl(req, rows[0].image_filename) };

    res.json({ success: true, message: 'Service updated successfully.', service });
  } catch (err) {
    console.error('PUT service error:', err);
    res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  DELETE /api/admin/services/:id  [Protected]
//  Removes DB record + image file from disk.
// ══════════════════════════════════════════════════════════════
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    // Delete image file from disk
    const filePath = path.join(__dirname, '..', 'uploads', 'services', existing[0].image_filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM services WHERE id = ?', [id]);

    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    console.error('DELETE service error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
});

module.exports = router;