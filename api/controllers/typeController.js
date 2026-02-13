const db = require('../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const [types] = await db.execute(
      `SELECT mt.*, COUNT(m.id) as medicines_count
       FROM medicine_types mt
       LEFT JOIN medicines m ON mt.id = m.type_id AND m.deleted_at IS NULL
       WHERE mt.deleted_at IS NULL
       GROUP BY mt.id ORDER BY mt.name`
    );
    res.json(types);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const [result] = await db.execute(
      'INSERT INTO medicine_types (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    const [type] = await db.execute('SELECT * FROM medicine_types WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Type created successfully', type: type[0] });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updates = [];
    const params = [];
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (updates.length > 0) {
      params.push(id);
      await db.execute(`UPDATE medicine_types SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    const [type] = await db.execute('SELECT * FROM medicine_types WHERE id = ?', [id]);
    res.json({ message: 'Type updated successfully', type: type[0] });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[count]] = await db.execute(
      'SELECT COUNT(*) as total FROM medicines WHERE type_id = ? AND deleted_at IS NULL',
      [id]
    );
    if (count.total > 0) {
      return res.status(422).json({ message: 'Cannot delete type with associated medicines' });
    }
    await db.execute('UPDATE medicine_types SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    res.json({ message: 'Type deleted successfully' });
  } catch (error) {
    next(error);
  }
};
