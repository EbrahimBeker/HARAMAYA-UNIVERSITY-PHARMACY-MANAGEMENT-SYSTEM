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
      patient_id,
      diagnosis_id,
      diagnosis,
      prescription_date,
      notes,
      items,
      refills_allowed = 0,
    } = req.body;

    // Get patient details
    const [patients] = await connection.execute(
      "SELECT patient_id, first_name, last_name FROM patients WHERE id = ?",
      [patient_id],
    );

    if (patients.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patient = patients[0];
    const patient_name = `${patient.first_name} ${patient.last_name}`;
    const patient_id_number = patient.patient_id;

    // If diagnosis_id is provided, get the diagnosis text from the diagnosis record
    let diagnosisText = diagnosis;
    if (diagnosis_id) {
      const [diagnosisRecords] = await connection.execute(
        "SELECT diagnosis FROM diagnoses WHERE id = ?",
        [diagnosis_id],
      );
      if (diagnosisRecords.length > 0) {
        diagnosisText = diagnosisRecords[0].diagnosis;
      }
    }

    const prescription_number = await generatePrescriptionNumber();

    // Create prescription header
    const [result] = await connection.execute(
      `INSERT INTO prescriptions (
        prescription_number, patient_name, patient_id_number, physician_id,
        diagnosis_id, diagnosis, prescription_date, notes, status, refills_allowed, refills_remaining
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        prescription_number,
        patient_name,
        patient_id_number,
        req.user.id,
        diagnosis_id || null,
        diagnosisText || null,
        prescription_date,
        notes || null,
        refills_allowed,
        refills_allowed, // refills_remaining starts equal to refills_allowed
      ],
    );

    const prescriptionId = result.insertId;

    // Create prescription items
    for (const item of items) {
      // Combine dosage, frequency, duration, and instructions into dosage_instructions
      const dosageInstructions = [
        `Dosage: ${item.dosage}`,
        `Frequency: ${item.frequency}`,
        `Duration: ${item.duration}`,
        item.instructions ? `Instructions: ${item.instructions}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      await connection.execute(
        `INSERT INTO prescription_items (
          prescription_id, medicine_id, quantity_prescribed, dosage_instructions
        ) VALUES (?, ?, ?, ?)`,
        [prescriptionId, item.medicine_id, item.quantity, dosageInstructions],
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

// Feature 1: Get Patient Prescription History
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
       WHERE p.patient_id_number = ?
       GROUP BY p.id
       ORDER BY p.prescription_date DESC`,
      [patient_id],
    );

    // Get items for each prescription
    for (let prescription of prescriptions) {
      const [items] = await db.execute(
        `SELECT pi.*, m.name as medicine_name, m.strength, m.unit
         FROM prescription_items pi
         LEFT JOIN medicines m ON pi.medicine_id = m.id
         WHERE pi.prescription_id = ?`,
        [prescription.id],
      );
      prescription.items = items;
    }

    res.json({ data: prescriptions });
  } catch (error) {
    next(error);
  }
};

// Feature 2: Refill Prescription
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
        message:
          "No refills remaining. Patient must see physician for new prescription.",
      });
    }

    // Create new prescription as refill
    const newPrescriptionNumber = await generatePrescriptionNumber();

    const [result] = await connection.execute(
      `INSERT INTO prescriptions (
        prescription_number, patient_name, patient_id_number, physician_id,
        diagnosis, prescription_date, notes, status, original_prescription_id,
        refills_allowed, refills_remaining
      ) VALUES (?, ?, ?, ?, ?, CURDATE(), ?, 'pending', ?, 0, 0)`,
      [
        newPrescriptionNumber,
        prescription.patient_name,
        prescription.patient_id_number,
        prescription.physician_id,
        prescription.diagnosis,
        `REFILL of ${prescription.prescription_number}`,
        id,
      ],
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

    // Get the created prescription
    const [newPrescription] = await connection.execute(
      `SELECT p.*, 
              CONCAT(u.first_name, ' ', u.last_name) as physician_name
       FROM prescriptions p
       LEFT JOIN users u ON p.physician_id = u.id
       WHERE p.id = ?`,
      [newPrescriptionId],
    );

    res.json({
      message: "Prescription refilled successfully",
      prescription: newPrescription[0],
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Feature 3: Partial Dispensing
exports.dispensePartial = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { dispensed_items } = req.body;

    // Check if prescription exists
    const [prescriptions] = await connection.execute(
      'SELECT * FROM prescriptions WHERE id = ? AND status IN ("pending", "partial")',
      [id],
    );

    if (prescriptions.length === 0) {
      return res
        .status(404)
        .json({ message: "Prescription not found or already completed" });
    }

    let allItemsFullyDispensed = true;

    for (const dispensedItem of dispensed_items) {
      const [prescriptionItem] = await connection.execute(
        "SELECT * FROM prescription_items WHERE id = ?",
        [dispensedItem.prescription_item_id],
      );

      if (prescriptionItem.length === 0) continue;

      const item = prescriptionItem[0];
      const previouslyDispensed = item.quantity_dispensed || 0;
      const prescribed = item.quantity_prescribed;
      const nowDispensing = dispensedItem.quantity_dispensed;
      const totalDispensed = previouslyDispensed + nowDispensing;
      const remaining = prescribed - totalDispensed;

      if (remaining > 0) {
        allItemsFullyDispensed = false;
      }

      // Check stock availability
      const [stock] = await connection.execute(
        "SELECT quantity_available FROM stock_inventory WHERE medicine_id = ?",
        [item.medicine_id],
      );

      if (stock.length === 0 || stock[0].quantity_available < nowDispensing) {
        throw new Error(
          `Insufficient stock for medicine ID: ${item.medicine_id}`,
        );
      }

      // Update prescription item
      await connection.execute(
        `UPDATE prescription_items 
         SET quantity_dispensed = ?, 
             quantity_remaining = ?, 
             is_partial = ? 
         WHERE id = ?`,
        [
          totalDispensed,
          remaining,
          remaining > 0,
          dispensedItem.prescription_item_id,
        ],
      );

      // Update stock
      await connection.execute(
        "UPDATE stock_inventory SET quantity_available = quantity_available - ? WHERE medicine_id = ?",
        [nowDispensing, item.medicine_id],
      );

      // Record stock out
      await connection.execute(
        `INSERT INTO stock_out (
          medicine_id, batch_number, quantity, reason, reference_id,
          processed_by, processed_date
        ) VALUES (?, 'DISPENSED', ?, 'sale', ?, ?, CURDATE())`,
        [item.medicine_id, nowDispensing, id, req.user.id],
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

// Get Partial Prescriptions
exports.getPartialPrescriptions = async (req, res, next) => {
  try {
    const [prescriptions] = await db.execute(
      `SELECT p.*, 
              p.patient_name,
              CONCAT(u.first_name, ' ', u.last_name) as physician_name,
              COUNT(pi.id) as item_count
       FROM prescriptions p
       LEFT JOIN users u ON p.physician_id = u.id
       LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
       WHERE p.status = 'partial'
       GROUP BY p.id
       ORDER BY p.updated_at DESC`,
    );

    res.json({ data: prescriptions });
  } catch (error) {
    next(error);
  }
};
