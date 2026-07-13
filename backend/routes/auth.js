const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';   // token valid for 8 hours

if (!JWT_SECRET) {
  // Fail fast — never fall back to a hardcoded/predictable secret.
  throw new Error(
    'JWT_SECRET is not set. Define it in your .env file before starting the server.'
  );
}

/* ──────────────────────────────────────────────
   Rate limiter for login attempts
   Max 5 attempts per IP per 15 minutes.
   Successful logins don't count against the limit.
────────────────────────────────────────────── */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 5,                     // limit each IP to 5 login requests per window
  standardHeaders: true,      // return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed login attempts
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

/* ──────────────────────────────────────────────
   POST /api/admin/auth/login
   Body: { email, password }
   Returns: { success, token, admin: { id, name, email, role } }
────────────────────────────────────────────── */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Look up admin
    const [rows] = await pool.query(
      'SELECT * FROM admin_users WHERE email = ? AND is_active = 1 LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const admin = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      // Log failed attempt
      await pool.query(
        'UPDATE admin_users SET failed_attempts = failed_attempts + 1 WHERE id = ?',
        [admin.id]
      );
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Reset failed attempts & update last login
    await pool.query(
      'UPDATE admin_users SET failed_attempts = 0, last_login = NOW() WHERE id = ?',
      [admin.id]
    );

    // Sign JWT
    const payload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: payload
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

/* ──────────────────────────────────────────────
   GET /api/admin/auth/me   [Protected]
   Returns current admin info from token
────────────────────────────────────────────── */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, last_login, created_at FROM admin_users WHERE id = ? AND is_active = 1',
      [req.admin.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    res.json({ success: true, admin: rows[0] });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ──────────────────────────────────────────────
   POST /api/admin/auth/change-password   [Protected]
   Body: { currentPassword, newPassword }
────────────────────────────────────────────── */
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const [rows] = await pool.query('SELECT * FROM admin_users WHERE id = ?', [req.admin.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Admin not found.' });

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, req.admin.id]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ──────────────────────────────────────────────
   POST /api/admin/auth/logout   [Protected]
   (JWT is stateless — client drops token.
    This endpoint is a clean hook for audit logs.)
────────────────────────────────────────────── */
router.post('/logout', verifyToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE admin_users SET last_logout = NOW() WHERE id = ?',
      [req.admin.id]
    );
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;