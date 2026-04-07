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
// Pharmacy-specific reports
exports.getPharmacySalesReport = async (req, res, next) => {
  try {
    const { start_date, end_date, cashier_id } = req.query;

    let sql = `SELECT s.sale_number, s.sale_date, s.customer_name, s.total_amount,
                      s.payment_method, CONCAT(u.first_name, ' ', u.last_name) as cashier_name,
                      COUNT(si.id) as items_count,
                      GROUP_CONCAT(CONCAT(m.name, ' (', si.quantity, ')') SEPARATOR ', ') as items
               FROM sales s
               LEFT JOIN users u ON s.cashier_id = u.id
               LEFT JOIN sale_items si ON s.id = si.sale_id
               LEFT JOIN medicines m ON si.medicine_id = m.id
               WHERE 1=1`;
    const params = [];

    if (start_date) {
      sql += ` AND DATE(s.sale_date) >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND DATE(s.sale_date) <= ?`;
      params.push(end_date);
    }

    if (cashier_id) {
      sql += ` AND s.cashier_id = ?`;
      params.push(cashier_id);
    }

    sql += ` GROUP BY s.id ORDER BY s.sale_date DESC`;

    const [sales] = await db.execute(sql, params);

    // Calculate summary statistics
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + parseFloat(sale.total_amount || 0),
      0,
    );
    const totalTransactions = sales.length;
    const averageTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Daily sales breakdown
    const dailySales = {};
    sales.forEach((sale) => {
      const date = new Date(sale.sale_date).toISOString().split("T")[0];
      if (!dailySales[date]) {
        dailySales[date] = { date, total: 0, count: 0 };
      }
      dailySales[date].total += parseFloat(sale.total_amount || 0);
      dailySales[date].count += 1;
    });

    res.json({
      report_type: "Pharmacy Sales Report",
      generated_at: new Date(),
      parameters: { start_date, end_date, cashier_id },
      summary: {
        total_revenue: totalRevenue,
        total_transactions: totalTransactions,
        average_transaction: averageTransaction,
        daily_breakdown: Object.values(dailySales).sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        ),
      },
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPharmacyInventoryReport = async (req, res, next) => {
  try {
    const { category_id, low_stock_only, out_of_stock_only } = req.query;

    let sql = `SELECT m.id, m.name, m.generic_name, m.strength, m.unit, m.reorder_level, m.unit_price,
                      mc.name as category_name, mt.name as type_name,
                      COALESCE(si.quantity_available, 0) as current_stock,
                      CASE
                        WHEN COALESCE(si.quantity_available, 0) = 0 THEN 'Out of Stock'
                        WHEN COALESCE(si.quantity_available, 0) <= m.reorder_level THEN 'Low Stock'
                        ELSE 'In Stock'
                      END as stock_status,
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
      sql += ` AND COALESCE(si.quantity_available, 0) <= m.reorder_level AND COALESCE(si.quantity_available, 0) > 0`;
    }

    if (out_of_stock_only === "true") {
      sql += ` AND COALESCE(si.quantity_available, 0) = 0`;
    }

    sql += ` ORDER BY m.name`;

    const [inventory] = await db.execute(sql, params);

    // Calculate summary statistics
    const totalValue = inventory.reduce(
      (sum, item) => sum + parseFloat(item.stock_value || 0),
      0,
    );
    const lowStockCount = inventory.filter(
      (item) => item.stock_status === "Low Stock",
    ).length;
    const outOfStockCount = inventory.filter(
      (item) => item.stock_status === "Out of Stock",
    ).length;
    const inStockCount = inventory.filter(
      (item) => item.stock_status === "In Stock",
    ).length;

    // Category breakdown
    const categoryBreakdown = {};
    inventory.forEach((item) => {
      const category = item.category_name || "Uncategorized";
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { count: 0, value: 0 };
      }
      categoryBreakdown[category].count += 1;
      categoryBreakdown[category].value += parseFloat(item.stock_value || 0);
    });

    res.json({
      report_type: "Pharmacy Inventory Report",
      generated_at: new Date(),
      summary: {
        total_medicines: inventory.length,
        total_stock_value: totalValue,
        in_stock_count: inStockCount,
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
        category_breakdown: categoryBreakdown,
      },
      data: inventory,
    });
  } catch (error) {
    console.error("Pharmacy Inventory Report Error:", error);
    next(error);
  }
};

exports.getPharmacyPerformanceReport = async (req, res, next) => {
  try {
    const { period = "30" } = req.query; // days

    // Sales performance
    const [salesPerformance] = await db.execute(
      `SELECT 
         DATE(s.sale_date) as date,
         COUNT(s.id) as transactions,
         SUM(s.total_amount) as revenue,
         AVG(s.total_amount) as avg_transaction,
         COUNT(DISTINCT s.cashier_id) as active_cashiers
       FROM sales s
       WHERE s.sale_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(s.sale_date)
       ORDER BY date DESC`,
      [period],
    );

    // Top selling medicines
    const [topMedicines] = await db.execute(
      `SELECT 
         si.medicine_name,
         SUM(si.quantity) as total_quantity,
         SUM(si.total_price) as total_revenue,
         COUNT(DISTINCT si.sale_id) as transaction_count
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       WHERE s.sale_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY si.medicine_id, si.medicine_name
       ORDER BY total_revenue DESC
       LIMIT 10`,
      [period],
    );

    // Cashier performance
    const [cashierPerformance] = await db.execute(
      `SELECT 
         CONCAT(u.first_name, ' ', u.last_name) as cashier_name,
         COUNT(s.id) as transactions,
         SUM(s.total_amount) as revenue,
         AVG(s.total_amount) as avg_transaction
       FROM sales s
       JOIN users u ON s.cashier_id = u.id
       WHERE s.sale_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY s.cashier_id
       ORDER BY revenue DESC`,
      [period],
    );

    // Stock movement analysis
    const [stockMovement] = await db.execute(
      `SELECT 
         m.name as medicine_name,
         COALESCE(si.quantity_available, 0) as current_stock,
         m.reorder_level,
         COALESCE(recent_sales.total_sold, 0) as sold_last_30_days,
         COALESCE(recent_sales.sales_value, 0) as revenue_last_30_days
       FROM medicines m
       LEFT JOIN stock_inventory si ON m.id = si.medicine_id
       LEFT JOIN (
         SELECT si.medicine_id, si.medicine_name,
                SUM(si.quantity) as total_sold,
                SUM(si.total_price) as sales_value
         FROM sale_items si
         JOIN sales s ON si.sale_id = s.id
         WHERE s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY si.medicine_id
       ) recent_sales ON m.id = recent_sales.medicine_id
       WHERE m.deleted_at IS NULL
       ORDER BY recent_sales.total_sold DESC`,
    );

    res.json({
      report_type: "Pharmacy Performance Report",
      generated_at: new Date(),
      period_days: period,
      sales_performance: salesPerformance,
      top_medicines: topMedicines,
      cashier_performance: cashierPerformance,
      stock_movement: stockMovement.slice(0, 20), // Top 20 moving items
    });
  } catch (error) {
    next(error);
  }
};

exports.getPharmacyDashboardStats = async (req, res, next) => {
  try {
    const stats = {};

    // Today's sales
    const [todaySales] = await db.execute(
      `SELECT COUNT(*) as transactions, COALESCE(SUM(total_amount), 0) as revenue
       FROM sales WHERE DATE(sale_date) = CURDATE()`,
    );
    stats.today_sales = todaySales[0];

    // This week's sales
    const [weekSales] = await db.execute(
      `SELECT COUNT(*) as transactions, COALESCE(SUM(total_amount), 0) as revenue
       FROM sales WHERE YEARWEEK(sale_date) = YEARWEEK(CURDATE())`,
    );
    stats.week_sales = weekSales[0];

    // This month's sales
    const [monthSales] = await db.execute(
      `SELECT COUNT(*) as transactions, COALESCE(SUM(total_amount), 0) as revenue
       FROM sales WHERE MONTH(sale_date) = MONTH(CURDATE()) AND YEAR(sale_date) = YEAR(CURDATE())`,
    );
    stats.month_sales = monthSales[0];

    // Stock alerts
    const [stockAlerts] = await db.execute(
      `SELECT 
         COUNT(CASE WHEN COALESCE(si.quantity_available, 0) = 0 THEN 1 END) as out_of_stock,
         COUNT(CASE WHEN COALESCE(si.quantity_available, 0) <= m.reorder_level AND COALESCE(si.quantity_available, 0) > 0 THEN 1 END) as low_stock
       FROM medicines m
       LEFT JOIN stock_inventory si ON m.id = si.medicine_id
       WHERE m.deleted_at IS NULL`,
    );
    stats.stock_alerts = stockAlerts[0];

    // Recent activity
    const [recentSales] = await db.execute(
      `SELECT s.sale_number, s.total_amount, s.sale_date,
              CONCAT(u.first_name, ' ', u.last_name) as cashier_name
       FROM sales s
       LEFT JOIN users u ON s.cashier_id = u.id
       ORDER BY s.sale_date DESC
       LIMIT 5`,
    );
    stats.recent_sales = recentSales;

    res.json(stats);
  } catch (error) {
    next(error);
  }
};
