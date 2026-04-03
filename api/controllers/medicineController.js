const db = require('../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search, category_id, type_id } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT m.*, mc.name as category_name, mt.name as type_name, si.quantity_available
               FROM medicines m
               LEFT JOIN medicine_categories mc ON m.category_id = mc.id
               LEFT JOIN medicine_types mt ON m.type_id = mt.id
               LEFT JOIN stock_inventory si ON m.id = si.medicine_id
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

    if (type_id) {
      sql += ` AND m.type_id = ?`;
      params.push(type_id);
    }

    sql += ` ORDER BY m.name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [medicines] = await db.execute(sql, params);
    res.json({ data: medicines });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { name, generic_name, category_id, type_id, strength, unit, reorder_level, unit_price, requires_prescription } = req.body;

    const [result] = await connection.execute(
      `INSERT INTO medicines (name, generic_name, category_id, type_id, strength, unit, reorder_level, unit_price, requires_prescription)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, generic_name || null, category_id, type_id, strength || null, unit, reorder_level || 10, unit_price, requires_prescription ? 1 : 0]
    );

    const medicineId = result.insertId;

    await connection.execute(
      'INSERT INTO stock_inventory (medicine_id, quantity_available) VALUES (?, 0)',
      [medicineId]
    );

    await connection.commit();

    const [medicines] = await db.execute(
      `SELECT m.*, mc.name as category_name, mt.name as type_name, si.quantity_available
       FROM medicines m
       LEFT JOIN medicine_categories mc ON m.category_id = mc.id
       LEFT JOIN medicine_types mt ON m.type_id = mt.id
       LEFT JOIN stock_inventory si ON m.id = si.medicine_id
       WHERE m.id = ?`,
      [medicineId]
    );

    res.status(201).json({
      message: 'Medicine created successfully',
      medicine: medicines[0]
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
    const [medicines] = await db.execute(
      `SELECT m.*, mc.name as category_name, mt.name as type_name, si.quantity_available
       FROM medicines m
       LEFT JOIN medicine_categories mc ON m.category_id = mc.id
       LEFT JOIN medicine_types mt ON m.type_id = mt.id
       LEFT JOIN stock_inventory si ON m.id = si.medicine_id
       WHERE m.id = ? AND m.deleted_at IS NULL`,
      [req.params.id]
    );

    if (medicines.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicines[0]);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, generic_name, category_id, type_id, strength, unit, reorder_level, unit_price, requires_prescription } = req.body;

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (generic_name !== undefined) {
      updates.push('generic_name = ?');
      params.push(generic_name);
    }
    if (category_id) {
      updates.push('category_id = ?');
      params.push(category_id);
    }
    if (type_id) {
      updates.push('type_id = ?');
      params.push(type_id);
    }
    if (strength !== undefined) {
      updates.push('strength = ?');
      params.push(strength);
    }
    if (unit) {
      updates.push('unit = ?');
      params.push(unit);
    }
    if (reorder_level !== undefined) {
      updates.push('reorder_level = ?');
      params.push(reorder_level);
    }
    if (unit_price !== undefined) {
      updates.push('unit_price = ?');
      params.push(unit_price);
    }
    if (requires_prescription !== undefined) {
      updates.push('requires_prescription = ?');
      params.push(requires_prescription ? 1 : 0);
    }

    if (updates.length > 0) {
      params.push(id);
      await db.execute(
        `UPDATE medicines SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        params
      );
    }

    const [medicines] = await db.execute(
      `SELECT m.*, mc.name as category_name, mt.name as type_name, si.quantity_available
       FROM medicines m
       LEFT JOIN medicine_categories mc ON m.category_id = mc.id
       LEFT JOIN medicine_types mt ON m.type_id = mt.id
       LEFT JOIN stock_inventory si ON m.id = si.medicine_id
       WHERE m.id = ?`,
      [id]
    );

    res.json({
      message: 'Medicine updated successfully',
      medicine: medicines[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [inventory] = await db.execute(
      'SELECT quantity_available FROM stock_inventory WHERE medicine_id = ?',
      [id]
    );

    if (inventory.length > 0 && inventory[0].quantity_available > 0) {
      return res.status(422).json({ message: 'Cannot delete medicine with existing stock' });
    }

    await db.execute(
      'UPDATE medicines SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.search = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const [medicines] = await db.execute(
      `SELECT m.*, mc.name as category_name, mt.name as type_name, si.quantity_available
       FROM medicines m
       LEFT JOIN medicine_categories mc ON m.category_id = mc.id
       LEFT JOIN medicine_types mt ON m.type_id = mt.id
       LEFT JOIN stock_inventory si ON m.id = si.medicine_id
       WHERE m.deleted_at IS NULL AND (m.name LIKE ? OR m.generic_name LIKE ?)
       LIMIT 20`,
      [`%${query}%`, `%${query}%`]
    );

    res.json(medicines);
  } catch (error) {
    next(error);
  }
};
