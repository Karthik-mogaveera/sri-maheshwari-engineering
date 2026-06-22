/**
 * routes/aboutPeople.js
 * ─────────────────────────────────────────────────────────────
 * Module-wise backend for About → People tab.
 * Fields: image, name, designation, description
 * Mirrors routes/slideshow.js structure exactly.
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const pool    = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ── Multer storage ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'about_people');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    cb(null, `person_${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  allowed.includes(path.extname(file.originalname).toLowerCase())
    ? cb(null, true)
    : cb(new Error('Only JPG, PNG, WEBP images are allowed.'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const imageUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/about_people/${filename}`;

// ── GET all (protected) ────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM about_people ORDER BY sort_order ASC, id ASC'
    );
    res.json({
      success: true,
      people: rows.map(r => ({ ...r, image_url: imageUrl(req, r.image_filename) }))
    });
  } catch (err) {
    console.error('GET about_people error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch.' });
  }
});

// ── GET public (no auth) ───────────────────────────────────────
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM about_people WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    res.json({
      success: true,
      people: rows.map(r => ({
        id: r.id, name: r.name, designation: r.designation,
        description: r.description, image_url: imageUrl(req, r.image_filename)
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, people: [] });
  }
});

// ── POST create ────────────────────────────────────────────────
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name, designation, description } = req.body;
    if (!req.file)    return res.status(400).json({ success: false, message: 'Image is required.' });
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required.' });

    const [result] = await pool.query(
      `INSERT INTO about_people (image_filename, name, designation, description, sort_order)
       VALUES (?, ?, ?, ?, (SELECT IFNULL(MAX(p.sort_order),0)+1 FROM about_people p))`,
      [req.file.filename, name.trim(), (designation||'').trim(), (description||'').trim()]
    );
    const [rows] = await pool.query('SELECT * FROM about_people WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true, message: 'Person added successfully.',
      person: { ...rows[0], image_url: imageUrl(req, rows[0].image_filename) }
    });
  } catch (err) {
    console.error('POST about_people error:', err);
    res.status(500).json({ success: false, message: 'Failed to create.' });
  }
});

// ── PUT update ─────────────────────────────────────────────────
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, description } = req.body;
    const [existing] = await pool.query('SELECT * FROM about_people WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Not found.' });

    let filename = existing[0].image_filename;
    if (req.file) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'about_people', filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      filename = req.file.filename;
    }

    await pool.query(
      'UPDATE about_people SET image_filename=?, name=?, designation=?, description=? WHERE id=?',
      [
        filename,
        (name || existing[0].name).trim(),
        ((designation ?? existing[0].designation) || '').trim(),
        ((description ?? existing[0].description) || '').trim(),
        id
      ]
    );
    const [rows] = await pool.query('SELECT * FROM about_people WHERE id = ?', [id]);
    res.json({
      success: true, message: 'Updated successfully.',
      person: { ...rows[0], image_url: imageUrl(req, rows[0].image_filename) }
    });
  } catch (err) {
    console.error('PUT about_people error:', err);
    res.status(500).json({ success: false, message: 'Failed to update.' });
  }
});

// ── DELETE ─────────────────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM about_people WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Not found.' });
    const fp = path.join(__dirname, '..', 'uploads', 'about_people', existing[0].image_filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    await pool.query('DELETE FROM about_people WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Deleted successfully.' });
  } catch (err) {
    console.error('DELETE about_people error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete.' });
  }
});

module.exports = router;