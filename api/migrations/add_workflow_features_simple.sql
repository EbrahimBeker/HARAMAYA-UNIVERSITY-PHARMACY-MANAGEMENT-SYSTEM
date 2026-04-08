-- Migration: Add Workflow Features
-- Features: Refill Prescription, Partial Dispensing, Emergency Dispensing
-- Date: 2026-04-08

USE haramaya_pharmacy;

-- Feature 2: Refill Prescription
-- Check and add columns one by one

-- Add refills_allowed
ALTER TABLE prescriptions ADD COLUMN refills_allowed INT DEFAULT 0;

-- Add refills_remaining
ALTER TABLE prescriptions ADD COLUMN refills_remaining INT DEFAULT 0;

-- Add original_prescription_id
ALTER TABLE prescriptions ADD COLUMN original_prescription_id INT NULL;

-- Feature 3: Partial Dispensing
-- Add quantity_remaining to prescription_items
ALTER TABLE prescription_items ADD COLUMN quantity_remaining INT DEFAULT 0;

-- Add is_partial to prescription_items
ALTER TABLE prescription_items ADD COLUMN is_partial BOOLEAN DEFAULT FALSE;

-- Add is_partial_dispensed to prescriptions
ALTER TABLE prescriptions ADD COLUMN is_partial_dispensed BOOLEAN DEFAULT FALSE;

-- Update prescription status enum to include 'partial'
ALTER TABLE prescriptions MODIFY COLUMN status ENUM('pending', 'completed', 'cancelled', 'partial') DEFAULT 'pending';

-- Feature 4: Emergency Dispensing
CREATE TABLE IF NOT EXISTS emergency_dispensing (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  patient_id_number VARCHAR(20),
  patient_name VARCHAR(255),
  medicine_id BIGINT UNSIGNED NOT NULL,
  quantity INT NOT NULL,
  reason TEXT NOT NULL,
  pharmacist_id BIGINT UNSIGNED NOT NULL,
  dispensed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  prescription_id BIGINT UNSIGNED NULL,
  status ENUM('pending_prescription', 'completed') DEFAULT 'pending_prescription',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  FOREIGN KEY (pharmacist_id) REFERENCES users(id),
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id),
  INDEX idx_status (status),
  INDEX idx_patient (patient_id_number),
  INDEX idx_dispensed_date (dispensed_date)
);

-- Show success message
SELECT 'Migration completed successfully!' AS Status;
