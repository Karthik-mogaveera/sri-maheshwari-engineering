/**
 * routes/inquiries.js
 * ─────────────────────────────────────────────────────────────
 * Admin inquiries management — module-wise, protected.
 *
 * GET  /api/admin/inquiries           → paginated list with filters
 * GET  /api/admin/inquiries/stats     → summary counts
 * GET  /api/admin/inquiries/:id       → single inquiry detail
 * PUT  /api/admin/inquiries/:id/read  → mark as read/unread
 * PUT  /api/admin/inquiries/:id/star  → toggle starred flag
 * DELETE /api/admin/inquiries/:id     → soft delete (sets deleted_at)
 * DELETE /api/admin/inquiries/bulk    → bulk delete
 * GET  /api/admin/inquiries/export    → CSV export
 * ─────────────────────────────────────────────────────────────
 */

const express      = require('express');
const pool         = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ══════════════════════════════════════════════════════════════
//  PATCH TABLE — add starred + deleted_at columns if missing
//  (idempotent — safe to run repeatedly)
// ══════════════════════════════════════════════════════════════
async function ensureColumns() {
  const conn = await pool.getConnection();
  try {
    // starred column
    await conn.query(`
      ALTER TABLE inquiries
      ADD COLUMN IF NOT EXISTS is_starred TINYINT(1) DEFAULT 0
    `).catch(() => {});
    // soft-delete column
    await conn.query(`
      ALTER TABLE inquiries
      ADD COLUMN IF NOT EXISTS deleted_at DATETIME DEFAULT NULL
    `).catch(() => {});
  } finally {
    conn.release();
  }
}
ensureColumns();

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/inquiries/stats  [Protected]
// ══════════════════════════════════════════════════════════════
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const [[row]] = await pool.query(`
      SELECT
        COUNT(*)                                     AS total,
        SUM(is_read = 0 AND deleted_at IS NULL)      AS unread,
        SUM(is_read = 1 AND deleted_at IS NULL)      AS read_count,
        SUM(is_starred = 1 AND deleted_at IS NULL)   AS starred,
        SUM(deleted_at IS NOT NULL)                  AS deleted,
        SUM(DATE(created_at) = CURDATE()
            AND deleted_at IS NULL)                  AS today
      FROM inquiries
    `);
    res.json({ success: true, stats: row });
  } catch (err) {
    console.error('Inquiry stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/inquiries  [Protected]
//  Query params:
//    page     (default 1)
//    limit    (default 20, max 100)
//    status   all | unread | read | starred | deleted
//    search   full-text across name/email/company/message
//    sort     newest | oldest | name
// ══════════════════════════════════════════════════════════════
router.get('/', verifyToken, async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const status = req.query.status || 'all';
    const search = (req.query.search || '').trim();
    const sort   = req.query.sort   || 'newest';

    const conditions = [];
    const params     = [];

    // Status filter
    if (status === 'unread')  { conditions.push('is_read = 0 AND deleted_at IS NULL'); }
    else if (status === 'read')    { conditions.push('is_read = 1 AND deleted_at IS NULL'); }
    else if (status === 'starred') { conditions.push('is_starred = 1 AND deleted_at IS NULL'); }
    else if (status === 'deleted') { conditions.push('deleted_at IS NOT NULL'); }
    else                           { conditions.push('deleted_at IS NULL'); }

    // Search
    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR company_name LIKE ? OR message LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sort
    const orderMap = {
      newest: 'created_at DESC',
      oldest: 'created_at ASC',
      name:   'name ASC',
    };
    const order = orderMap[sort] || 'created_at DESC';

    // Count
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM inquiries ${where}`, params
    );

    // Rows
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, company_name,
              LEFT(message, 120) AS message_preview,
              is_read, is_starred, ip_address, created_at
       FROM inquiries ${where}
       ORDER BY ${order}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      inquiries: rows,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('GET inquiries error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch inquiries.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/inquiries/export  [Protected]
//  Returns CSV of non-deleted inquiries matching filters
// ══════════════════════════════════════════════════════════════
router.get('/export', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, company_name, message,
              is_read, is_starred, ip_address, created_at
       FROM inquiries WHERE deleted_at IS NULL
       ORDER BY created_at DESC`
    );

    const headers = ['ID','Name','Email','Phone','Company','Message','Read','Starred','IP','Date'];
    const escape  = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const csv = [
      headers.join(','),
      ...rows.map(r => [
        r.id, r.name, r.email, r.phone || '',
        r.company_name || '', r.message,
        r.is_read ? 'Yes' : 'No',
        r.is_starred ? 'Yes' : 'No',
        r.ip_address || '',
        new Date(r.created_at).toLocaleString('en-IN')
      ].map(escape).join(','))
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition',
      `attachment; filename="inquiries_${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ success: false, message: 'Export failed.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/admin/inquiries/:id  [Protected]
//  Full detail + auto-marks as read
// ══════════════════════════════════════════════════════════════
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM inquiries WHERE id = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found.' });

    // Auto mark as read when opened
    if (!rows[0].is_read) {
      await pool.query('UPDATE inquiries SET is_read = 1 WHERE id = ?', [req.params.id]);
      rows[0].is_read = 1;
    }
    res.json({ success: true, inquiry: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch inquiry.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/admin/inquiries/:id/read  [Protected]
//  Body: { is_read: 0|1 }
// ══════════════════════════════════════════════════════════════
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const val = req.body.is_read ? 1 : 0;
    await pool.query('UPDATE inquiries SET is_read = ? WHERE id = ?', [val, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  PUT /api/admin/inquiries/:id/star  [Protected]
//  Toggles is_starred
// ══════════════════════════════════════════════════════════════
router.put('/:id/star', verifyToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE inquiries SET is_starred = NOT is_starred WHERE id = ?',
      [req.params.id]
    );
    const [[row]] = await pool.query(
      'SELECT is_starred FROM inquiries WHERE id = ?', [req.params.id]
    );
    res.json({ success: true, is_starred: row.is_starred });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle star.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  DELETE /api/admin/inquiries/:id  [Protected]
//  Soft delete — sets deleted_at
// ══════════════════════════════════════════════════════════════
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE inquiries SET deleted_at = NOW() WHERE id = ?', [req.params.id]
    );
    res.json({ success: true, message: 'Inquiry moved to trash.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  DELETE /api/admin/inquiries/bulk  [Protected]
//  Body: { ids: [1,2,3] }
// ══════════════════════════════════════════════════════════════
router.delete('/bulk/delete', verifyToken, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Boolean) : [];
    if (!ids.length) return res.status(400).json({ success: false, message: 'No IDs provided.' });
    await pool.query(
      `UPDATE inquiries SET deleted_at = NOW() WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    );
    res.json({ success: true, message: `${ids.length} inquiry/inquiries moved to trash.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Bulk delete failed.' });
  }
});

module.exports = router;