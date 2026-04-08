const db = require("../config/database");

// Feature 4: Emergency Dispensing

exports.create = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { patient_id_number, patient_name, medicine_id, quantity, reason } =
      req.body;

    // Validation
    if (
      !patient_id_number ||
      !patient_name ||
      !medicine_id ||
      !quantity ||
      !reason
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check stock
    const [stock] = await connection.execute(
      "SELECT quantity_available FROM stock_inventory WHERE medicine_id = ?",
      [medicine_id],
    );

    if (stock.length === 0 || stock[0].quantity_available < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock for emergency dispensing" });
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
        "Emergency dispensing recorded successfully. Physician prescription required within 48 hours.",
      id: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { status } = req.query;

    let sql = `SELECT ed.*, 
                      m.name as medicine_name, 
                      m.strength, 
                      m.unit,
                      CONCAT(u.first_name, ' ', u.last_name) as pharmacist_name,
                      TIMESTAMPDIFF(HOUR, ed.dispensed_date, NOW()) as hours_elapsed
               FROM emergency_dispensing ed
               LEFT JOIN medicines m ON ed.medicine_id = m.id
               LEFT JOIN users u ON ed.pharmacist_id = u.id
               WHERE 1=1`;

    const params = [];

    if (status) {
      sql += " AND ed.status = ?";
      params.push(status);
    }

    sql += " ORDER BY ed.dispensed_date DESC";

    const [records] = await db.execute(sql, params);

    res.json({ data: records });
  } catch (error) {
    next(error);
  }
};

exports.getPending = async (req, res, next) => {
  try {
    const [records] = await db.execute(
      `SELECT ed.*, 
              m.name as medicine_name, 
              m.strength, 
              m.unit,
              CONCAT(u.first_name, ' ', u.last_name) as pharmacist_name,
              TIMESTAMPDIFF(HOUR, ed.dispensed_date, NOW()) as hours_elapsed
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

exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [records] = await db.execute(
      `SELECT ed.*, 
              m.name as medicine_name, 
              m.strength, 
              m.unit,
              m.form,
              CONCAT(u.first_name, ' ', u.last_name) as pharmacist_name,
              TIMESTAMPDIFF(HOUR, ed.dispensed_date, NOW()) as hours_elapsed
       FROM emergency_dispensing ed
       LEFT JOIN medicines m ON ed.medicine_id = m.id
       LEFT JOIN users u ON ed.pharmacist_id = u.id
       WHERE ed.id = ?`,
      [id],
    );

    if (records.length === 0) {
      return res
        .status(404)
        .json({ message: "Emergency dispensing record not found" });
    }

    res.json(records[0]);
  } catch (error) {
    next(error);
  }
};

exports.linkPrescription = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { prescription_id } = req.body;

    // Verify emergency dispensing exists
    const [emergency] = await connection.execute(
      "SELECT * FROM emergency_dispensing WHERE id = ?",
      [id],
    );

    if (emergency.length === 0) {
      return res
        .status(404)
        .json({ message: "Emergency dispensing record not found" });
    }

    // Verify prescription exists
    const [prescription] = await connection.execute(
      "SELECT * FROM prescriptions WHERE id = ?",
      [prescription_id],
    );

    if (prescription.length === 0) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Link prescription and update status
    await connection.execute(
      `UPDATE emergency_dispensing 
       SET prescription_id = ?, status = 'completed' 
       WHERE id = ?`,
      [prescription_id, id],
    );

    await connection.commit();

    res.json({
      message: "Prescription linked successfully to emergency dispensing",
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = exports;
