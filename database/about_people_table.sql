-- ============================================================
--  Run in your MySQL database: sri_maheshwari
--  mysql -u root -p sri_maheshwari < backend/about_people_table.sql
-- ============================================================

USE sri_maheshwari;

CREATE TABLE IF NOT EXISTS about_people (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  image_filename   VARCHAR(255)   NOT NULL,
  name             VARCHAR(255)   NOT NULL,
  designation      VARCHAR(255)   NULL,
  description      TEXT           NULL,
  sort_order       INT            DEFAULT 0,
  is_active        TINYINT(1)     DEFAULT 1,
  created_at       DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SELECT 'about_people table ready.' AS STATUS;