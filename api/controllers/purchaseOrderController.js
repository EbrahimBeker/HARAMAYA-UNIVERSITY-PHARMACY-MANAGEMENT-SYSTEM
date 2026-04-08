const db = require("../config/database");

// Generate unique purchase order number
const generateOrderNumber = async () => {
  const [result] = await db.execute(
    "SELECT COUNT(*) as count FROM purchase_orders",
  );
  const count = result[0].count + 1;
  return `PO${String(count).padStart(8, "0")}`;
};

// Pharmacist: Create purchase order
exports.create = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { supplier_id, order_date, expected_delivery_date, items, notes } =
      req.body;

    const order_number = await generateOrderNumber();

    // Calculate total amount
    const total_amount = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );

    // Create purchase order
    const [result] = await connection.execute(
      `INSERT INTO purchase_orders (
        order_number, supplier_id, pharmacist_id, order_date,
        expected_delivery_date, total_amount, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        order_number,
        supplier_id,
        req.user.id,
        order_date,
        expected_delivery_date,
        total_amount,
        notes || null,
      ],
    );

    const orderId = result.insertId;

    // Create order items
    for (const item of items) {
      await connection.execute(
        `INSERT INTO purchase_order_items (
          purchase_order_id, medicine_id, quantity_ordered,
          unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.medicine_id,
          item.quantity,
          item.unit_price,
          item.quantity * item.unit_price,
        ],
      );
    }

    await connection.commit();

    // Get created order with details
    const [order] = await connection.execute(
      `SELECT po.*, s.name as supplier_name,
              CONCAT(u.first_name, ' ', u.last_name) as pharmacist_name
       FROM purchase_orders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN users u ON po.pharmacist_id = u.id
       WHERE po.id = ?`,
      [orderId],
    );

    res.status(201).json({
      message: "Purchase order created successfully",
      order: order[0],
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Get all purchase orders
exports.getAll = async (req, res, next) => {
  try {
    const { status, supplier_id } = req.query;

    let sql = `SELECT po.id, po.order_number, po.supplier_id, po.pharmacist_id,
                      po.order_date, po.expected_delivery_date, po.actual_delivery_date,
                      po.status, po.total_amount, po.notes, po.created_at, po.updated_at,
                      s.name as supplier_name,
                      CONCAT(u.first_name, ' ', u.last_name) as pharmacist_name,
                      (SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = po.id) as item_count
               FROM purchase_orders po
               LEFT JOIN suppliers s ON po.supplier_id = s.id
               LEFT JOIN users u ON po.pharmacist_id = u.id
               WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND po.status = ?`;
      params.push(status);
    }

    if (supplier_id) {
      sql += ` AND po.supplier_id = ?`;
      params.push(supplier_id);
    }

    // If user is a Drug Supplier, only show orders for their company
    if (req.user.roles.includes("Drug Supplier")) {
      sql += ` AND po.supplier_id IN (SELECT id FROM suppliers WHERE user_id = ?)`;
      params.push(req.user.id);
    }

    sql += ` ORDER BY po.created_at DESC`;

    const [orders] = await db.execute(sql, params);

    res.json({ data: orders });
  } catch (error) {
    console.error("Purchase Orders getAll error:", error);
    next(error);
  }
};

// Get single purchase order with items
exports.getOne = async (req, res, next) => {
  try {
    const [orders] = await db.execute(
      `SELECT po.*, s.name as supplier_name, s.phone as supplier_phone,
              s.email as supplier_email,
              CONCAT(u.first_name, ' ', u.last_name) as pharmacist_name
       FROM purchase_orders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN users u ON po.pharmacist_id = u.id
       WHERE po.id = ?`,
      [req.params.id],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    // Get order items
    const [items] = await db.execute(
      `SELECT poi.*, m.name as medicine_name, m.generic_name,
              m.strength, m.unit
       FROM purchase_order_items poi
       LEFT JOIN medicines m ON poi.medicine_id = m.id
       WHERE poi.purchase_order_id = ?`,
      [req.params.id],
    );

    res.json({
      ...orders[0],
      items,
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (simple status change)
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, actual_delivery_date } = req.body;

    const updates = ["status = ?"];
    const params = [status];

    if (actual_delivery_date && status === "delivered") {
      updates.push("actual_delivery_date = ?");
      params.push(actual_delivery_date);
    }

    params.push(id);

    await db.execute(
      `UPDATE purchase_orders SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    next(error);
  }
};

// Supplier: Confirm order and availability
exports.confirmOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { items, expected_delivery_date } = req.body;

    // Update order status
    await connection.execute(
      `UPDATE purchase_orders 
       SET status = 'confirmed', expected_delivery_date = ?
       WHERE id = ?`,
      [expected_delivery_date, id],
    );

    // Update item quantities confirmed
    for (const item of items) {
      await connection.execute(
        `UPDATE purchase_order_items 
         SET quantity_confirmed = ?
         WHERE id = ?`,
        [item.quantity_confirmed, item.id],
      );
    }

    await connection.commit();

    res.json({ message: "Purchase order confirmed successfully" });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Supplier: Mark as delivered (automatically updates pharmacist inventory)
exports.markDelivered = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { actual_delivery_date, items } = req.body;

    // Get order details
    const [orders] = await connection.execute(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [id],
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const order = orders[0];

    // Update order status
    await connection.execute(
      `UPDATE purchase_orders 
       SET status = 'delivered', actual_delivery_date = ?
       WHERE id = ?`,
      [actual_delivery_date || new Date().toISOString().split("T")[0], id],
    );

    // Update received quantities and add to inventory
    for (const item of items) {
      const quantityReceived = item.quantity_received || item.quantity_ordered;

      // Update purchase order item
      await connection.execute(
        `UPDATE purchase_order_items 
         SET quantity_received = ?
         WHERE id = ?`,
        [quantityReceived, item.id],
      );

      // Get medicine details
      const [orderItems] = await connection.execute(
        "SELECT medicine_id FROM purchase_order_items WHERE id = ?",
        [item.id],
      );

      if (orderItems.length > 0) {
        const medicineId = orderItems[0].medicine_id;

        // Update stock inventory
        const [existingStock] = await connection.execute(
          "SELECT * FROM stock_inventory WHERE medicine_id = ?",
          [medicineId],
        );

        if (existingStock.length > 0) {
          await connection.execute(
            `UPDATE stock_inventory 
             SET quantity_available = quantity_available + ?
             WHERE medicine_id = ?`,
            [quantityReceived, medicineId],
          );
        } else {
          await connection.execute(
            `INSERT INTO stock_inventory (medicine_id, quantity_available)
             VALUES (?, ?)`,
            [medicineId, quantityReceived],
          );
        }

        // Record stock in transaction
        await connection.execute(
          `INSERT INTO stock_in (
            medicine_id, supplier_id, quantity, batch_number,
            expiry_date, received_by, received_date, purchase_order_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            medicineId,
            order.supplier_id,
            quantityReceived,
            item.batch_number || `PO-${order.order_number}`,
            item.expiry_date || null,
            order.pharmacist_id,
            actual_delivery_date || new Date().toISOString().split("T")[0],
            id,
          ],
        );
      }
    }

    await connection.commit();

    res.json({
      message: "Order marked as delivered and inventory updated successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Mark delivered error:", error);
    next(error);
  } finally {
    connection.release();
  }
};

// Pharmacist: Receive stock (after delivery)
exports.receiveStock = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { items } = req.body;

    // Get order details
    const [orders] = await connection.execute(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [id],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const order = orders[0];

    // Update stock for each item
    for (const item of items) {
      const [orderItem] = await connection.execute(
        "SELECT * FROM purchase_order_items WHERE id = ?",
        [item.id],
      );

      if (orderItem.length > 0) {
        const medicineId = orderItem[0].medicine_id;
        const quantityReceived = item.quantity_received;

        // Update or insert stock inventory
        const [existingStock] = await connection.execute(
          "SELECT * FROM stock_inventory WHERE medicine_id = ?",
          [medicineId],
        );

        if (existingStock.length > 0) {
          await connection.execute(
            `UPDATE stock_inventory 
             SET quantity_available = quantity_available + ?
             WHERE medicine_id = ?`,
            [quantityReceived, medicineId],
          );
        } else {
          await connection.execute(
            `INSERT INTO stock_inventory (medicine_id, quantity_available)
             VALUES (?, ?)`,
            [medicineId, quantityReceived],
          );
        }

        // Record stock in
        await connection.execute(
          `INSERT INTO stock_in (
            medicine_id, supplier_id, quantity, batch_number,
            expiry_date, received_by, received_date
          ) VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
          [
            medicineId,
            order.supplier_id,
            quantityReceived,
            item.batch_number || "N/A",
            item.expiry_date || null,
            req.user.id,
          ],
        );
      }
    }

    await connection.commit();

    res.json({ message: "Stock received successfully" });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Cancel order
exports.cancel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await db.execute(
      `UPDATE purchase_orders 
       SET status = 'cancelled', notes = CONCAT(COALESCE(notes, ''), '\nCancellation reason: ', ?)
       WHERE id = ?`,
      [reason || "No reason provided", id],
    );

    res.json({ message: "Purchase order cancelled successfully" });
  } catch (error) {
    next(error);
  }
};

// Pharmacist: Upload payment receipt
exports.uploadPaymentReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_date, payment_notes } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Payment receipt image is required" });
    }

    // Get order details
    const [orders] = await db.execute(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [id],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const order = orders[0];

    // Check if order is confirmed
    if (order.status !== "confirmed") {
      return res.status(400).json({
        message: "Can only upload payment receipt for confirmed orders",
      });
    }

    // Store the file path (relative to uploads directory)
    const receiptPath = `payment-receipts/${req.file.filename}`;

    // Update order with payment receipt
    await db.execute(
      `UPDATE purchase_orders 
       SET payment_status = 'pending_verification',
           payment_receipt_image = ?,
           payment_date = ?,
           payment_notes = ?,
           payment_uploaded_at = NOW()
       WHERE id = ?`,
      [receiptPath, payment_date || null, payment_notes || null, id],
    );

    res.json({
      message: "Payment receipt uploaded successfully",
      receipt_path: receiptPath,
    });
  } catch (error) {
    next(error);
  }
};

// Supplier: Confirm payment and mark as delivered
exports.confirmPaymentAndDeliver = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { actual_delivery_date, items } = req.body;

    // Get order details
    const [orders] = await connection.execute(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [id],
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const order = orders[0];

    // Check if payment receipt is uploaded
    if (!order.payment_receipt_image) {
      await connection.rollback();
      return res.status(400).json({
        message: "Cannot deliver order without payment receipt",
      });
    }

    // Update order status to delivered and mark payment as verified
    await connection.execute(
      `UPDATE purchase_orders 
       SET status = 'delivered',
           payment_status = 'paid',
           actual_delivery_date = ?,
           payment_verified_at = NOW(),
           payment_verified_by = ?
       WHERE id = ?`,
      [
        actual_delivery_date || new Date().toISOString().split("T")[0],
        req.user.id,
        id,
      ],
    );

    // Update received quantities and add to inventory
    for (const item of items) {
      const quantityReceived = item.quantity_received || item.quantity_ordered;

      // Update purchase order item
      await connection.execute(
        `UPDATE purchase_order_items 
         SET quantity_received = ?
         WHERE id = ?`,
        [quantityReceived, item.id],
      );

      // Get medicine details
      const [orderItems] = await connection.execute(
        "SELECT medicine_id FROM purchase_order_items WHERE id = ?",
        [item.id],
      );

      if (orderItems.length > 0) {
        const medicineId = orderItems[0].medicine_id;

        // Update stock inventory
        const [existingStock] = await connection.execute(
          "SELECT * FROM stock_inventory WHERE medicine_id = ?",
          [medicineId],
        );

        if (existingStock.length > 0) {
          await connection.execute(
            `UPDATE stock_inventory 
             SET quantity_available = quantity_available + ?
             WHERE medicine_id = ?`,
            [quantityReceived, medicineId],
          );
        } else {
          await connection.execute(
            `INSERT INTO stock_inventory (medicine_id, quantity_available)
             VALUES (?, ?)`,
            [medicineId, quantityReceived],
          );
        }

        // Record stock in transaction
        await connection.execute(
          `INSERT INTO stock_in (
            medicine_id, supplier_id, quantity, batch_number,
            expiry_date, received_by, received_date, purchase_order_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            medicineId,
            order.supplier_id,
            quantityReceived,
            item.batch_number || `PO-${order.order_number}`,
            item.expiry_date || null,
            order.pharmacist_id,
            actual_delivery_date || new Date().toISOString().split("T")[0],
            id,
          ],
        );
      }
    }

    await connection.commit();

    res.json({
      message:
        "Payment confirmed and order delivered. Inventory updated successfully.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Confirm payment and deliver error:", error);
    next(error);
  } finally {
    connection.release();
  }
};

// Get payment details including receipt
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const [result] = await db.execute(
      `SELECT po.payment_status, po.payment_receipt_image, po.payment_date,
              po.payment_notes, po.payment_uploaded_at, po.payment_verified_at,
              CONCAT(u.first_name, ' ', u.last_name) as verified_by_name
       FROM purchase_orders po
       LEFT JOIN users u ON po.payment_verified_by = u.id
       WHERE po.id = ?`,
      [req.params.id],
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    res.json(result[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
