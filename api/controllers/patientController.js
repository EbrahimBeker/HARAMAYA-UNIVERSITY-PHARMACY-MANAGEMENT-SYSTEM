const db = require("../config/database");

// Generate unique patient ID
const generatePatientId = async () => {
  const [result] = await db.execute(
    "SELECT COUNT(*) as count FROM patients WHERE deleted_at IS NULL",
  );
  const count = result[0].count + 1;
  return `PAT${String(count).padStart(6, "0")}`;
};

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as registered_by_name
               FROM patients p
               LEFT JOIN users u ON p.registered_by = u.id
               WHERE p.deleted_at IS NULL`;
    const params = [];

    if (search) {
      sql += ` AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.patient_id LIKE ? OR p.phone LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [patients] = await db.execute(sql, params);

    // Get total count
    let countSql =
      "SELECT COUNT(*) as total FROM patients WHERE deleted_at IS NULL";
    const countParams = [];

    if (search) {
      countSql += ` AND (first_name LIKE ? OR last_name LIKE ? OR patient_id LIKE ? OR phone LIKE ?)`;
      const term = `%${search}%`;
      countParams.push(term, term, term, term);
    }

    const [countResult] = await db.execute(countSql, countParams);

    res.json({
      data: patients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
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
      allergies,
    } = req.body;

    const patient_id = await generatePatientId();

    const [result] = await db.execute(
      `INSERT INTO patients (
        patient_id, first_name, last_name, date_of_birth, gender, phone, email,
        address, emergency_contact_name, emergency_contact_phone, blood_group,
        allergies, registered_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
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
        allergies,
        req.user.id,
      ],
    );

    const [patient] = await db.execute("SELECT * FROM patients WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      message: "Patient registered successfully",
      patient: patient[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const [patients] = await db.execute(
      `SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as registered_by_name
       FROM patients p
       LEFT JOIN users u ON p.registered_by = u.id
       WHERE p.id = ? AND p.deleted_at IS NULL`,
      [req.params.id],
    );

    if (patients.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patients[0]);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const params = [];

    const allowedFields = [
      "first_name",
      "last_name",
      "date_of_birth",
      "gender",
      "phone",
      "email",
      "address",
      "emergency_contact_name",
      "emergency_contact_phone",
      "blood_group",
      "allergies",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    params.push(id);
    await db.execute(
      `UPDATE patients SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params,
    );

    const [patient] = await db.execute("SELECT * FROM patients WHERE id = ?", [
      id,
    ]);

    res.json({
      message: "Patient updated successfully",
      patient: patient[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.execute(
      "UPDATE patients SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id],
    );

    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getPatientHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get patient basic info
    const [patients] = await db.execute(
      "SELECT * FROM patients WHERE id = ? AND deleted_at IS NULL",
      [id],
    );

    if (patients.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get diagnoses
    const [diagnoses] = await db.execute(
      `SELECT d.*, CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM diagnoses d
       LEFT JOIN users u ON d.physician_id = u.id
       WHERE d.patient_id = ?
       ORDER BY d.diagnosis_date DESC`,
      [id],
    );

    // Get prescriptions
    const [prescriptions] = await db.execute(
      `SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as physician_name,
              CONCAT(d.first_name, ' ', d.last_name) as dispensed_by_name
       FROM prescriptions p
       LEFT JOIN users u ON p.physician_id = u.id
       LEFT JOIN users d ON p.dispensed_by = d.id
       WHERE p.patient_id = ?
       ORDER BY p.prescription_date DESC`,
      [id],
    );

    res.json({
      patient: patients[0],
      diagnoses,
      prescriptions,
    });
  } catch (error) {
    next(error);
  }
};
