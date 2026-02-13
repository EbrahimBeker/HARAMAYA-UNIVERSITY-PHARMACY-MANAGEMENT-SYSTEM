const db = require('../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const [categories] = await db.execute(
      `SELECT mc.*, COUNT(m.id) as medicines_count
       FROM medicine_categories mc
       LEFT JOIN medicines m ON mc.id = m.category_id AND m.deleted_at IS NULL
       WHERE mc.deleted_at IS NULL
       GROUP BY mc.id ORDER BY mc.name`
    );
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const [result] = await db.execute(
      'INSERT INTO medicine_categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    const [category] = await db.execute('SELECT * FROM medicine_categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Category created successfully', category: category[0] });
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
      await db.execute(`UPDATE medicine_categories SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    const [category] = await db.execute('SELECT * FROM medicine_categories WHERE id = ?', [id]);
    res.json({ message: 'Category updated successfully', category: category[0] });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[count]] = await db.execute(
      'SELECT COUNT(*) as total FROM medicines WHERE category_id = ? AND deleted_at IS NULL',
      [id]
    );
    if (count.total > 0) {
      return res.status(422).json({ message: 'Cannot delete category with associated medicines' });
    }
    await db.execute('UPDATE medicine_categories SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
