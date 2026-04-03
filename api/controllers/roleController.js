const db = require('../config/database');

exports.getRoles = async (req, res) => {
  try {
    const [roles] = await db.execute(
      'SELECT id, name FROM roles ORDER BY name'
    );

    res.json(roles);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};