const db = require("../config/database");
const xlsx = require("xlsx");

// Get supplier's catalog
exports.getAll = async (req, res, next) => {
  try {
    const { supplier_id, is_available, search } = req.query;

    let sql = `SELECT sc.*, m.name as medicine_name, m.generic_name, 
                      m.strength, m.unit, mc.name as category_name,
                      mt.name as type_name
               FROM supplier_catalog sc
               JOIN medicines m ON sc.medicine_id = m.id
               LEFT JOIN medicine_categories mc ON m.category_id = mc.id
               LEFT JOIN medicine_types mt ON m.type_id = mt.id
               WHERE 1=1`;
    const params = [];

    // Get supplier_id for Drug Supplier users
    let userSupplierId = null;
    if (req.user.roles.includes("Drug Supplier")) {
      const [suppliers] = await db.execute(
        "SELECT id FROM suppliers WHERE user_id = ?",
        [req.user.id],
      );
      if (suppliers.length > 0) {
        userSupplierId = suppliers[0].id;
        sql += ` AND sc.supplier_id = ?`;
        params.push(userSupplierId);
      }
    } else if (supplier_id) {
      sql += ` AND sc.supplier_id = ?`;
      params.push(supplier_id);
    }

    if (is_available !== undefined) {
      sql += ` AND sc.is_available = ?`;
      params.push(is_available === "true" ? 1 : 0);
    }

    if (search) {
      sql += ` AND (m.name LIKE ? OR m.generic_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term);
    }

    sql += ` ORDER BY m.name`;

    const [items] = await db.execute(sql, params);
    res.json({ data: items, supplier_id: userSupplierId });
  } catch (error) {
    next(error);
  }
};

// Add/Update catalog item
exports.upsert = async (req, res, next) => {
  try {
    const {
      supplier_id,
      medicine_id,
      unit_price,
      quantity_available,
      minimum_order_quantity,
      is_available,
      notes,
    } = req.body;

    // Verify supplier ownership
    if (req.user.roles.includes("Drug Supplier")) {
      const [suppliers] = await db.execute(
        "SELECT id FROM suppliers WHERE user_id = ? AND id = ?",
        [req.user.id, supplier_id],
      );
      if (suppliers.length === 0) {
        return res
          .status(403)
          .json({ message: "Not authorized for this supplier" });
      }
    }

    const [existing] = await db.execute(
      "SELECT id FROM supplier_catalog WHERE supplier_id = ? AND medicine_id = ?",
      [supplier_id, medicine_id],
    );

    if (existing.length > 0) {
      // Update existing
      await db.execute(
        `UPDATE supplier_catalog 
         SET unit_price = ?, quantity_available = ?, minimum_order_quantity = ?,
             is_available = ?, notes = ?
         WHERE id = ?`,
        [
          unit_price,
          quantity_available,
          minimum_order_quantity,
          is_available ? 1 : 0,
          notes || null,
          existing[0].id,
        ],
      );
      res.json({ message: "Catalog item updated successfully" });
    } else {
      // Insert new
      await db.execute(
        `INSERT INTO supplier_catalog (supplier_id, medicine_id, unit_price, quantity_available,
                                       minimum_order_quantity, is_available, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          supplier_id,
          medicine_id,
          unit_price,
          quantity_available,
          minimum_order_quantity,
          is_available ? 1 : 0,
          notes || null,
        ],
      );
      res.status(201).json({ message: "Catalog item added successfully" });
    }
  } catch (error) {
    next(error);
  }
};

// Bulk upload from Excel
exports.bulkUpload = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { supplier_id } = req.body;

    if (!supplier_id) {
      return res.status(400).json({ message: "Supplier ID is required" });
    }

    console.log("Bulk upload request:", {
      supplier_id,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Verify supplier ownership
    if (req.user.roles.includes("Drug Supplier")) {
      const [suppliers] = await connection.execute(
        "SELECT id FROM suppliers WHERE user_id = ? AND id = ?",
        [req.user.id, supplier_id],
      );
      if (suppliers.length === 0) {
        return res
          .status(403)
          .json({ message: "Not authorized for this supplier" });
      }
    }

    // Read Excel/CSV file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`Processing ${data.length} rows from file`);

    if (data.length === 0) {
      return res
        .status(400)
        .json({ message: "File is empty or invalid format" });
    }

    await connection.beginTransaction();

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Expected columns: medicine_name, unit_price, quantity_available, minimum_order_quantity, notes
        const medicineName = row.medicine_name || row.Medicine || row.medicine;
        const unitPrice = parseFloat(row.unit_price || row.price || row.Price);
        const quantityAvailable = parseInt(
          row.quantity_available || row.quantity || row.Quantity || 0,
        );
        const minimumOrderQty = parseInt(
          row.minimum_order_quantity || row.min_quantity || 1,
        );
        const notes = row.notes || row.Notes || null;

        if (!medicineName || isNaN(unitPrice)) {
          errors.push(`Row ${i + 2}: Missing medicine name or invalid price`);
          errorCount++;
          continue;
        }

        // Find medicine by name
        const [medicines] = await connection.execute(
          "SELECT id FROM medicines WHERE name LIKE ? OR generic_name LIKE ? LIMIT 1",
          [`%${medicineName}%`, `%${medicineName}%`],
        );

        if (medicines.length === 0) {
          errors.push(`Row ${i + 2}: Medicine "${medicineName}" not found`);
          errorCount++;
          continue;
        }

        const medicineId = medicines[0].id;

        // Upsert catalog item
        const [existing] = await connection.execute(
          "SELECT id FROM supplier_catalog WHERE supplier_id = ? AND medicine_id = ?",
          [supplier_id, medicineId],
        );

        if (existing.length > 0) {
          await connection.execute(
            `UPDATE supplier_catalog 
             SET unit_price = ?, quantity_available = ?, minimum_order_quantity = ?,
                 is_available = 1, notes = ?
             WHERE id = ?`,
            [
              unitPrice,
              quantityAvailable,
              minimumOrderQty,
              notes,
              existing[0].id,
            ],
          );
        } else {
          await connection.execute(
            `INSERT INTO supplier_catalog (supplier_id, medicine_id, unit_price, quantity_available,
                                           minimum_order_quantity, is_available, notes)
             VALUES (?, ?, ?, ?, ?, 1, ?)`,
            [
              supplier_id,
              medicineId,
              unitPrice,
              quantityAvailable,
              minimumOrderQty,
              notes,
            ],
          );
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        errors.push(`Row ${i + 2}: ${error.message}`);
        errorCount++;
      }
    }

    await connection.commit();

    console.log(
      `Bulk upload completed: ${successCount} success, ${errorCount} errors`,
    );

    res.json({
      message: "Bulk upload completed",
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Delete catalog item
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    if (req.user.roles.includes("Drug Supplier")) {
      const [items] = await db.execute(
        `SELECT sc.id FROM supplier_catalog sc
         JOIN suppliers s ON sc.supplier_id = s.id
         WHERE sc.id = ? AND s.user_id = ?`,
        [id, req.user.id],
      );
      if (items.length === 0) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    await db.execute("DELETE FROM supplier_catalog WHERE id = ?", [id]);
    res.json({ message: "Catalog item deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get catalog statistics
exports.getStats = async (req, res, next) => {
  try {
    let supplierId = req.query.supplier_id;

    // If user is Drug Supplier, get their supplier ID
    if (req.user.roles.includes("Drug Supplier")) {
      const [suppliers] = await db.execute(
        "SELECT id FROM suppliers WHERE user_id = ?",
        [req.user.id],
      );
      if (suppliers.length === 0) {
        return res.json({ totalItems: 0, availableItems: 0, totalValue: 0 });
      }
      supplierId = suppliers[0].id;
    }

    const [stats] = await db.execute(
      `SELECT 
        COUNT(*) as totalItems,
        SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) as availableItems,
        SUM(unit_price * quantity_available) as totalValue
       FROM supplier_catalog
       WHERE supplier_id = ?`,
      [supplierId],
    );

    res.json(stats[0] || { totalItems: 0, availableItems: 0, totalValue: 0 });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
