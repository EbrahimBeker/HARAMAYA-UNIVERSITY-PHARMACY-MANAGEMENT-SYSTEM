# Physician Prescription Feature - Implementation Requirements

## 🎯 Overview
The Physician role currently only has a dashboard. To enable the complete prescription workflow described in the Patient Workflow Guide, the following features need to be implemented.

---

## 📋 Required Features

### 1. Patient Search & Selection Page
**File:** `frontend/src/pages/Physician/PatientSearch.jsx`

**Features:**
- Search patients by:
  - Patient ID (PAT000001)
  - Name (First/Last)
  - Phone number
- Display patient list with:
  - Patient ID
  - Full name
  - Age/Gender
  - Last visit date
  - Action buttons (View, Create Prescription)
- Pagination for large patient lists

**API Endpoints Needed:**
- `GET /api/patients` (already exists)
- `GET /api/patients/:id` (already exists)

---

### 2. Patient Details Page
**File:** `frontend/src/pages/Physician/PatientDetails.jsx`

**Features:**
- Display patient information:
  - Demographics (Name, Age, Gender, Contact)
  - Medical history (Blood group, Allergies)
  - Previous prescriptions
  - Previous diagnoses
- Action buttons:
  - Create New Prescription
  - View Medical History
  - Edit Patient Info (if allowed)

**API Endpoints Needed:**
- `GET /api/patients/:id` (already exists)
- `GET /api/patients/:id/history` (already exists)
- `GET /api/prescriptions?patient_id=:id` (needs to be added)

---

### 3. Prescription Creation Page
**File:** `frontend/src/pages/Physician/CreatePrescription.jsx`

**Features:**

#### A. Patient Information Section (Read-only)
- Display selected patient details
- Show allergies prominently (warning if any)
- Show blood group

#### B. Diagnosis Section
```jsx
- Diagnosis Name (text input or dropdown)
- ICD Code (optional text input)
- Diagnosis Notes (textarea)
- Severity (dropdown: Mild, Moderate, Severe)
```

#### C. Medicine Selection Section
```jsx
For each medicine:
- Medicine Search/Dropdown
  - Autocomplete search
  - Show: Name, Strength, Form (tablet/capsule/syrup)
  - Show available stock
  
- Quantity (number input)
  - Validate against available stock
  
- Dosage (text input)
  - Example: "1 tablet", "2 capsules", "5ml"
  
- Frequency (dropdown or text)
  - Options: Once daily, Twice daily, 3 times daily, 4 times daily, 