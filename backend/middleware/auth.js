const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // Fail fast — never fall back to a hardcoded/predictable secret.
  throw new Error(
    'JWT_SECRET is not set. Define it in your .env file before starting the server.'
  );
}

/**
 * verifyToken — Express middleware
 * Checks Authorization: Bearer <token> header.
 * Attaches decoded payload to req.admin on success.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;   // { id, email, name, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(403).json({ success: false, message: 'Invalid token.' });
  }
};

/**
 * requireSuperAdmin — optional second middleware for super-admin only routes
 */
const requireSuperAdmin = (req, res, next) => {
  if (req.admin?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Super admin access required.' });
  }
  next();
};

module.exports = { verifyToken, requireSuperAdmin };