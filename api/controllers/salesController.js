const db = require("../config/database");

// Generate unique sale number
const generateSaleNumber = async () => {
  const [result] = await db.execute("SELECT COUNT(*) as count FROM sales");
  const count = result[0].count + 1;
  return `SALE${String(count).padStart(8, "0")}`;
};

exports.processSale = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { payment_method, items, total_amount } = req.body;

    const sale_number = await generateSaleNumber();

    // Create sale record using existing table structure
    const [saleResult] = await connection.execute(
      `INSERT INTO sales (
        sale_number, customer_name, total_amount, payment_method,
        cashier_id, sale_date
      ) VALUES (?, ?, ?, ?, ?, CURDATE())`,
      [
        sale_number,
        "Walk-in Customer", // Default customer name
        total_amount,
        payment_method,
        req.user.id,
      ],
    );

    const saleId = saleResult.insertId;

    // Process each item
    for (const item of items) {
      // Check stock availability
      const [stock] = await connection.execute(
        "SELECT quantity_available FROM stock_inventory WHERE medicine_id = ?",
        [item.medicine_id],
      );

      if (stock.length === 0 || stock[0].quantity_available < item.quantity) {
        throw new Error(`Insufficient stock for ${item.medicine_name}`);
      }

      // Create sale item record
      await connection.execute(
        `INSERT INTO sale_items (
          sale_id, medicine_id, batch_number, quantity, unit_price, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          item.medicine_id,
          "SALE", // batch_number for sales
          item.quantity,
          item.unit_price,
          item.total_price,
        ],
      );

      // Reduce stock
      await connection.execute(
        "UPDATE stock_inventory SET quantity_available = quantity_available - ? WHERE medicine_id = ?",
        [item.quantity, item.medicine_id],
      );

      // Record stock out
      await connection.execute(
        `INSERT INTO stock_out (
          medicine_id, batch_number, quantity, reason, reference_id,
          processed_by, processed_date
        ) VALUES (?, 'SALE', ?, 'sale', ?, ?, CURDATE())`,
        [item.medicine_id, item.quantity, saleId, req.user.id],
      );
    }

    await connection.commit();

    // Get the complete sale record
    const [sale] = await connection.execute(
      `SELECT s.*, 
              CONCAT(u.first_name, ' ', u.last_name) as cashier_name
       FROM sales s
       LEFT JOIN users u ON s.cashier_id = u.id
       WHERE s.id = ?`,
      [saleId],
    );

    // Get sale items
    const [saleItems] = await connection.execute(
      "SELECT * FROM sale_items WHERE sale_id = ?",
      [saleId],
    );

    res.status(201).json({
      message: "Sale processed successfully",
      sale: {
        ...sale[0],
        items: saleItems,
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

exports.getAllSales = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT s.*, 
                      CONCAT(u.first_name, ' ', u.last_name) as cashier_name
               FROM sales s
               LEFT JOIN users u ON s.cashier_id = u.id
               WHERE 1=1`;
    const params = [];

    if (date_from) {
      sql += ` AND DATE(s.sale_date) >= ?`;
      params.push(date_from);
    }

    if (date_to) {
      sql += ` AND DATE(s.sale_date) <= ?`;
      params.push(date_to);
    }

    sql += ` ORDER BY s.sale_date DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [sales] = await db.execute(sql, params);

    res.json({
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSaleById = async (req, res, next) => {
  try {
    const [sales] = await db.execute(
      `SELECT s.*, 
              CONCAT(u.first_name, ' ', u.last_name) as cashier_name
       FROM sales s
       LEFT JOIN users u ON s.cashier_id = u.id
       WHERE s.id = ?`,
      [req.params.id],
    );

    if (sales.length === 0) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Get sale items
    const [items] = await db.execute(
      "SELECT * FROM sale_items WHERE sale_id = ?",
      [req.params.id],
    );

    res.json({
      ...sales[0],
      items,
    });
  } catch (error) {
    next(error);
  }
};
