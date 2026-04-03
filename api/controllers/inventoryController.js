const db = require("../config/database");

exports.getCurrentStock = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search, category_id, low_stock } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT m.id, m.name, m.generic_name, m.strength, m.unit, m.reorder_level,
                      mc.name as category_name, mt.name as type_name,
                      COALESCE(si.quantity_available, 0) as quantity_available,
                      CASE 
                        WHEN COALESCE(si.quantity_available, 0) <= m.reorder_level THEN 'Low Stock'
                        WHEN COALESCE(si.quantity_available, 0) = 0 THEN 'Out of Stock'
                        ELSE 'In Stock'
                      END as stock_status
               FROM medicines m
               LEFT JOIN stock_inventory si ON m.id = si.medicine_id
               LEFT JOIN medicine_categories mc ON m.category_id = mc.id
               LEFT JOIN medicine_types mt ON m.type_id = mt.id
               WHERE m.deleted_at IS NULL`;
    const params = [];

    if (search) {
      sql += ` AND (m.name LIKE ? OR m.generic_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term);
    }

    if (category_id) {
      sql += ` AND m.category_id = ?`;
      params.push(category_id);
    }

    if (low_stock === "true") {
      sql += ` AND COALESCE(si.quantity_available, 0) <= m.reorder_level`;
    }

    sql += ` ORDER BY m.name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [stock] = await db.execute(sql, params);

    res.json({
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

exports.receiveStock = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      medicine_id,
      supplier_id,
      purchase_order_id,
      batch_number,
      quantity,
      unit_cost,
      manufacture_date,
      expiry_date,
      notes,
    } = req.body;

    // Record stock in
    await connection.execute(
      `INSERT INTO stock_in (
        medicine_id, supplier_id, purchase_order_id, batch_number, quantity,
        unit_cost, manufacture_date, expiry_date, received_by, received_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
      [
        medicine_id,
        supplier_id,
        purchase_order_id,
        batch_number,
        quantity,
        unit_cost,
        manufacture_date,
        expiry_date,
        req.user.id,
        notes,
      ],
    );

    // Update stock inventory
    await connection.execute(
      `INSERT INTO stock_inventory (medicine_id, quantity_available)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE quantity_available = quantity_available + ?`,
      [medicine_id, quantity, quantity],
    );

    // Update expiry tracking
    await connection.execute(
      `INSERT INTO expiry_tracking (medicine_id, batch_number, quantity_remaining, expiry_date)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity_remaining = quantity_remaining + ?`,
      [medicine_id, batch_number, quantity, expiry_date, quantity],
    );

    await connection.commit();

    res.status(201).json({
      message: "Stock received successfully",
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

exports.getStockMovements = async (req, res, next) => {
  try {
    const { medicine_id, type, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;

    let sql,
      params = [];

    if (type === "in") {
      sql = `SELECT si.*, m.name as medicine_name, s.name as supplier_name,
                    CONCAT(u.first_name, ' ', u.last_name) as received_by_name
             FROM stock_in si
             LEFT JOIN medicines m ON si.medicine_id = m.id
             LEFT JOIN suppliers s ON si.supplier_id = s.id
             LEFT JOIN users u ON si.received_by = u.id
             WHERE 1=1`;
    } else if (type === "out") {
      sql = `SELECT so.*, m.name as medicine_name,
                    CONCAT(u.first_name, ' ', u.last_name) as processed_by_name
             FROM stock_out so
             LEFT JOIN medicines m ON so.medicine_id = m.id
             LEFT JOIN users u ON so.processed_by = u.id
             WHERE 1=1`;
    } else {
      return res.status(400).json({ message: 'Type must be "in" or "out"' });
    }

    if (medicine_id) {
      sql += ` AND ${type === "in" ? "si" : "so"}.medicine_id = ?`;
      params.push(medicine_id);
    }

    sql += ` ORDER BY ${type === "in" ? "si.received_date" : "so.processed_date"} DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [movements] = await db.execute(sql, params);

    res.json({
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpiringMedicines = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const [expiring] = await db.execute(
      `SELECT et.*, m.name as medicine_name, m.unit,
              DATEDIFF(et.expiry_date, CURDATE()) as days_to_expiry
       FROM expiry_tracking et
       LEFT JOIN medicines m ON et.medicine_id = m.id
       WHERE et.quantity_remaining > 0 
         AND et.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY et.expiry_date ASC`,
      [parseInt(days)],
    );

    res.json({
      data: expiring,
    });
  } catch (error) {
    next(error);
  }
};

exports.adjustStock = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { medicine_id, adjustment_type, quantity, reason, notes } = req.body;

    // Get current stock
    const [currentStock] = await connection.execute(
      "SELECT quantity_available FROM stock_inventory WHERE medicine_id = ?",
      [medicine_id],
    );

    if (currentStock.length === 0) {
      return res
        .status(404)
        .json({ message: "Medicine not found in inventory" });
    }

    const currentQuantity = currentStock[0].quantity_available;
    let newQuantity;

    if (adjustment_type === "increase") {
      newQuantity = currentQuantity + quantity;
    } else if (adjustment_type === "decrease") {
      newQuantity = Math.max(0, currentQuantity - quantity);
    } else {
      return res.status(400).json({ message: "Invalid adjustment type" });
    }

    // Update stock inventory
    await connection.execute(
      "UPDATE stock_inventory SET quantity_available = ? WHERE medicine_id = ?",
      [newQuantity, medicine_id],
    );

    // Record stock movement
    if (adjustment_type === "decrease") {
      await connection.execute(
        `INSERT INTO stock_out (
          medicine_id, batch_number, quantity, reason, processed_by, processed_date, notes
        ) VALUES (?, 'ADJUSTMENT', ?, ?, ?, CURDATE(), ?)`,
        [medicine_id, quantity, reason, req.user.id, notes],
      );
    }

    await connection.commit();

    res.json({
      message: "Stock adjusted successfully",
      old_quantity: currentQuantity,
      new_quantity: newQuantity,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
