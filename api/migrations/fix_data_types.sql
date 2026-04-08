-- Fix data types to match existing schema
USE haramaya_pharmacy;

-- Fix original_prescription_id to be BIGINT UNSIGNED
ALTER TABLE prescriptions MODIFY COLUMN original_prescription_id BIGINT UNSIGNED NULL;

-- Now create emergency_dispensing table with correct data types
DROP TABLE IF EXISTS emergency_dispensing;

CREATE TABLE emergency_dispensing (
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
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT,
  FOREIGN KEY (pharmacist_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_patient (patient_id_number),
  INDEX idx_dispensed_date (dispensed_date)
);

SELECT 'Migration fix completed successfully!' AS Status;
