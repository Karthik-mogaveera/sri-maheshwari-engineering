/**
 * routes/settings/security.js
 * Single-row security config + change-password endpoint.
 */
const express = require('express');
const bcrypt  = require('bcryptjs');
const pool    = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const router  = express.Router();

// GET security settings
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings_security LIMIT 1');
    res.json({ success: true, data: rows[0] || null });
  } catch { res.status(500).json({ success: false, message: 'Failed to fetch.' }); }
});

// PUT security settings (non-password fields)
router.put('/', verifyToken, async (req, res) => {
  try {
    const {
      admin_email, two_factor_enabled, session_timeout_mins,
      maintenance_mode, login_attempts_limit
    } = req.body;
    const vals = [
      admin_email||null,
      two_factor_enabled ? 1 : 0,
      parseInt(session_timeout_mins) || 480,
      maintenance_mode ? 1 : 0,
      parseInt(login_attempts_limit) || 5
    ];
    const [existing] = await pool.query('SELECT id FROM settings_security LIMIT 1');
    if (existing[0]) {
      await pool.query(
        `UPDATE settings_security
           SET admin_email=?,two_factor_enabled=?,session_timeout_mins=?,
               maintenance_mode=?,login_attempts_limit=?
         WHERE id=?`,
        [...vals, existing[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO settings_security
           (admin_email,two_factor_enabled,session_timeout_mins,maintenance_mode,login_attempts_limit)
         VALUES (?,?,?,?,?)`, vals
      );
    }
    const [updated] = await pool.query('SELECT * FROM settings_security LIMIT 1');
    res.json({ success: true, message: 'Security settings saved.', data: updated[0] });
  } catch { res.status(500).json({ success: false, message: 'Failed to save.' }); }
});

// POST /api/admin/settings/security/change-password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'All password fields are required.' });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword))
      return res.status(400).json({ success: false, message: 'Password must contain uppercase, number and special character.' });

    const [rows] = await pool.query('SELECT * FROM admin_users WHERE id = ?', [req.admin.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE admin_users SET password_hash=? WHERE id=?', [hash, req.admin.id]);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch { res.status(500).json({ success: false, message: 'Failed to change password.' }); }
});

module.exports = router;