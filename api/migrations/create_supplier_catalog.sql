-- Migration: Create Supplier Catalog System
-- Allows suppliers to manage their drug inventory with prices

USE haramaya_pharmacy;

-- Supplier Catalog: Drugs available from each supplier
CREATE TABLE IF NOT EXISTS supplier_catalog (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  supplier_id BIGINT UNSIGNED NOT NULL,
  medicine_id BIGINT UNSIGNED NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity_available INT DEFAULT 0,
  minimum_order_quantity INT DEFAULT 1,
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
  UNIQUE KEY unique_supplier_medicine (supplier_id, medicine_id),
  INDEX idx_supplier_id (supplier_id),
  INDEX idx_medicine_id (medicine_id),
  INDEX idx_is_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for faster queries
CREATE INDEX idx_supplier_available ON supplier_catalog(supplier_id, is_available);
