const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../config/jwt');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const [users] = await db.execute(
      `SELECT u.*, GROUP_CONCAT(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE (u.username = ? OR u.email = ?) AND u.deleted_at IS NULL
       GROUP BY u.id`,
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account deactivated' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: `${user.first_name} ${user.last_name}`,
        roles: user.roles ? user.roles.split(',') : []
      },
      token,
      token_type: 'Bearer'
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      full_name: `${req.user.first_name} ${req.user.last_name}`,
      roles: req.user.roles
    }
  });
};

exports.logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
