# MVC Implementation Guide

## Overview
This guide provides complete implementation examples for the Model-View-Controller architecture in the Pharmacy Management System.

---

## 1. MVC ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│                   React Frontend                         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    ROUTES LAYER                          │
│  - Define API endpoints                                  │
│  - Apply middleware (auth, validation)                   │
│  - Route to appropriate controller                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 CONTROLLER LAYER                         │
│  - Handle business logic                                 │
│  - Validate input                                        │
│  - Call model methods                                    │
│  - Format response                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   MODEL LAYER                            │
│  - Database queries                                      │
│  - Data validation                                       │
│  - Business rules                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE                               │
│                   MySQL                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. ROUTE LAYER IMPLEMENTATION

### Example: Patient Routes
**File**: `api/routes/patients.js`

```javascript
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validatePatient } = require('../middleware/validator');

// All routes require authentication
router.use(authenticate);

// GET /api/patients - Get all patients
router.get('/', 
  authorize('Physician', 'Receptionist', 'Pharmacist'),
  patientController.getAll
);

// GET /api/patients/search - Search patients
router.get('/search',
  authorize('Physician', 'Receptionist', 'Pharmacist'),
  patientController.search
);

// GET /api/patients/:id - Get patient by ID
router.get('/:id',
  authorize('Physician', 'Receptionist', 'Pharmacist'),
  patientController.getOne
);

// POST /api/patients - Register new patient
router.post('/',
  authorize('Physician', 'Receptionist'),
  validatePatient,
  patientController.create
);

// PUT /api/patients/:id - Update patient
router.put('/:id',
  authorize('Physician', 'Receptionist'),
  validatePatient,
  patientController.update
);

// DELETE /api/patients/:id - Delete patient (soft delete)
router.delete('/:id',
  authorize('Administrator'),
  patientController.delete
);

// GET /api/patients/:id/history - Get patient medical history
router.get('/:id/history',
  authorize('Physician'),
  patientController.getHistory
);

module.exports = router;
```

---

## 3. CONTROLLER LAYER IMPLEMENTATION

### Example: Patient Controller
**File**: `api/controllers/patientController.js`

```javascript
const db = require('../config/database');

/**
 * Get all patients with pagination
 * GET /api/patients?page=1&limit=10&search=john
 */
const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Build query
    let query = `
      SELECT p.*, 
             CONCAT(u.first_name, ' ', u.last_name) as registered_by_name
      FROM patients p
      LEFT JOIN users u ON p.registered_by = u.id
      WHERE p.deleted_at IS NULL
    `;

    const params = [];

    // Add search filter
    if (search) {
      query += ` AND (
        p.patient_id LIKE ? OR
        p.first_name LIKE ? OR
        p.last_name LIKE ? OR
        p.phone LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT p.*, CONCAT(u.first_name, \' \', u.last_name) as registered_by_name',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await db.execute(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute query
    const [patients] = await db.execute(query, params);

    res.json({
      data: patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      message: 'Failed to retrieve patients',
      error: error.message
    });
  }
};

/**
 * Get patient by ID
 * GET /api/patients/:id
 */
const getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const [patients] = await db.execute(
      `SELECT p.*, 
              CONCAT(u.first_name, ' ', u.last_name) as registered_by_name
       FROM patients p
       LEFT JOIN users u ON p.registered_by = u.id
       WHERE p.id = ? AND p.deleted_at IS NULL`,
      [id]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        message: 'Patient not found'
      });
    }

    res.json({
      data: patients[0]
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      message: 'Failed to retrieve patient',
      error: error.message
    });
  }
};

/**
 * Create new patient
 * POST /api/patients
 */
const create = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      blood_group,
      allergies
    } = req.body;

    // Generate patient ID (e.g., PAT-2026-0001)
    const [lastPatient] = await db.execute(
      'SELECT patient_id FROM patients ORDER BY id DESC LIMIT 1'
    );

    let patientId;
    if (lastPatient.length > 0) {
      const lastId = lastPatient[0].patient_id;
      const lastNumber = parseInt(lastId.split('-')[2]);
      const newNumber = (lastNumber + 1).toString().padStart(4, '0');
      patientId = `PAT-2026-${newNumber}`;
    } else {
      patientId = 'PAT-2026-0001';
    }

    // Insert patient
    const [result] = await db.execute(
      `INSERT INTO patients (
        patient_id, first_name, last_name, date_of_birth, gender,
        phone, email, address, emergency_contact_name,
        emergency_contact_phone, blood_group, allergies, registered_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId, first_name, last_name, date_of_birth, gender,
        phone, email, address, emergency_contact_name,
        emergency_contact_phone, blood_group, allergies, req.user.id
      ]
    );

    // Get created patient
    const [newPatient] = await db.execute(
      'SELECT * FROM patients WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Patient registered successfully',
      data: newPatient[0]
    });
  } catch (error) {
    console.error('Create patient error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        message: 'Patient with this phone number already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to register patient',
      error: error.message
    });
  }
};

/**
 * Update patient
 * PUT /api/patients/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      blood_group,
      allergies
    } = req.body;

    // Check if patient exists
    const [existing] = await db.execute(
      'SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Patient not found'
      });
    }

    // Update patient
    await db.execute(
      `UPDATE patients SET
        first_name = ?, last_name = ?, date_of_birth = ?, gender = ?,
        phone = ?, email = ?, address = ?, emergency_contact_name = ?,
        emergency_contact_phone = ?, blood_group = ?, allergies = ?
       WHERE id = ?`,
      [
        first_name, last_name, date_of_birth, gender,
        phone, email, address, emergency_contact_name,
        emergency_contact_phone, blood_group, allergies, id
      ]
    );

    // Get updated patient
    const [updated] = await db.execute(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Patient updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      message: 'Failed to update patient',
      error: error.message
    });
  }
};

/**
 * Delete patient (soft delete)
 * DELETE /api/patients/:id
 */
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if patient exists
    const [existing] = await db.execute(
      'SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Patient not found'
      });
    }

    // Soft delete
    await db.execute(
      'UPDATE patients SET deleted_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      message: 'Failed to delete patient',
      error: error.message
    });
  }
};

/**
 * Search patients
 * GET /api/patients/search?query=john
 */
const search = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchPattern = `%${query}%`;

    const [patients] = await db.execute(
      `SELECT p.id, p.patient_id, p.first_name, p.last_name, 
              p.phone, p.date_of_birth, p.gender
       FROM patients p
       WHERE p.deleted_at IS NULL
         AND (p.patient_id LIKE ? OR
              p.first_name LIKE ? OR
              p.last_name LIKE ? OR
              p.phone LIKE ?)
       ORDER BY p.last_name, p.first_name
       LIMIT 20`,
      [searchPattern, searchPattern, searchPattern, searchPattern]
    );

    res.json({
      data: patients
    });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({
      message: 'Failed to search patients',
      error: error.message
    });
  }
};

/**
 * Get patient medical history
 * GET /api/patients/:id/history
 */
const getHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Get patient info
    const [patients] = await db.execute(
      'SELECT * FROM patients WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        message: 'Patient not found'
      });
    }

    // Get diagnoses
    const [diagnoses] = await db.execute(
      `SELECT d.*, CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM diagnoses d
       LEFT JOIN users u ON d.physician_id = u.id
       WHERE d.patient_id = ?
       ORDER BY d.diagnosis_date DESC`,
      [id]
    );

    // Get prescriptions
    const [prescriptions] = await db.execute(
      `SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM prescriptions p
       LEFT JOIN users u ON p.physician_id = u.id
       WHERE p.patient_id = ?
       ORDER BY p.prescription_date DESC`,
      [id]
    );

    res.json({
      patient: patients[0],
      diagnoses,
      prescriptions
    });
  } catch (error) {
    console.error('Get patient history error:', error);
    res.status(500).json({
      message: 'Failed to retrieve patient history',
      error: error.message
    });
  }
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  delete: deletePatient,
  search,
  getHistory
};
```

---

## 4. MODEL LAYER (OPTIONAL)

While we can use direct database queries in controllers, creating model classes provides better organization and reusability.

### Example: Patient Model
**File**: `api/models/Patient.js`

```javascript
const db = require('../config/database');

class Patient {
  /**
   * Find all patients
   */
  static async findAll(filters = {}) {
    const { page = 1, limit = 10, search = '' } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, 
             CONCAT(u.first_name, ' ', u.last_name) as registered_by_name
      FROM patients p
      LEFT JOIN users u ON p.registered_by = u.id
      WHERE p.deleted_at IS NULL
    `;

    const params = [];

    if (search) {
      query += ` AND (
        p.patient_id LIKE ? OR
        p.first_name LIKE ? OR
        p.last_name LIKE ? OR
        p.phone LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [patients] = await db.execute(query, params);
    return patients;
  }

  /**
   * Find patient by ID
   */
  static async findById(id) {
    const [patients] = await db.execute(
      `SELECT p.*, 
              CONCAT(u.first_name, ' ', u.last_name) as registered_by_name
       FROM patients p
       LEFT JOIN users u ON p.registered_by = u.id
       WHERE p.id = ? AND p.deleted_at IS NULL`,
      [id]
    );

    return patients[0] || null;
  }

  /**
   * Create new patient
   */
  static async create(data, registeredBy) {
    const patientId = await this.generatePatientId();

    const [result] = await db.execute(
      `INSERT INTO patients (
        patient_id, first_name, last_name, date_of_birth, gender,
        phone, email, address, emergency_contact_name,
        emergency_contact_phone, blood_group, allergies, registered_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        data.first_name,
        data.last_name,
        data.date_of_birth,
        data.gender,
        data.phone,
        data.email,
        data.address,
        data.emergency_contact_name,
        data.emergency_contact_phone,
        data.blood_group,
        data.allergies,
        registeredBy
      ]
    );

    return await this.findById(result.insertId);
  }

  /**
   * Update patient
   */
  static async update(id, data) {
    await db.execute(
      `UPDATE patients SET
        first_name = ?, last_name = ?, date_of_birth = ?, gender = ?,
        phone = ?, email = ?, address = ?, emergency_contact_name = ?,
        emergency_contact_phone = ?, blood_group = ?, allergies = ?
       WHERE id = ?`,
      [
        data.first_name,
        data.last_name,
        data.date_of_birth,
        data.gender,
        data.phone,
        data.email,
        data.address,
        data.emergency_contact_name,
        data.emergency_contact_phone,
        data.blood_group,
        data.allergies,
        id
      ]
    );

    return await this.findById(id);
  }

  /**
   * Soft delete patient
   */
  static async delete(id) {
    await db.execute(
      'UPDATE patients SET deleted_at = NOW() WHERE id = ?',
      [id]
    );
  }

  /**
   * Generate unique patient ID
   */
  static async generatePatientId() {
    const [lastPatient] = await db.execute(
      'SELECT patient_id FROM patients ORDER BY id DESC LIMIT 1'
    );

    if (lastPatient.length > 0) {
      const lastId = lastPatient[0].patient_id;
      const lastNumber = parseInt(lastId.split('-')[2]);
      const newNumber = (lastNumber + 1).toString().padStart(4, '0');
      return `PAT-2026-${newNumber}`;
    }

    return 'PAT-2026-0001';
  }

  /**
   * Get patient medical history
   */
  static async getHistory(id) {
    const [diagnoses] = await db.execute(
      `SELECT d.*, CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM diagnoses d
       LEFT JOIN users u ON d.physician_id = u.id
       WHERE d.patient_id = ?
       ORDER BY d.diagnosis_date DESC`,
      [id]
    );

    const [prescriptions] = await db.execute(
      `SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM prescriptions p
       LEFT JOIN users u ON p.physician_id = u.id
       WHERE p.patient_id = ?
       ORDER BY p.prescription_date DESC`,
      [id]
    );

    return { diagnoses, prescriptions };
  }
}

module.exports = Patient;
```

### Using Model in Controller

```javascript
const Patient = require('../models/Patient');

const getAll = async (req, res) => {
  try {
    const patients = await Patient.findAll(req.query);
    res.json({ data: patients });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve patients' });
  }
};

const create = async (req, res) => {
  try {
    const patient = await Patient.create(req.body, req.user.id);
    res.status(201).json({ 
      message: 'Patient registered successfully',
      data: patient 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register patient' });
  }
};
```

---

## 5. VALIDATION MIDDLEWARE

**File**: `api/middleware/validator.js`

```javascript
const { body, validationResult } = require('express-validator');

/**
 * Validate patient data
 */
const validatePatient = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name too long'),
  
  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name too long'),
  
  body('date_of_birth')
    .notEmpty().withMessage('Date of birth is required')
    .isDate().withMessage('Invalid date format'),
  
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[0-9+\-\s()]+$/).withMessage('Invalid phone format'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format'),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validatePatient
};
```

---

## Document Status
- **Version**: 1.0
- **Date**: February 15, 2026
