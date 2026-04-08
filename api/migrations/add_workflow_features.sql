-- Migration: Add Workflow Features
-- Features: Refill Prescription, Partial Dispensing, Emergency Dispensing
-- Date: 2026-04-08

-- Feature 2: Refill Prescription
-- Add refills_allowed column
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'prescriptions' 
   AND COLUMN_NAME = 'refills_allowed') = 0,
  'ALTER TABLE prescriptions ADD COLUMN refills_allowed INT DEFAULT 0',
  'SELECT "Column refills_allowed already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add refills_remaining column
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'prescriptions' 
   AND COLUMN_NAME = 'refills_remaining') = 0,
  'ALTER TABLE prescriptions ADD COLUMN refills_remaining INT DEFAULT 0',
  'SELECT "Column refills_remaining already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add original_prescription_id column
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'prescriptions' 
   AND COLUMN_NAME = 'original_prescription_id') = 0,
  'ALTER TABLE prescriptions ADD COLUMN original_prescription_id INT NULL',
  'SELECT "Column original_prescription_id already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Feature 3: Partial Dispensing
-- Add quantity_remaining column to prescription_items
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'prescription_items' 
   AND COLUMN_NAME = 'quantity_remaining') = 0,
  'ALTER TABLE prescription_items ADD COLUMN quantity_remaining INT DEFAULT 0',
  'SELECT "Column quantity_remaining already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_partial column to prescription_items
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'prescription_items' 
   AND COLUMN_NAME = 'is_partial') = 0,
  'ALTER TABLE prescription_items ADD COLUMN is_partial BOOLEAN DEFAULT FALSE',
  'SELECT "Column is_partial already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_partial_dispensed column to prescriptions
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'prescriptions' 
   AND COLUMN_NAME = 'is_partial_dispensed') = 0,
  'ALTER TABLE prescriptions ADD COLUMN is_partial_dispensed BOOLEAN DEFAULT FALSE',
  'SELECT "Column is_partial_dispensed already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update prescription status enum to include 'partial'
ALTER TABLE prescriptions 
MODIFY COLUMN status ENUM('pending', 'completed', 'cancelled', 'partial') DEFAULT 'pending';

-- Feature 4: Emergency Dispensing
CREATE TABLE IF NOT EXISTS emergency_dispensing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id_number VARCHAR(20),
  patient_name VARCHAR(255),
  medicine_id INT NOT NULL,
  quantity INT NOT NULL,
  reason TEXT NOT NULL,
  pharmacist_id INT NOT NULL,
  dispensed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  prescription_id INT NULL,
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
