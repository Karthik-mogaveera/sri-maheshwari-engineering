/**
 * routes/slideshow.js
 * ─────────────────────────────────────────────────────────────
 * Module-wise backend for Slideshow (Hero Slides) management.
 * Handles: GET all slides, POST new slide, PUT update slide, DELETE slide.
 * Images are stored on disk at /uploads/slides/ and served statically.
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ── Multer storage config ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'slides');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `slide_${Date.now()}${ext}`;
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
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

// ── Helper: build public image URL ────────────────────────────
const imageUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/slides/${filename}`;

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/slideshow
//  Returns all slides ordered by sort_order
// ══════════════════════════════════════════════════════════════
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC'
    );
    // Attach full URL to each row
    const slides = rows.map(r => ({
      ...r,
      image_url: r.image_filename
        ? imageUrl(req, r.image_filename)
        : null
    }));
    res.json({ success: true, slides });
  } catch (err) {
    console.error('GET slides error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch slides.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/admin/slideshow
//  Create a new slide. Expects multipart/form-data.
//  Fields: image (file), title (text), subject (text)
// ══════════════════════════════════════════════════════════════
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, subject } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required.' });
    }
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO hero_slides (image_filename, title, subject, sort_order)
       VALUES (?, ?, ?, (SELECT IFNULL(MAX(s.sort_order),0)+1 FROM hero_slides s))`,
      [req.file.filename, title.trim(), (subject || '').trim()]
    );

    const [rows] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [result.insertId]);
    const slide = { ...rows[0], image_url: imageUrl(req, rows[0].image_filename) };

    res.status(201).json({ success: true, message: 'Slide uploaded successfully.', slide });
  } catch (err) {
    console.error('POST slide error:', err);
    res.status(500).json({ success: false, message: 'Failed to create slide.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/admin/slideshow/:id
//  Update title, subject, and optionally replace image.
// ══════════════════════════════════════════════════════════════
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject } = req.body;

    // Fetch existing slide
    const [existing] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Slide not found.' });
    }

    let filename = existing[0].image_filename;

    // If a new image was uploaded, delete the old one and use the new filename
    if (req.file) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'slides', filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      filename = req.file.filename;
    }

    await pool.query(
      `UPDATE hero_slides SET image_filename = ?, title = ?, subject = ? WHERE id = ?`,
      [filename, (title || existing[0].title).trim(), ((subject ?? existing[0].subject) || '').trim(), id]
    );

    const [rows] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [id]);
    const slide = { ...rows[0], image_url: imageUrl(req, rows[0].image_filename) };

    res.json({ success: true, message: 'Slide updated successfully.', slide });
  } catch (err) {
    console.error('PUT slide error:', err);
    res.status(500).json({ success: false, message: 'Failed to update slide.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  DELETE /api/admin/slideshow/:id
//  Removes DB record + image file from disk.
// ══════════════════════════════════════════════════════════════
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Slide not found.' });
    }

    // Delete image file from disk
    const filePath = path.join(__dirname, '..', 'uploads', 'slides', existing[0].image_filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM hero_slides WHERE id = ?', [id]);

    res.json({ success: true, message: 'Slide deleted successfully.' });
  } catch (err) {
    console.error('DELETE slide error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete slide.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/slides  (PUBLIC — no auth required)
//  Used by the homepage HeroSlider to load slides from the DB.
//  Returns only active slides ordered by sort_order.
// ══════════════════════════════════════════════════════════════
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    const slides = rows.map(r => ({
      id:        r.id,
      title:     r.title,
      subject:   r.subject,
      image_url: r.image_filename
        ? `${req.protocol}://${req.get('host')}/uploads/slides/${r.image_filename}`
        : null
    }));
    res.json({ success: true, slides });
  } catch (err) {
    console.error('Public slides error:', err);
    res.status(500).json({ success: false, slides: [] });
  }
});


module.exports = router;
