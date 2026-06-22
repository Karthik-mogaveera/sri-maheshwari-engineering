/**
 * routes/projects.js
 * ─────────────────────────────────────────────────────────────
 * Module-wise backend for Projects management.
 * Tables: projects (1) ──< project_works (many)
 *
 * A project has: name, image, and a list of "works"
 * (each work = work_name + work_image).
 *
 * Images stored at /uploads/projects/ and /uploads/project_works/
 * and served statically via /uploads.
 *
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
// Single storage; destination decided by fieldname.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'image' ? 'projects' : 'project_works';
    const dir = path.join(__dirname, '..', 'uploads', folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = file.fieldname === 'image' ? 'project' : 'work';
    cb(null, `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only JPG, PNG, WEBP images are allowed.'), false);
};

// Accept the main project "image" plus any number of "work_image_N" files
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }   // 5 MB per file
}).any();

// ── Helpers ─────────────────────────────────────────────────────
const projectImageUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/projects/${filename}`;
const workImageUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/project_works/${filename}`;

const deleteFile = (folder, filename) => {
  if (!filename) return;
  const fp = path.join(__dirname, '..', 'uploads', folder, filename);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
};

// Fetch a project with its works attached
const getProjectWithWorks = async (req, id) => {
  const [[project]] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
  if (!project) return null;
  const [works] = await pool.query(
    'SELECT * FROM project_works WHERE project_id = ? ORDER BY sort_order ASC, id ASC', [id]
  );
  return {
    ...project,
    image_url: projectImageUrl(req, project.image_filename),
    works: works.map(w => ({ ...w, image_url: workImageUrl(req, w.image_filename) }))
  };
};

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/projects  [Protected]
// ══════════════════════════════════════════════════════════════
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM projects ORDER BY sort_order ASC, id ASC'
    );
    const projects = [];
    for (const r of rows) projects.push(await getProjectWithWorks(req, r.id));
    res.json({ success: true, projects });
  } catch (err) {
    console.error('GET projects error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch projects.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/projects/public  (PUBLIC — no auth)
// ══════════════════════════════════════════════════════════════
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM projects WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    const projects = [];
    for (const r of rows) projects.push(await getProjectWithWorks(req, r.id));
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, projects: [] });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/admin/projects  [Protected]
//  multipart/form-data fields:
//    name              — project name
//    image             — project main image (file)
//    works             — JSON string: [{ name, new_image_index }]
//    work_image_0..N   — files referenced by new_image_index
// ══════════════════════════════════════════════════════════════
router.post('/', verifyToken, upload, async (req, res) => {
  try {
    const { name } = req.body;
    let works = [];
    try { works = JSON.parse(req.body.works || '[]'); } catch { works = []; }

    const projectImageFile = req.files?.find(f => f.fieldname === 'image');

    if (!projectImageFile) return res.status(400).json({ success: false, message: 'Project image is required.' });
    if (!name?.trim())      return res.status(400).json({ success: false, message: 'Project name is required.' });

    // Validate every work has a name + an image (new upload required on create)
    for (let i = 0; i < works.length; i++) {
      if (!works[i].name?.trim()) {
        return res.status(400).json({ success: false, message: `Work #${i + 1} needs a name.` });
      }
      const f = req.files?.find(f => f.fieldname === `work_image_${i}`);
      if (!f) {
        return res.status(400).json({ success: false, message: `Work #${i + 1} needs an image.` });
      }
    }

    // Insert project
    const [result] = await pool.query(
      `INSERT INTO projects (name, image_filename, sort_order)
       VALUES (?, ?, (SELECT IFNULL(MAX(p.sort_order),0)+1 FROM projects p))`,
      [name.trim(), projectImageFile.filename]
    );
    const projectId = result.insertId;

    // Insert works
    for (let i = 0; i < works.length; i++) {
      const f = req.files.find(f => f.fieldname === `work_image_${i}`);
      await pool.query(
        'INSERT INTO project_works (project_id, work_name, image_filename, sort_order) VALUES (?, ?, ?, ?)',
        [projectId, works[i].name.trim(), f.filename, i]
      );
    }

    const project = await getProjectWithWorks(req, projectId);
    res.status(201).json({ success: true, message: 'Project added successfully.', project });
  } catch (err) {
    console.error('POST project error:', err);
    res.status(500).json({ success: false, message: 'Failed to create project.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/admin/projects/:id  [Protected]
//  multipart/form-data fields:
//    name              — project name
//    image             — (optional) new project image
//    works             — JSON string: [{ name, existing_image, new_image_index }]
//    work_image_0..N   — files referenced by new_image_index
//
//  Strategy: full replace of project_works rows on every update —
//  simplest reliable approach for add/edit/remove in one form.
// ══════════════════════════════════════════════════════════════
router.put('/:id', verifyToken, upload, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    let works = [];
    try { works = JSON.parse(req.body.works || '[]'); } catch { works = []; }

    const [existingRows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (existingRows.length === 0) return res.status(404).json({ success: false, message: 'Project not found.' });
    const existingProject = existingRows[0];

    // ── Project image (optional replace) ──
    let projectImageFilename = existingProject.image_filename;
    const newProjectImage = req.files?.find(f => f.fieldname === 'image');
    if (newProjectImage) {
      deleteFile('projects', projectImageFilename);
      projectImageFilename = newProjectImage.filename;
    }

    await pool.query(
      'UPDATE projects SET name = ?, image_filename = ? WHERE id = ?',
      [(name || existingProject.name).trim(), projectImageFilename, id]
    );

    // ── Works: validate ──
    for (let i = 0; i < works.length; i++) {
      if (!works[i].name?.trim()) {
        return res.status(400).json({ success: false, message: `Work #${i + 1} needs a name.` });
      }
      const hasNew = works[i].new_image_index !== null && works[i].new_image_index !== undefined;
      if (!hasNew && !works[i].existing_image) {
        return res.status(400).json({ success: false, message: `Work #${i + 1} needs an image.` });
      }
    }

    // ── Fetch old works to know which image files to clean up ──
    const [oldWorks] = await pool.query('SELECT * FROM project_works WHERE project_id = ?', [id]);

    // Determine final filename for each incoming work
    const finalFilenames = [];
    for (let i = 0; i < works.length; i++) {
      const w = works[i];
      const hasNew = w.new_image_index !== null && w.new_image_index !== undefined;
      if (hasNew) {
        const f = req.files.find(f => f.fieldname === `work_image_${w.new_image_index}`);
        finalFilenames.push(f ? f.filename : w.existing_image);
      } else {
        finalFilenames.push(w.existing_image);
      }
    }

    // Delete old image files that are no longer referenced
    for (const ow of oldWorks) {
      if (!finalFilenames.includes(ow.image_filename)) {
        deleteFile('project_works', ow.image_filename);
      }
    }

    // Replace all rows
    await pool.query('DELETE FROM project_works WHERE project_id = ?', [id]);
    for (let i = 0; i < works.length; i++) {
      await pool.query(
        'INSERT INTO project_works (project_id, work_name, image_filename, sort_order) VALUES (?, ?, ?, ?)',
        [id, works[i].name.trim(), finalFilenames[i], i]
      );
    }

    const project = await getProjectWithWorks(req, id);
    res.json({ success: true, message: 'Project updated successfully.', project });
  } catch (err) {
    console.error('PUT project error:', err);
    res.status(500).json({ success: false, message: 'Failed to update project.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  DELETE /api/admin/projects/:id  [Protected]
//  Removes project + all its works (DB + image files).
// ══════════════════════════════════════════════════════════════
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (existingRows.length === 0) return res.status(404).json({ success: false, message: 'Project not found.' });

    const [works] = await pool.query('SELECT * FROM project_works WHERE project_id = ?', [id]);
    for (const w of works) deleteFile('project_works', w.image_filename);
    deleteFile('projects', existingRows[0].image_filename);

    // project_works rows cascade-delete via FK
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    console.error('DELETE project error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete project.' });
  }
});

module.exports = router;