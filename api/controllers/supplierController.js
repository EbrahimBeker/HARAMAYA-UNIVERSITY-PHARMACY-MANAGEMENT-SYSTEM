const db = require("../config/database");

exports.getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 15,
      search,
      is_active,
      with_user_only,
      for_ordering,
      for_stock_in,
    } = req.query;
    const offset = (page - 1) * limit;
    let sql = "SELECT * FROM suppliers WHERE deleted_at IS NULL";
    const params = [];

    // Filter for purchase ordering: ONLY show suppliers created by Admin AND have user accounts
    if (for_ordering === "true" && req.user) {
      // Only show Admin-created suppliers that have linked user accounts
      sql += ` AND created_by IN (
        SELECT ur.user_id FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE r.name = 'Admin'
      ) AND user_id IS NOT NULL`;
    }

    // Filter for stock in: show Admin suppliers + current user's suppliers
    if (for_stock_in === "true" && req.user) {
      // Get user's role
      const [userRoles] = await db.execute(
        `SELECT r.name FROM roles r 
         JOIN user_roles ur ON r.id = ur.role_id 
         WHERE ur.user_id = ?`,
        [req.user.id],
      );

      const isAdmin = userRoles.some((role) => role.name === "Admin");

      if (!isAdmin) {
        // For non-admin users, show suppliers created by Admin OR by themselves
        sql += ` AND (created_by IN (
          SELECT ur.user_id FROM user_roles ur 
          JOIN roles r ON ur.role_id = r.id 
          WHERE r.name = 'Admin'
        ) OR created_by = ? OR created_by IS NULL)`;
        params.push(req.user.id);
      }
      // Admin sees all suppliers
    }

    // Filter to only suppliers with linked user accounts (for purchase orders)
    if (with_user_only === "true") {
      sql += " AND user_id IS NOT NULL";
    }

    if (search) {
      sql += " AND (name LIKE ? OR contact_person LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term);
    }
    if (is_active !== undefined) {
      sql += " AND is_active = ?";
      params.push(is_active === "true" ? 1 : 0);
    }
    sql += " ORDER BY name LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);
    const [suppliers] = await db.execute(sql, params);
    res.json({ data: suppliers });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, contact_person, email, phone, address, user_id } = req.body;
    const created_by = req.user.id; // Track who created this supplier

    const [result] = await db.execute(
      "INSERT INTO suppliers (name, contact_person, email, phone, address, user_id, created_by, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
      [
        name,
        contact_person || null,
        email || null,
        phone,
        address || null,
        user_id || null,
        created_by,
      ],
    );
    const [supplier] = await db.execute(
      "SELECT * FROM suppliers WHERE id = ?",
      [result.insertId],
    );
    res.status(201).json({
      message: "Supplier created successfully",
      supplier: supplier[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const [suppliers] = await db.execute(
      "SELECT * FROM suppliers WHERE id = ? AND deleted_at IS NULL",
      [req.params.id],
    );
    if (suppliers.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(suppliers[0]);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contact_person, email, phone, address, is_active, user_id } =
      req.body;
    const updates = [];
    const params = [];
    if (name) {
      updates.push("name = ?");
      params.push(name);
    }
    if (contact_person !== undefined) {
      updates.push("contact_person = ?");
      params.push(contact_person);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      params.push(email);
    }
    if (phone) {
      updates.push("phone = ?");
      params.push(phone);
    }
    if (address !== undefined) {
      updates.push("address = ?");
      params.push(address);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active ? 1 : 0);
    }
    if (user_id !== undefined) {
      updates.push("user_id = ?");
      params.push(user_id);
    }
    if (updates.length > 0) {
      params.push(id);
      await db.execute(
        `UPDATE suppliers SET ${updates.join(", ")} WHERE id = ?`,
        params,
      );
    }
    const [supplier] = await db.execute(
      "SELECT * FROM suppliers WHERE id = ?",
      [id],
    );
    res.json({
      message: "Supplier updated successfully",
      supplier: supplier[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await db.execute(
      "UPDATE suppliers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
      [req.params.id],
    );
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    next(error);
  }
};
