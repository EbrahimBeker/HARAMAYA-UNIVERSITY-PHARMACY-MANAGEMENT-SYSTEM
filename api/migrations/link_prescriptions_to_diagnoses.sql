-- Migration: Link Prescriptions to Diagnoses
-- This allows prescriptions to reference detailed diagnosis records

-- Add diagnosis_id foreign key to prescriptions table
ALTER TABLE prescriptions
ADD COLUMN diagnosis_id BIGINT UNSIGNED NULL AFTER physician_id,
ADD CONSTRAINT fk_prescription_diagnosis 
  FOREIGN KEY (diagnosis_id) 
  REFERENCES diagnoses(id) 
  ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_prescriptions_diagnosis_id ON prescriptions(diagnosis_id);

-- Note: The existing 'diagnosis' text field is kept for backward compatibility
-- and can be used as a quick note if no detailed diagnosis record exists
