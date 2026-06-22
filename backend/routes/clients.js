/**
 * routes/clients.js
 * ─────────────────────────────────────────────────────────────
 * Module-wise backend for Clients management.
 * Handles: GET all, POST create, PUT update, DELETE — with image upload.
 * Images stored at /uploads/clients/ and served statically.
 * Mirrors the structure of routes/services.js for consistency.
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
    const dir = path.join(__dirname, '..', 'uploads', 'clients');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `client_${Date.now()}${ext}`;
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
  limits: { fileSize: 5 * 1024 * 1024 }  // 5 MB max
});

// ── Helper: build public image URL ────────────────────────────
const imageUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/clients/${filename}`;

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/clients  [Protected]
//  Returns all clients ordered by sort_order.
// ══════════════════════════════════════════════════════════════
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM clients ORDER BY sort_order ASC, id ASC'
    );
    const clients = rows.map(r => ({
      ...r,
      image_url: r.image_filename ? imageUrl(req, r.image_filename) : null
    }));
    res.json({ success: true, clients });
  } catch (err) {
    console.error('GET clients error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch clients.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/clients/public  (PUBLIC — no auth)
//  Used by the homepage Clients section.
// ══════════════════════════════════════════════════════════════
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM clients WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    const clients = rows.map(r => ({
      id:         r.id,
      name:       r.name,
      image_url:  r.image_filename ? imageUrl(req, r.image_filename) : null,
      sort_order: r.sort_order
    }));
    res.json({ success: true, clients });
  } catch (err) {
    console.error('Public clients error:', err);
    res.status(500).json({ success: false, clients: [] });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/admin/clients  [Protected]
//  Create a new client. multipart/form-data.
//  Fields: image (file), name (text)
// ══════════════════════════════════════════════════════════════
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required.' });
    }
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Client name is required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO clients (image_filename, name, sort_order)
       VALUES (?, ?, (SELECT IFNULL(MAX(c.sort_order), 0) + 1 FROM clients c))`,
      [req.file.filename, name.trim()]
    );

    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [result.insertId]);
    const client = { ...rows[0], image_url: imageUrl(req, rows[0].image_filename) };

    res.status(201).json({ success: true, message: 'Client uploaded successfully.', client });
  } catch (err) {
    console.error('POST client error:', err);
    res.status(500).json({ success: false, message: 'Failed to create client.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/admin/clients/:id  [Protected]
//  Update name and optionally replace image.
// ══════════════════════════════════════════════════════════════
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { id }  = req.params;
    const { name } = req.body;

    const [existing] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    let filename = existing[0].image_filename;

    // Replace image on disk if a new one was uploaded
    if (req.file) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'clients', filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      filename = req.file.filename;
    }

    await pool.query(
      'UPDATE clients SET image_filename = ?, name = ? WHERE id = ?',
      [filename, (name || existing[0].name).trim(), id]
    );

    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    const client = { ...rows[0], image_url: imageUrl(req, rows[0].image_filename) };

    res.json({ success: true, message: 'Client updated successfully.', client });
  } catch (err) {
    console.error('PUT client error:', err);
    res.status(500).json({ success: false, message: 'Failed to update client.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  DELETE /api/admin/clients/:id  [Protected]
//  Removes DB record + image file from disk.
// ══════════════════════════════════════════════════════════════
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    // Delete image file from disk
    const filePath = path.join(__dirname, '..', 'uploads', 'clients', existing[0].image_filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM clients WHERE id = ?', [id]);

    res.json({ success: true, message: 'Client deleted successfully.' });
  } catch (err) {
    console.error('DELETE client error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete client.' });
  }
});

module.exports = router;