-- ============================================================
--  Run in your MySQL database: sri_maheshwari
--  mysql -u root -p sri_maheshwari < backend/business_performance_table.sql
-- ============================================================

USE sri_maheshwari;

CREATE TABLE IF NOT EXISTS business_performance (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  financial_year   VARCHAR(20)    NOT NULL,   -- e.g. '2021-22'
  annual_turnover  VARCHAR(100)   NOT NULL,   -- e.g. '12,50,00,000' (stored as text, INR)
  sort_order       INT            DEFAULT 0,  -- determines serial number ordering
  created_at       DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SELECT 'business_performance table ready.' AS STATUS;