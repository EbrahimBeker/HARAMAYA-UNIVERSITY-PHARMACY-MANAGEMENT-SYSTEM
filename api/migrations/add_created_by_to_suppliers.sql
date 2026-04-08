-- Migration: Add created_by to suppliers table
-- This tracks which user created each supplier

USE haramaya_pharmacy;

-- Add created_by column
ALTER TABLE suppliers
ADD COLUMN created_by BIGINT UNSIGNED NULL AFTER user_id,
ADD CONSTRAINT fk_supplier_created_by 
  FOREIGN KEY (created_by) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_suppliers_created_by ON suppliers(created_by);

-- Note: Existing suppliers will have created_by = NULL
-- Admin can update them or they'll be treated as system-wide suppliers
