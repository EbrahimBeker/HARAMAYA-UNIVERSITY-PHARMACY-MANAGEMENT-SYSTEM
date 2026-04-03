const db = require("../config/database");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = {};

    // Total patients
    const [patientCount] = await db.execute(
      "SELECT COUNT(*) as count FROM patients WHERE deleted_at IS NULL",
    );
    stats.total_patients = patientCount[0].count;

    // Total medicines
    const [medicineCount] = await db.execute(
      "SELECT COUNT(*) as count FROM medicines WHERE deleted_at IS NULL",
    );
    stats.total_medicines = medicineCount[0].count;

    // Pending prescriptions
    const [pendingPrescriptions] = await db.execute(
      'SELECT COUNT(*) as count FROM prescriptions WHERE status = "Pending"',
    );
    stats.pending_prescriptions = pendingPrescriptions[0].count;

    // Low stock medicines
    const [lowStock] = await db.execute(
      `SELECT COUNT(*) as count FROM medicines m
       LEFT JOIN stock_inventory si ON m.id = si.medicine_id
       WHERE COALESCE(si.quantity_available, 0) <= m.reorder_level`,
    );
    stats.low_stock_medicines = lowStock[0].count;

    // Today's prescriptions
    const [todayPrescriptions] = await db.execute(
      "SELECT COUNT(*) as count FROM prescriptions WHERE DATE(created_at) = CURDATE()",
    );
    stats.todays_prescriptions = todayPrescriptions[0].count;

    // This month's revenue (if invoices exist)
    const [monthlyRevenue] = await db.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as revenue 
       FROM invoices 
       WHERE MONTH(invoice_date) = MONTH(CURDATE()) 
         AND YEAR(invoice_date) = YEAR(CURDATE())
         AND status = 'Paid'`,
    );
    stats.monthly_revenue = monthlyRevenue[0].revenue;

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getPatientReport = async (req, res, next) => {
  try {
    const { start_date, end_date, format = "json" } = req.query;

    let sql = `SELECT p.patient_id, p.first_name, p.last_name, p.gender, 
                      p.phone, p.created_at as registration_date,
                      COUNT(DISTINCT pr.id) as total_prescriptions,
                      COUNT(DISTINCT d.id) as total_diagnoses
               FROM patients p
               LEFT JOIN prescriptions pr ON p.id = pr.patient_id
               LEFT JOIN diagnoses d ON p.id = d.patient_id
               WHERE p.deleted_at IS NULL`;
    const params = [];

    if (start_date) {
      sql += ` AND DATE(p.created_at) >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND DATE(p.created_at) <= ?`;
      params.push(end_date);
    }

    sql += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const [patients] = await db.execute(sql, params);

    res.json({
      report_type: "Patient Report",
      generated_at: new Date(),
      parameters: { start_date, end_date },
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

exports.getStockReport = async (req, res, next) => {
  try {
    const { category_id, low_stock_only } = req.query;

    let sql = `SELECT m.name, m.generic_name, m.strength, m.unit, m.reorder_level,
                      mc.name as category_name, mt.name as type_name,
                      COALESCE(si.quantity_available, 0) as current_stock,
                      CASE 
                        WHEN COALESCE(si.quantity_available, 0) <= m.reorder_level THEN 'Low Stock'
                        WHEN COALESCE(si.quantity_available, 0) = 0 THEN 'Out of Stock'
                        ELSE 'In Stock'
                      END as stock_status,
                      m.unit_price,
                      (COALESCE(si.quantity_available, 0) * m.unit_price) as stock_value
               FROM medicines m
               LEFT JOIN stock_inventory si ON m.id = si.medicine_id
               LEFT JOIN medicine_categories mc ON m.category_id = mc.id
               LEFT JOIN medicine_types mt ON m.type_id = mt.id
               WHERE m.deleted_at IS NULL`;
    const params = [];

    if (category_id) {
      sql += ` AND m.category_id = ?`;
      params.push(category_id);
    }

    if (low_stock_only === "true") {
      sql += ` AND COALESCE(si.quantity_available, 0) <= m.reorder_level`;
    }

    sql += ` ORDER BY m.name`;

    const [stock] = await db.execute(sql, params);

    // Calculate totals
    const totalValue = stock.reduce(
      (sum, item) => sum + parseFloat(item.stock_value || 0),
      0,
    );
    const lowStockCount = stock.filter(
      (item) => item.stock_status === "Low Stock",
    ).length;
    const outOfStockCount = stock.filter(
      (item) => item.stock_status === "Out of Stock",
    ).length;

    res.json({
      report_type: "Stock Report",
      generated_at: new Date(),
      summary: {
        total_medicines: stock.length,
        total_stock_value: totalValue,
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
      },
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPrescriptionReport = async (req, res, next) => {
  try {
    const { start_date, end_date, physician_id, status } = req.query;

    let sql = `SELECT p.prescription_number, p.prescription_date, p.status,
                      CONCAT(pat.first_name, ' ', pat.last_name) as patient_name,
                      CONCAT(u.first_name, ' ', u.last_name) as physician_name,
                      COUNT(pi.id) as item_count,
                      p.dispensed_at
               FROM prescriptions p
               LEFT JOIN patients pat ON p.patient_id = pat.id
               LEFT JOIN users u ON p.physician_id = u.id
               LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
               WHERE 1=1`;
    const params = [];

    if (start_date) {
      sql += ` AND DATE(p.prescription_date) >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND DATE(p.prescription_date) <= ?`;
      params.push(end_date);
    }

    if (physician_id) {
      sql += ` AND p.physician_id = ?`;
      params.push(physician_id);
    }

    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    sql += ` GROUP BY p.id ORDER BY p.prescription_date DESC`;

    const [prescriptions] = await db.execute(sql, params);

    // Calculate summary
    const totalPrescriptions = prescriptions.length;
    const pendingCount = prescriptions.filter(
      (p) => p.status === "Pending",
    ).length;
    const dispensedCount = prescriptions.filter(
      (p) => p.status === "Dispensed",
    ).length;

    res.json({
      report_type: "Prescription Report",
      generated_at: new Date(),
      parameters: { start_date, end_date, physician_id, status },
      summary: {
        total_prescriptions: totalPrescriptions,
        pending_count: pendingCount,
        dispensed_count: dispensedCount,
      },
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSupplierReport = async (req, res, next) => {
  try {
    const [suppliers] = await db.execute(
      `SELECT s.name, s.contact_person, s.phone, s.email,
              COUNT(DISTINCT po.id) as total_orders,
              COUNT(DISTINCT CASE WHEN po.status = 'Delivered' THEN po.id END) as delivered_orders,
              COALESCE(SUM(CASE WHEN po.status = 'Delivered' THEN po.total_amount END), 0) as total_value,
              MAX(po.order_date) as last_order_date
       FROM suppliers s
       LEFT JOIN purchase_orders po ON s.id = po.supplier_id
       WHERE s.deleted_at IS NULL
       GROUP BY s.id
       ORDER BY total_value DESC`,
    );

    res.json({
      report_type: "Supplier Report",
      generated_at: new Date(),
      data: suppliers,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSystemActivityReport = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    let sql = `SELECT al.action, al.table_name, al.created_at,
                      CONCAT(u.first_name, ' ', u.last_name) as user_name,
                      u.username
               FROM audit_log al
               LEFT JOIN users u ON al.user_id = u.id
               WHERE 1=1`;
    const params = [];

    if (start_date) {
      sql += ` AND DATE(al.created_at) >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND DATE(al.created_at) <= ?`;
      params.push(end_date);
    }

    sql += ` ORDER BY al.created_at DESC LIMIT 1000`;

    const [activities] = await db.execute(sql, params);

    res.json({
      report_type: "System Activity Report",
      generated_at: new Date(),
      parameters: { start_date, end_date },
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
