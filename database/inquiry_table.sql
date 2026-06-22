-- ============================================================
--  Run in your MySQL database: sri_maheshwari
--  mysql -u root -p sri_maheshwari < backend/inquiry_table.sql
-- ============================================================

USE sri_maheshwari;

CREATE TABLE IF NOT EXISTS inquiries (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150)  NOT NULL,
  email           VARCHAR(255)  NOT NULL,
  phone           VARCHAR(20)   NULL,
  company_name    VARCHAR(255)  NULL,
  message         TEXT          NOT NULL,
  ip_address      VARCHAR(45)   NULL,    -- for rate-limit audit
  is_read         TINYINT(1)    DEFAULT 0,
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP
);

SELECT 'inquiries table ready.' AS STATUS;