-- ============================================================
--  Run this in your MySQL database: sri_maheshwari
--  mysql -u root -p sri_maheshwari < hero_slides_table.sql
-- ============================================================

USE sri_maheshwari;

CREATE TABLE IF NOT EXISTS hero_slides (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  image_filename   VARCHAR(255)   NOT NULL,           -- stored filename on disk
  title            VARCHAR(255)   NOT NULL,           -- slide heading
  subject          VARCHAR(500)   NULL,               -- slide sub-text
  sort_order       INT            DEFAULT 0,          -- display order
  is_active        TINYINT(1)     DEFAULT 1,
  created_at       DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SELECT 'hero_slides table ready.' AS STATUS;
