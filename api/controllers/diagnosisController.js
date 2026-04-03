const db = require("../config/database");

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, patient_id, physician_id } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT d.*, 
                      CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                      CONCAT(u.first_name, ' ', u.last_name) as physician_name
               FROM diagnoses d
               LEFT JOIN patients p ON d.patient_id = p.id
               LEFT JOIN users u ON d.physician_id = u.id
               WHERE 1=1`;
    const params = [];

    if (patient_id) {
      sql += ` AND d.patient_id = ?`;
      params.push(patient_id);
    }

    if (physician_id) {
      sql += ` AND d.physician_id = ?`;
      params.push(physician_id);
    }

    // If user is physician, only show their diagnoses
    if (req.user.roles.includes("Physician")) {
      sql += ` AND d.physician_id = ?`;
      params.push(req.user.id);
    }

    sql += ` ORDER BY d.diagnosis_date DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [diagnoses] = await db.execute(sql, params);

    res.json({
      data: diagnoses,
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      patient_id,
      diagnosis_date,
      symptoms,
      vital_signs,
      diagnosis,
      notes,
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO diagnoses (
        patient_id, physician_id, diagnosis_date, symptoms, vital_signs, diagnosis, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
        req.user.id,
        diagnosis_date,
        symptoms,
        JSON.stringify(vital_signs),
        diagnosis,
        notes,
      ],
    );

    const [createdDiagnosis] = await db.execute(
      `SELECT d.*, 
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM diagnoses d
       LEFT JOIN patients p ON d.patient_id = p.id
       LEFT JOIN users u ON d.physician_id = u.id
       WHERE d.id = ?`,
      [result.insertId],
    );

    res.status(201).json({
      message: "Diagnosis created successfully",
      diagnosis: createdDiagnosis[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const [diagnoses] = await db.execute(
      `SELECT d.*, 
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM diagnoses d
       LEFT JOIN patients p ON d.patient_id = p.id
       LEFT JOIN users u ON d.physician_id = u.id
       WHERE d.id = ?`,
      [req.params.id],
    );

    if (diagnoses.length === 0) {
      return res.status(404).json({ message: "Diagnosis not found" });
    }

    // Parse vital_signs JSON
    const diagnosis = diagnoses[0];
    if (diagnosis.vital_signs) {
      diagnosis.vital_signs = JSON.parse(diagnosis.vital_signs);
    }

    res.json(diagnosis);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { symptoms, vital_signs, diagnosis, notes } = req.body;

    const updates = [];
    const params = [];

    if (symptoms !== undefined) {
      updates.push("symptoms = ?");
      params.push(symptoms);
    }
    if (vital_signs !== undefined) {
      updates.push("vital_signs = ?");
      params.push(JSON.stringify(vital_signs));
    }
    if (diagnosis !== undefined) {
      updates.push("diagnosis = ?");
      params.push(diagnosis);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    params.push(id);
    await db.execute(
      `UPDATE diagnoses SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params,
    );

    const [updatedDiagnosis] = await db.execute(
      `SELECT d.*, 
              CONCAT(p.first_name, ' ', p.last_name) as patient_name,
              CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM diagnoses d
       LEFT JOIN patients p ON d.patient_id = p.id
       LEFT JOIN users u ON d.physician_id = u.id
       WHERE d.id = ?`,
      [id],
    );

    res.json({
      message: "Diagnosis updated successfully",
      diagnosis: updatedDiagnosis[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientDiagnoses = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const [diagnoses] = await db.execute(
      `SELECT d.*, 
              CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM diagnoses d
       LEFT JOIN users u ON d.physician_id = u.id
       WHERE d.patient_id = ?
       ORDER BY d.diagnosis_date DESC`,
      [patientId],
    );

    res.json({ data: diagnoses });
  } catch (error) {
    next(error);
  }
};
