/**
 * routes/supplyVendors.js
 * ─────────────────────────────────────────────────────────────
 * Module-wise backend for Supply Vendors management.
 * Fields: image, name — mirrors routes/clients.js exactly.
 * Images stored at /uploads/supply_vendors/
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
    const dir = path.join(__dirname, '..', 'uploads', 'supply_vendors');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `vendor_${Date.now()}${ext}`);
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
  `${req.protocol}://${req.get('host')}/uploads/supply_vendors/${filename}`;

// ── GET all (protected) ────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM supply_vendors ORDER BY sort_order ASC, id ASC'
    );
    res.json({
      success: true,
      vendors: rows.map(r => ({ ...r, image_url: imageUrl(req, r.image_filename) }))
    });
  } catch (err) {
    console.error('GET supply_vendors error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch vendors.' });
  }
});

// ── GET public (no auth) ───────────────────────────────────────
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM supply_vendors WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    res.json({
      success: true,
      vendors: rows.map(r => ({ id: r.id, name: r.name, image_url: imageUrl(req, r.image_filename) }))
    });
  } catch (err) {
    res.status(500).json({ success: false, vendors: [] });
  }
});

// ── POST create ────────────────────────────────────────────────
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!req.file)    return res.status(400).json({ success: false, message: 'Image is required.' });
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Vendor name is required.' });

    const [result] = await pool.query(
      `INSERT INTO supply_vendors (image_filename, name, sort_order)
       VALUES (?, ?, (SELECT IFNULL(MAX(v.sort_order), 0) + 1 FROM supply_vendors v))`,
      [req.file.filename, name.trim()]
    );
    const [rows] = await pool.query('SELECT * FROM supply_vendors WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true, message: 'Vendor added successfully.',
      vendor: { ...rows[0], image_url: imageUrl(req, rows[0].image_filename) }
    });
  } catch (err) {
    console.error('POST supply_vendor error:', err);
    res.status(500).json({ success: false, message: 'Failed to create vendor.' });
  }
});

// ── PUT update ─────────────────────────────────────────────────
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const [existing] = await pool.query('SELECT * FROM supply_vendors WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Vendor not found.' });

    let filename = existing[0].image_filename;
    if (req.file) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'supply_vendors', filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      filename = req.file.filename;
    }
    await pool.query(
      'UPDATE supply_vendors SET image_filename = ?, name = ? WHERE id = ?',
      [filename, (name || existing[0].name).trim(), id]
    );
    const [rows] = await pool.query('SELECT * FROM supply_vendors WHERE id = ?', [id]);
    res.json({
      success: true, message: 'Vendor updated successfully.',
      vendor: { ...rows[0], image_url: imageUrl(req, rows[0].image_filename) }
    });
  } catch (err) {
    console.error('PUT supply_vendor error:', err);
    res.status(500).json({ success: false, message: 'Failed to update vendor.' });
  }
});

// ── DELETE ─────────────────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM supply_vendors WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Vendor not found.' });
    const fp = path.join(__dirname, '..', 'uploads', 'supply_vendors', existing[0].image_filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    await pool.query('DELETE FROM supply_vendors WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Vendor deleted successfully.' });
  } catch (err) {
    console.error('DELETE supply_vendor error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete vendor.' });
  }
});

module.exports = router;