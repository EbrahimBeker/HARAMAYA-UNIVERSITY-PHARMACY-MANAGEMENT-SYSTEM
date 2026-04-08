-- Migration: Link Suppliers to User Accounts
-- Allows supplier companies to be linked to user accounts for login

-- Add user_id to suppliers table
ALTER TABLE suppliers
ADD COLUMN user_id BIGINT UNSIGNED NULL AFTER id,
ADD CONSTRAINT fk_supplier_user 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);

-- Note: Admin will need to manually link existing suppliers to user accounts
-- or create new user accounts for suppliers
