-- ============================================================
--  SMEE Admin Panel — Database Setup
--  Run once: mysql -u root -p sri_maheshwari < setup.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS sri_maheshwari CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sri_maheshwari;

-- ── Admin Users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(120)        NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255)        NOT NULL,
  role           ENUM('superadmin','admin','editor') DEFAULT 'admin',
  is_active      TINYINT(1)          DEFAULT 1,
  failed_attempts INT                DEFAULT 0,
  last_login     DATETIME            NULL,
  last_logout    DATETIME            NULL,
  created_at     DATETIME            DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- ── Seed: Default Super Admin ─────────────────────────────────
-- Password: Admin@1234  (bcrypt hash — CHANGE IMMEDIATELY AFTER FIRST LOGIN)
INSERT IGNORE INTO admin_users (name, email, password_hash, role)
VALUES (
  'SMEE Admin',
  'admin@smeeindia.com',
  '$2a$12$K8HzuFwBfCJGAKzNBVCx4eTRlWq5jfS.O/9hS.sH5nFnMONvDfWWu',
  'superadmin'
);

SELECT 'Setup complete. Login: admin@smeeindia.com / Admin@1234' AS STATUS;
