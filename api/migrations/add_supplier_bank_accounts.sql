-- Add bank account information to suppliers table
-- Date: 2026-04-08

USE haramaya_pharmacy;

-- Add bank account fields to suppliers table
ALTER TABLE suppliers
ADD COLUMN bank_name ENUM('CBE', 'Dashen Bank', 'Awash Bank') DEFAULT NULL AFTER address,
ADD COLUMN account_number VARCHAR(50) DEFAULT NULL AFTER bank_name,
ADD COLUMN account_holder_name VARCHAR(100) DEFAULT NULL AFTER account_number;

-- Add index for faster lookups
ALTER TABLE suppliers
ADD INDEX idx_bank_name (bank_name);
