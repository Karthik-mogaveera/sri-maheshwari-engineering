-- ============================================================
--  Run in your MySQL database: sri_maheshwari
--  mysql -u root -p sri_maheshwari < backend/services_table.sql
-- ============================================================

USE sri_maheshwari;

CREATE TABLE IF NOT EXISTS services (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  image_filename   VARCHAR(255)   NOT NULL,           -- stored filename on disk
  title            VARCHAR(255)   NOT NULL,           -- service title
  short_desc       TEXT           NULL,               -- short description (card view)
  full_desc        LONGTEXT       NULL,               -- full/detailed description
  sort_order       INT            DEFAULT 0,          -- display order
  is_active        TINYINT(1)     DEFAULT 1,
  created_at       DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SELECT 'services table ready.' AS STATUS;
