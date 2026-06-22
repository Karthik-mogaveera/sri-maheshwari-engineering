-- ============================================================
--  Settings tables for SMEE Admin Panel
--  mysql -u root -p sri_maheshwari < backend/settings_tables.sql
-- ============================================================

USE sri_maheshwari;

-- ── Information ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings_information (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  logo_filename    VARCHAR(255)   NULL,
  favicon_filename VARCHAR(255)   NULL,
  phone            VARCHAR(30)    NULL,
  email            VARCHAR(255)   NULL,
  address          TEXT           NULL,
  map_url          TEXT           NULL,
  updated_at       DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Social Media ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings_social (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  facebook    VARCHAR(500)   NULL,
  instagram   VARCHAR(500)   NULL,
  twitter     VARCHAR(500)   NULL,
  linkedin    VARCHAR(500)   NULL,
  youtube     VARCHAR(500)   NULL,
  whatsapp    VARCHAR(30)    NULL,
  updated_at  DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── SEO ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings_seo (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  meta_title      VARCHAR(255)   NULL,
  meta_description VARCHAR(500)  NULL,
  meta_keywords   TEXT           NULL,
  og_title        VARCHAR(255)   NULL,
  og_description  VARCHAR(500)   NULL,
  og_image        VARCHAR(500)   NULL,
  canonical_url   VARCHAR(500)   NULL,
  updated_at      DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Security ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings_security (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  admin_email           VARCHAR(255)   NULL,
  two_factor_enabled    TINYINT(1)     DEFAULT 0,
  session_timeout_mins  INT            DEFAULT 480,
  maintenance_mode      TINYINT(1)     DEFAULT 0,
  login_attempts_limit  INT            DEFAULT 5,
  updated_at            DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SELECT 'All settings tables ready.' AS STATUS;