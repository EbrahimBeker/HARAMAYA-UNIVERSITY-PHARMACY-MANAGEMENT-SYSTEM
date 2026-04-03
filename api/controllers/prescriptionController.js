const db = require("../config/database");

// Generate unique prescription number
const generatePrescriptionNumber = async () => {
  const [result] = await db.execute(
    "SELECT COUNT(*) as count FROM prescriptions",
  );
  const count = result[0].count + 1;
  return `RX${String(count).padStart(8, "0")}`;
};

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, status, physician_id } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT p.*, 
                      p.patient_name,
                      CONCAT(u.first_name, ' ', u.last_name) as physician_name
               FROM prescriptions p
               LEFT JOIN users u ON p.physician_id = u.id
               WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    if (physician_id) {
      sql += ` AND p.physician_id = ?`;
      params.push(physician_id);
    }

    // If user is physician, only show their prescriptions
    if (req.user.roles.includes("Physician")) {
      sql += ` AND p.physician_id = ?`;
      params.push(req.user.id);
    }

    sql += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [prescriptions] = await db.execute(sql, params);

    res.json({
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      patient_name,
      patient_id_number,
      diagnosis,
      prescription_date,
      notes,
      items,
    } = req.body;
    const prescription_number = await generatePrescriptionNumber();

    // Create prescription header
    const [result] = await connection.execute(
      `INSERT INTO prescriptions (
        prescription_number, patient_name, patient_id_number, physician_id,
        diagnosis, prescription_date, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        prescription_number,
        patient_name,
        patient_id_number,
        req.user.id,
        diagnosis,
        prescription_date,
        notes,
      ],
    );

    const prescriptionId = result.insertId;

    // Create prescription items
    for (const item of items) {
      await connection.execute(
        `INSERT INTO prescription_items (
          prescription_id, medicine_id, quantity_prescribed, dosage, frequency, duration, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          prescriptionId,
          item.medicine_id,
          item.quantity,
          item.dosage,
          item.frequency,
          item.duration,
          item.instructions,
        ],
      );
    }

    await connection.commit();

    // Get the created prescription with details
    const [prescription] = await db.execute(
      `SELECT p.*, 
              p.patient_name,
              CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM prescriptions p
       LEFT JOIN users u ON p.physician_id = u.id
       WHERE p.id = ?`,
      [prescriptionId],
    );

    res.status(201).json({
      message: "Prescription created successfully",
      prescription: prescription[0],
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const [prescriptions] = await db.execute(
      `SELECT p.*, 
              p.patient_name,
              CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM prescriptions p
       LEFT JOIN users u ON p.physician_id = u.id
       WHERE p.id = ?`,
      [req.params.id],
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Get prescription items
    const [items] = await db.execute(
      `SELECT pi.*, m.name as medicine_name, m.strength, m.unit
       FROM prescription_items pi
       LEFT JOIN medicines m ON pi.medicine_id = m.id
       WHERE pi.prescription_id = ?`,
      [req.params.id],
    );

    res.json({
      ...prescriptions[0],
      items,
    });
  } catch (error) {
    next(error);
  }
};

exports.dispense = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { dispensed_items } = req.body;

    // Check if prescription exists and is pending
    const [prescriptions] = await connection.execute(
      'SELECT * FROM prescriptions WHERE id = ? AND status = "pending"',
      [id],
    );

    if (prescriptions.length === 0) {
      return res
        .status(404)
        .json({ message: "Prescription not found or already dispensed" });
    }

    // Get prescription items
    const [items] = await connection.execute(
      "SELECT * FROM prescription_items WHERE prescription_id = ?",
      [id],
    );

    // Update stock for each dispensed item
    for (const item of items) {
      const dispensedItem = dispensed_items.find(
        (di) => di.prescription_item_id === item.id,
      );
      if (dispensedItem && dispensedItem.quantity_dispensed > 0) {
        // Check stock availability
        const [stock] = await connection.execute(
          "SELECT quantity_available FROM stock_inventory WHERE medicine_id = ?",
          [item.medicine_id],
        );

        if (
          stock.length === 0 ||
          stock[0].quantity_available < dispensedItem.quantity_dispensed
        ) {
          throw new Error(
            `Insufficient stock for medicine ID: ${item.medicine_id}`,
          );
        }

        // Update stock
        await connection.execute(
          "UPDATE stock_inventory SET quantity_available = quantity_available - ? WHERE medicine_id = ?",
          [dispensedItem.quantity_dispensed, item.medicine_id],
        );

        // Update prescription item with dispensed quantity
        await connection.execute(
          "UPDATE prescription_items SET quantity_dispensed = ? WHERE id = ?",
          [dispensedItem.quantity_dispensed, item.id],
        );

        // Record stock out
        await connection.execute(
          `INSERT INTO stock_out (
            medicine_id, batch_number, quantity, reason, reference_id,
            processed_by, processed_date
          ) VALUES (?, 'DISPENSED', ?, 'sale', ?, ?, CURDATE())`,
          [item.medicine_id, dispensedItem.quantity_dispensed, id, req.user.id],
        );
      }
    }

    // Update prescription status
    await connection.execute(
      'UPDATE prescriptions SET status = "completed" WHERE id = ?',
      [id],
    );

    await connection.commit();

    res.json({ message: "Prescription dispensed successfully" });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

exports.getPendingPrescriptions = async (req, res, next) => {
  try {
    const [prescriptions] = await db.execute(
      `SELECT p.*, 
              p.patient_name,
              CONCAT(u.first_name, ' ', u.last_name) as physician_name,
              COUNT(pi.id) as item_count
       FROM prescriptions p
       LEFT JOIN users u ON p.physician_id = u.id
       LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
       WHERE p.status = 'pending'
       GROUP BY p.id
       ORDER BY p.prescription_date DESC`,
    );

    res.json({ data: prescriptions });
  } catch (error) {
    next(error);
  }
};
