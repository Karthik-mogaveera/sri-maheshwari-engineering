-- ============================================================
--  Run in your MySQL database: sri_maheshwari
--  mysql -u root -p sri_maheshwari < backend/about_company_table.sql
-- ============================================================

USE sri_maheshwari;

CREATE TABLE IF NOT EXISTS about_company (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  content    LONGTEXT      NOT NULL,
  created_at DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SELECT 'about_company table ready.' AS STATUS;