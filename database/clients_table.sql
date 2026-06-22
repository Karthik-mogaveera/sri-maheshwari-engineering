-- ============================================================
--  Run in your MySQL database: sri_maheshwari
--  mysql -u root -p sri_maheshwari < backend/clients_table.sql
-- ============================================================

USE sri_maheshwari;

CREATE TABLE IF NOT EXISTS clients (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  image_filename   VARCHAR(255)   NOT NULL,           -- stored filename on disk
  name             VARCHAR(255)   NOT NULL,           -- client / partner name
  sort_order       INT            DEFAULT 0,          -- display order
  is_active        TINYINT(1)     DEFAULT 1,
  created_at       DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SELECT 'clients table ready.' AS STATUS;