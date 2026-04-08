# Additional Features Implementation Plan

## Overview

This document outlines the implementation of four new workflow scenarios for the Haramaya University Pharmacy Management System.

---

## Feature 1: Patient Returns for Follow-up (View Prescription History)

### Backend Changes

#### 1. New API Endpoint: Get Patient Prescription History

**File:** `api/controllers/prescriptionController.js`

```javascript
exports.getPatientHistory = async (req, res, next) => {
  try {
    const { patient_id } = req.params;

    const [prescriptions] = await db.execute(
      `SELECT p.*, 
              CONCAT(u.first_name, ' ', u.last_name) as physician_name,
              COUNT(pi.id) as medicine_count
       FROM prescriptions p
       LEFT JOIN users u ON p.physician_id = u.id
       LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
       WHERE p.patient_id_number = ? OR p.patient_name LIKE ?
       GROUP BY p.id
       ORDER BY p.prescription_date DESC`,
      [patient_id, `%${patient_id}%`],
    );

    res.json({ data: prescriptions });
  } catch (error) {
    next(error);
  }
};
```

#### 2. Add Route

**File:** `api/routes/prescriptions.js`

```javascript
router.get("/patient/:patient_id/history", auth, getPatientHistory);
```

### Frontend Changes

#### 1. Create Prescription History Component

**File:** `frontend/src/components/Physician/PrescriptionHistory.jsx`

- Display list of previous prescriptions
- Show diagnosis, medicines, dates
- Allow viewing full prescription details
- Button to create new prescription based on previous one

#### 2. Update CreatePrescription Page

**File:** `frontend/src/pages/Physician/CreatePrescription.jsx`

- Add "View History" button when patient is selected
- Show previous prescriptions in a modal/sidebar
- Allow copying previous prescription as template

---

## Feature 2: Refill Prescription

### Database Changes

#### 1. Add Refill Columns to Prescriptions Table

```sql
ALTER TABLE prescriptions
ADD COLUMN refills_allowed INT DEFAULT 0,
ADD COLUMN refills_remaining INT DEFAULT 0,
ADD COLUMN original_prescription_id INT NULL,
ADD FOREIGN KEY (original_prescription_id) REFERENCES prescriptions(id);
```

### Backend Changes

#### 1. Update Prescription Creation

**File:** `api/controllers/prescriptionController.js`

```javascript
// Add refills_allowed field to create endpoint
exports.create = async (req, res, next) => {
  const { refills_allowed = 0, ...otherData } = req.body;

  // Insert with refills_allowed and refills_remaining
  await connection.execute(
    `INSERT INTO prescriptions (..., refills_allowed, refills_remaining) 
     VALUES (..., ?, ?)`,
    [...params, refills_allowed, refills_allowed],
  );
};
```

#### 2. Create Refill Endpoint

```javascript
exports.refillPrescription = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Check if refills available
    const [prescriptions] = await connection.execute(
      "SELECT * FROM prescriptions WHERE id = ?",
      [id],
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    const prescription = prescriptions[0];

    if (prescription.refills_remaining <= 0) {
      return res.status(400).json({
        message: "No refills remaining. Patient must see physician.",
      });
    }

    // Create new prescription as refill
    const newPrescriptionNumber = await generatePrescriptionNumber();

    const [result] = await connection.execute(
      `INSERT INTO prescriptions (
        prescription_number, patient_name, patient_id_number, physician_id,
        diagnosis, prescription_date, notes, status, original_prescription_id,
        refills_allowed, refills_remaining
      ) SELECT ?, patient_name, patient_id_number, physician_id,
        diagnosis, CURDATE(), CONCAT('REFILL of ', prescription_number), 'pending',
        ?, 0, 0
       FROM prescriptions WHERE id = ?`,
      [newPrescriptionNumber, id, id],
    );

    const newPrescriptionId = result.insertId;

    // Copy prescription items
    await connection.execute(
      `INSERT INTO prescription_items (prescription_id, medicine_id, quantity_prescribed, dosage_instructions)
       SELECT ?, medicine_id, quantity_prescribed, dosage_instructions
       FROM prescription_items WHERE prescription_id = ?`,
      [newPrescriptionId, id],
    );

    // Decrease refills_remaining on original
    await connection.execute(
      "UPDATE prescriptions SET refills_remaining = refills_remaining - 1 WHERE id = ?",
      [id],
    );

    await connection.commit();

    res.json({
      message: "Prescription refilled successfully",
      prescription_id: newPrescriptionId,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
```

### Frontend Changes

#### 1. Update DrugDispensing Page

**File:** `frontend/src/pages/Pharmacist/DrugDispensing.jsx`

- Add "Refill" button on prescription cards
- Show refills remaining badge
- Modal to confirm refill
- Disable refill if refills_remaining = 0

#### 2. Update CreatePrescription Page

**File:** `frontend/src/pages/Physician/CreatePrescription.jsx`

- Add "Refills Allowed" field (dropdown: 0, 1, 2, 3, 6, 12)
- Show info tooltip about refill policy

---

## Feature 3: Medicine Out of Stock (Partial Dispensing & Alternatives)

### Database Changes

#### 1. Add Partial Dispensing Tracking

```sql
ALTER TABLE prescription_items
ADD COLUMN quantity_remaining INT DEFAULT 0,
ADD COLUMN is_partial BOOLEAN DEFAULT FALSE;

ALTER TABLE prescriptions
ADD COLUMN is_partial_dispensed BOOLEAN DEFAULT FALSE;
```

### Backend Changes

#### 1. Update Dispense Endpoint

**File:** `api/controllers/prescriptionController.js`

```javascript
exports.dispensePartial = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { dispensed_items, is_partial } = req.body;

    let allItemsFullyDispensed = true;

    for (const item of dispensed_items) {
      const [prescriptionItem] = await connection.execute(
        "SELECT * FROM prescription_items WHERE id = ?",
        [item.prescription_item_id],
      );

      const prescribed = prescriptionItem[0].quantity_prescribed;
      const dispensed = item.quantity_dispensed;
      const remaining = prescribed - dispensed;

      if (remaining > 0) {
        allItemsFullyDispensed = false;

        // Mark as partial
        await connection.execute(
          `UPDATE prescription_items 
           SET quantity_dispensed = quantity_dispensed + ?, 
               quantity_remaining = ?, 
               is_partial = TRUE 
           WHERE id = ?`,
          [dispensed, remaining, item.prescription_item_id],
        );
      } else {
        await connection.execute(
          `UPDATE prescription_items 
           SET quantity_dispensed = ?, 
               quantity_remaining = 0 
           WHERE id = ?`,
          [dispensed, item.prescription_item_id],
        );
      }

      // Update stock
      await connection.execute(
        "UPDATE stock_inventory SET quantity_available = quantity_available - ? WHERE medicine_id = ?",
        [dispensed, prescriptionItem[0].medicine_id],
      );
    }

    // Update prescription status
    const newStatus = allItemsFullyDispensed ? "completed" : "partial";
    await connection.execute(
      "UPDATE prescriptions SET status = ?, is_partial_dispensed = ? WHERE id = ?",
      [newStatus, !allItemsFullyDispensed, id],
    );

    await connection.commit();

    res.json({
      message: allItemsFullyDispensed
        ? "Prescription fully dispensed"
        : "Prescription partially dispensed. Patient should return for remaining items.",
      status: newStatus,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
```

#### 2. Get Partial Prescriptions Endpoint

```javascript
exports.getPartialPrescriptions = async (req, res, next) => {
  try {
    const [prescriptions] = await db.execute(
      `SELECT p.*, 
              p.patient_name,
              CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM prescriptions p
       LEFT JOIN users u ON p.physician_id = u.id
       WHERE p.status = 'partial'
       ORDER BY p.updated_at DESC`,
    );

    res.json({ data: prescriptions });
  } catch (error) {
    next(error);
  }
};
```

### Frontend Changes

#### 1. Update DrugDispensing Page

- Show stock availability for each medicine
- Allow partial quantity input
- Warning when stock is insufficient
- "Dispense Partial" button
- Show "Partial Prescriptions" tab
- Badge showing remaining quantities

#### 2. Create Alternative Medicine Suggestion

- Button to "Suggest Alternative"
- Search similar medicines (same category/type)
- Send notification to physician for approval

---

## Feature 4: Emergency Dispensing (Without Prescription)

### Database Changes

#### 1. Create Emergency Dispensing Table

```sql
CREATE TABLE emergency_dispensing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id_number VARCHAR(20),
  patient_name VARCHAR(255),
  medicine_id INT,
  quantity INT,
  reason TEXT,
  pharmacist_id INT,
  dispensed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  prescription_id INT NULL,
  status ENUM('pending_prescription', 'completed') DEFAULT 'pending_prescription',
  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  FOREIGN KEY (pharmacist_id) REFERENCES users(id),
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
);
```

### Backend Changes

#### 1. Create Emergency Dispensing Controller

**File:** `api/controllers/emergencyDispensingController.js`

```javascript
const db = require("../config/database");

exports.create = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { patient_id_number, patient_name, medicine_id, quantity, reason } =
      req.body;

    // Check stock
    const [stock] = await connection.execute(
      "SELECT quantity_available FROM stock_inventory WHERE medicine_id = ?",
      [medicine_id],
    );

    if (stock.length === 0 || stock[0].quantity_available < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Create emergency dispensing record
    const [result] = await connection.execute(
      `INSERT INTO emergency_dispensing 
       (patient_id_number, patient_name, medicine_id, quantity, reason, pharmacist_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        patient_id_number,
        patient_name,
        medicine_id,
        quantity,
        reason,
        req.user.id,
      ],
    );

    // Update stock
    await connection.execute(
      "UPDATE stock_inventory SET quantity_available = quantity_available - ? WHERE medicine_id = ?",
      [quantity, medicine_id],
    );

    // Record stock out
    await connection.execute(
      `INSERT INTO stock_out (medicine_id, batch_number, quantity, reason, reference_id, processed_by, processed_date)
       VALUES (?, 'EMERGENCY', ?, 'emergency', ?, ?, CURDATE())`,
      [medicine_id, quantity, result.insertId, req.user.id],
    );

    await connection.commit();

    res.status(201).json({
      message:
        "Emergency dispensing recorded. Physician prescription required within 48 hours.",
      id: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

exports.getPending = async (req, res, next) => {
  try {
    const [records] = await db.execute(
      `SELECT ed.*, m.name as medicine_name, m.strength, m.unit,
              CONCAT(u.first_name, ' ', u.last_name) as pharmacist_name
       FROM emergency_dispensing ed
       LEFT JOIN medicines m ON ed.medicine_id = m.id
       LEFT JOIN users u ON ed.pharmacist_id = u.id
       WHERE ed.status = 'pending_prescription'
       ORDER BY ed.dispensed_date DESC`,
    );

    res.json({ data: records });
  } catch (error) {
    next(error);
  }
};

exports.linkPrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { prescription_id } = req.body;

    await db.execute(
      `UPDATE emergency_dispensing 
       SET prescription_id = ?, status = 'completed' 
       WHERE id = ?`,
      [prescription_id, id],
    );

    res.json({ message: "Prescription linked successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
```

#### 2. Add Routes

**File:** `api/routes/emergencyDispensing.js`

```javascript
const express = require("express");
const router = express.Router();
const { auth, checkRole } = require("../middleware/auth");
const emergencyDispensingController = require("../controllers/emergencyDispensingController");

router.post(
  "/",
  auth,
  checkRole(["Pharmacist"]),
  emergencyDispensingController.create,
);
router.get("/pending", auth, emergencyDispensingController.getPending);
router.put(
  "/:id/link",
  auth,
  checkRole(["Physician"]),
  emergencyDispensingController.linkPrescription,
);

module.exports = router;
```

### Frontend Changes

#### 1. Create Emergency Dispensing Page

**File:** `frontend/src/pages/Pharmacist/EmergencyDispensing.jsx`

- Form to record emergency dispensing
- Patient search
- Medicine selection
- Quantity input
- Reason textarea (required)
- Warning about 48-hour prescription requirement

#### 2. Update Pharmacist Dashboard

- Add "Emergency Dispensing" link in sidebar
- Show pending emergency dispensing count badge
- Alert for records older than 24 hours without prescription

#### 3. Update Physician Dashboard

- Show "Pending Emergency Prescriptions" section
- Allow creating prescription linked to emergency dispensing
- Auto-fill patient and medicine information

---

## API Service Updates

### File: `frontend/src/services/api.js`

```javascript
// Add to existing API
export const prescriptionsAPI = {
  // ... existing methods
  getPatientHistory: (patientId) =>
    api.get(`/prescriptions/patient/${patientId}/history`),
  refill: (id) => api.post(`/prescriptions/${id}/refill`),
  dispensePartial: (id, data) =>
    api.post(`/prescriptions/${id}/dispense-partial`, data),
  getPartial: () => api.get("/prescriptions/partial"),
};

export const emergencyDispensingAPI = {
  create: (data) => api.post("/emergency-dispensing", data),
  getPending: () => api.get("/emergency-dispensing/pending"),
  linkPrescription: (id, prescriptionId) =>
    api.put(`/emergency-dispensing/${id}/link`, {
      prescription_id: prescriptionId,
    }),
};
```

---

## Implementation Priority

### Phase 1 (High Priority)

1. ✅ Patient Prescription History (Feature 1)
2. ✅ Partial Dispensing (Feature 3)

### Phase 2 (Medium Priority)

3. ✅ Refill Prescription (Feature 2)

### Phase 3 (Lower Priority)

4. ✅ Emergency Dispensing (Feature 4)

---

## Testing Checklist

### Feature 1: Patient History

- [ ] View previous prescriptions for a patient
- [ ] Create new prescription from history
- [ ] Verify physician can see treatment effectiveness

### Feature 2: Refill

- [ ] Create prescription with refills allowed
- [ ] Pharmacist can refill if refills remaining > 0
- [ ] System prevents refill when refills_remaining = 0
- [ ] Refill count decrements correctly

### Feature 3: Partial Dispensing

- [ ] Dispense partial quantity when stock insufficient
- [ ] Prescription status changes to "partial"
- [ ] Patient can return for remaining items
- [ ] Stock updates correctly

### Feature 4: Emergency Dispensing

- [ ] Pharmacist can dispense without prescription
- [ ] Reason is documented
- [ ] Physician sees pending emergency prescriptions
- [ ] Physician can create linked prescription
- [ ] Status updates to "completed" when linked

---

## Database Migration Script

**File:** `api/migrations/add_workflow_features.sql`

```sql
-- Feature 2: Refill Prescription
ALTER TABLE prescriptions
ADD COLUMN refills_allowed INT DEFAULT 0,
ADD COLUMN refills_remaining INT DEFAULT 0,
ADD COLUMN original_prescription_id INT NULL,
ADD FOREIGN KEY (original_prescription_id) REFERENCES prescriptions(id);

-- Feature 3: Partial Dispensing
ALTER TABLE prescription_items
ADD COLUMN quantity_remaining INT DEFAULT 0,
ADD COLUMN is_partial BOOLEAN DEFAULT FALSE;

ALTER TABLE prescriptions
ADD COLUMN is_partial_dispensed BOOLEAN DEFAULT FALSE;

-- Update prescription status enum
ALTER TABLE prescriptions
MODIFY COLUMN status ENUM('pending', 'completed', 'cancelled', 'partial') DEFAULT 'pending';

-- Feature 4: Emergency Dispensing
CREATE TABLE emergency_dispensing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id_number VARCHAR(20),
  patient_name VARCHAR(255),
  medicine_id INT,
  quantity INT,
  reason TEXT,
  pharmacist_id INT,
  dispensed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  prescription_id INT NULL,
  status ENUM('pending_prescription', 'completed') DEFAULT 'pending_prescription',
  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  FOREIGN KEY (pharmacist_id) REFERENCES users(id),
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id),
  INDEX idx_status (status),
  INDEX idx_patient (patient_id_number)
);
```

---

## Next Steps

1. Review and approve this implementation plan
2. Run database migrations
3. Implement backend endpoints
4. Create/update frontend components
5. Test each feature thoroughly
6. Update user documentation
7. Train users on new features
