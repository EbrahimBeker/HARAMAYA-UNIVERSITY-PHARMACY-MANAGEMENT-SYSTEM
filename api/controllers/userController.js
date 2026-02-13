const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search, role } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
                      u.phone, u.is_active, u.created_at, GROUP_CONCAT(r.name) as roles
               FROM users u
               LEFT JOIN user_roles ur ON u.id = ur.user_id
               LEFT JOIN roles r ON ur.role_id = r.id
               WHERE u.deleted_at IS NULL`;
    const params = [];

    if (search) {
      sql += ` AND (u.username LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (role) {
      sql += ` AND r.name = ?`;
      params.push(role);
    }

    sql += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [users] = await db.execute(sql, params);

    res.json({
      data: users.map(u => ({
        ...u,
        roles: u.roles ? u.roles.split(',') : []
      }))
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { username, email, password, first_name, last_name, phone, role_ids } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password, first_name, last_name, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [username, email, hashedPassword, first_name, last_name, phone || null]
    );

    const userId = result.insertId;

    if (role_ids && role_ids.length > 0) {
      for (const roleId of role_ids) {
        await connection.execute(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, roleId]
        );
      }
    }

    await connection.commit();

    const [users] = await db.execute(
      `SELECT u.*, GROUP_CONCAT(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [userId]
    );

    const user = users[0];
    delete user.password;

    res.status(201).json({
      message: 'User created successfully',
      user: {
        ...user,
        roles: user.roles ? user.roles.split(',') : []
      }
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
    const [users] = await db.execute(
      `SELECT u.*, GROUP_CONCAT(r.name) as roles, GROUP_CONCAT(r.id) as role_ids
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ? AND u.deleted_at IS NULL
       GROUP BY u.id`,
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    delete user.password;

    res.json({
      ...user,
      roles: user.roles ? user.roles.split(',') : [],
      role_ids: user.role_ids ? user.role_ids.split(',').map(Number) : []
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { username, email, password, first_name, last_name, phone, is_active, role_ids } = req.body;

    const updates = [];
    const params = [];

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }
    if (first_name) {
      updates.push('first_name = ?');
      params.push(first_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      params.push(last_name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length > 0) {
      params.push(id);
      await connection.execute(
        `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        params
      );
    }

    if (role_ids) {
      await connection.execute('DELETE FROM user_roles WHERE user_id = ?', [id]);
      for (const roleId of role_ids) {
        await connection.execute(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [id, roleId]
        );
      }
    }

    await connection.commit();

    const [users] = await db.execute(
      `SELECT u.*, GROUP_CONCAT(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [id]
    );

    const user = users[0];
    delete user.password;

    res.json({
      message: 'User updated successfully',
      user: {
        ...user,
        roles: user.roles ? user.roles.split(',') : []
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    await db.execute(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
