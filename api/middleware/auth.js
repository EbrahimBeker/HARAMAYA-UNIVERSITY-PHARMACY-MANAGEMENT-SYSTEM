const { verifyToken } = require("../config/jwt");
const db = require("../config/database");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const [users] = await db.execute(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.is_active,
              GROUP_CONCAT(DISTINCT r.name) as roles,
              GROUP_CONCAT(DISTINCT rp.permission) as permissions
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       WHERE u.id = ? AND u.deleted_at IS NULL
       GROUP BY u.id`,
      [decoded.userId],
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!users[0].is_active) {
      return res.status(403).json({ message: "Account deactivated" });
    }

    req.user = {
      ...users[0],
      roles: users[0].roles ? users[0].roles.split(",") : [],
      permissions: users[0].permissions ? users[0].permissions.split(",") : [],
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const hasRole = req.user.roles.some((role) => roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

const checkPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const hasPermission = permissions.some((permission) =>
      req.user.permissions.includes(permission),
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: `Access denied. Required permission: ${permissions.join(" or ")}`,
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize, checkPermission };
