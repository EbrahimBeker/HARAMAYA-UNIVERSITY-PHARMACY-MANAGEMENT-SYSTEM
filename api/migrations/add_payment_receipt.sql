-- Add payment receipt tracking to purchase_orders table
ALTER TABLE purchase_orders 
ADD COLUMN payment_status ENUM('unpaid', 'pending_verification', 'paid') DEFAULT 'unpaid' AFTER status,
ADD COLUMN payment_receipt_image VARCHAR(255) NULL AFTER payment_status,
ADD COLUMN payment_date DATE NULL AFTER payment_receipt_image,
ADD COLUMN payment_notes TEXT NULL AFTER payment_date,
ADD COLUMN payment_uploaded_at TIMESTAMP NULL AFTER payment_notes,
ADD COLUMN payment_verified_at TIMESTAMP NULL AFTER payment_uploaded_at,
ADD COLUMN payment_verified_by BIGINT UNSIGNED NULL AFTER payment_verified_at,
ADD FOREIGN KEY (payment_verified_by) REFERENCES users(id);
