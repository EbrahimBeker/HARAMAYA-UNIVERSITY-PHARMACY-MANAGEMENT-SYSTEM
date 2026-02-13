const db = require('../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search, is_active } = req.query;
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM suppliers WHERE deleted_at IS NULL';
    const params = [];
    if (search) {
      sql += ' AND (name LIKE ? OR contact_person LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }
    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    sql += ' ORDER BY name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    const [suppliers] = await db.execute(sql, params);
    res.json({ data: suppliers });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, contact_person, email, phone, address } = req.body;
    const [result] = await db.execute(
      'INSERT INTO suppliers (name, contact_person, email, phone, address, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [name, contact_person || null, email || null, phone, address || null]
    );
    const [supplier] = await db.execute('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Supplier created successfully', supplier: supplier[0] });
  } catch (error) {
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const [suppliers] = await db.execute(
      'SELECT * FROM suppliers WHERE id = ? AND deleted_at IS NULL',
      [req.params.id]
    );
    if (suppliers.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(suppliers[0]);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contact_person, email, phone, address, is_active } = req.body;
    const updates = [];
    const params = [];
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (contact_person !== undefined) {
      updates.push('contact_person = ?');
      params.push(contact_person);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (phone) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }
    if (updates.length > 0) {
      params.push(id);
      await db.execute(`UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    const [supplier] = await db.execute('SELECT * FROM suppliers WHERE id = ?', [id]);
    res.json({ message: 'Supplier updated successfully', supplier: supplier[0] });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await db.execute('UPDATE suppliers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
};
