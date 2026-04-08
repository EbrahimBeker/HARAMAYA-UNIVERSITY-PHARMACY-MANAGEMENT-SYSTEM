# Diagnosis-Prescription Integrated Workflow

## Overview

The system now requires physicians to create a diagnosis record BEFORE creating a prescription. This ensures proper medical documentation and workflow.

## New Workflow

### Step 1: Create Diagnosis

1. Navigate to **Diagnoses** page from sidebar
2. Click **"New Diagnosis"**
3. Fill in:
   - Patient selection
   - Diagnosis date
   - Symptoms (required)
   - Vital signs (optional): Temperature, Blood Pressure, Pulse, Respiratory Rate
   - Diagnosis (required)
   - Notes (optional)
4. Click **"Create Diagnosis"**

### Step 2: Create Prescription from Diagnosis

1. From the Diagnoses list, click **"Prescribe"** button next to the diagnosis
2. System automatically:
   - Loads the patient
   - Links to the diagnosis record
   - Shows diagnosis details (read-only)
3. Add medicines and dosage instructions
4. Set refills if needed
5. Add prescription notes
6. Click **"Create Prescription"**

## Database Changes

### New Field

- `prescriptions.diagnosis_id` - Foreign key linking to `diagnoses.id`
- Allows prescriptions to reference detailed diagnosis records

### Migration

- File: `api/migrations/link_prescriptions_to_diagnoses.sql`
- Adds `diagnosis_id` column with foreign key constraint
- Keeps existing `diagnosis` text field for backward compatibility

## API Changes

### Prescription Controller

- Now accepts `diagnosis_id` in request body
- Automatically pulls diagnosis text from diagnosis record if `diagnosis_id` provided
- Stores both `diagnosis_id` (link) and `diagnosis` (text copy)

### Prescription Routes

- Added optional validation for `diagnosis_id`

## Frontend Changes

### Diagnoses Page (`/diagnoses`)

- Added **"Prescribe"** button for each diagnosis
- Clicking navigates to Create Prescription with `diagnosisId` and `patientId` params

### Create Prescription Page

- Removed diagnosis textarea input
- Now displays diagnosis details (read-only) from linked diagnosis record
- Shows message if no diagnosis selected with button to create one
- Validates that `diagnosis_id` is present before submission

## Benefits

1. **Structured Workflow**: Ensures proper medical documentation order
2. **Data Integrity**: Prescriptions always linked to diagnosis records
3. **Better Tracking**: Can trace prescriptions back to diagnosis
4. **Audit Trail**: Complete medical history with diagnosis → prescription flow
5. **Reduced Errors**: No duplicate entry of diagnosis information

## Usage Example

**Scenario**: Patient comes with fever

1. Physician examines patient
2. Goes to **Diagnoses** → **New Diagnosis**
3. Records:
   - Symptoms: "High fever, headache, body aches"
   - Vital Signs: Temperature 39°C, BP 120/80, Pulse 85
   - Diagnosis: "Viral Fever"
4. Clicks **"Prescribe"** button
5. System opens prescription form with diagnosis pre-loaded
6. Adds medicines: Paracetamol 500mg, etc.
7. Creates prescription

Result: Complete medical record with diagnosis and linked prescription.
