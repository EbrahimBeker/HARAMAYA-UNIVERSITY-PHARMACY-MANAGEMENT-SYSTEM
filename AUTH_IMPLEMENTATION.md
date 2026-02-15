# Authentication & Authorization Implementation Guide

## Overview
This document provides complete implementation details for JWT-based authentication and role-based authorization in the Pharmacy Management System.

---

## 1. JWT CONFIGURATION

### File: `api/config/jwt.js`

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT token
 * @param {Object} payload - User data to encode
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'haramaya-pharmacy'
  });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
```

---

## 2. AUTHENTICATION MIDDLEWARE

### File: `api/middleware/auth.js`

```javascript
const { verifyToken } = require('../config/jwt');
const db = require('../config/database');

/**
 * Authenticate user via JWT token
 * Extracts token from Authorization header, verifies it, and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No token provided. Please login.' 
      });
    }

    // Get token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database with roles
    const [users] = await db.execute(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
              u.is_active, GROUP_CONCAT(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ? AND u.deleted_at IS NULL
       GROUP BY u.id`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        message: 'User not found or has been deleted' 
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        message: 'Account has been deactivated. Contact administrator.' 
      });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: user.roles ? user.roles.split(',') : []
    };

    next();
  } catch (error) {
    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ 
      message: 'Authentication error',
      error: error.message 
    });
  }
};

module.exports = { authenticate };
```

---

## 3. AUTHORIZATION MIDDLEWARE

### File: `api/middleware/authorize.js`

```javascript
/**
 * Role-based authorization middleware
 * Checks if authenticated user has required role(s)
 * @param {...String} allowedRoles - Roles that can access the route
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    // Check if user has any of the allowed roles
    const hasRole = req.user.roles.some(role => 
      allowedRoles.includes(role)
    );

    if (!hasRole) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        userRoles: req.user.roles,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

/**
 * Check if user has specific permission
 * More granular than role-based authorization
 * @param {String} permission - Permission to check
 * @returns {Function} Express middleware
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    // Permission logic based on roles
    const permissions = {
      'manage_users': ['Administrator'],
      'manage_medicines': ['Administrator', 'Inventory Manager'],
      'create_prescription': ['Physician'],
      'dispense_medicine': ['Pharmacist'],
      'register_patient': ['Physician', 'Receptionist'],
      'manage_inventory': ['Inventory Manager'],
      'process_payment': ['Cashier'],
      'view_reports': ['Administrator', 'Inventory Manager', 'Cashier']
    };

    const allowedRoles = permissions[permission] || [];
    const hasPermission = req.user.roles.some(role => 
      allowedRoles.includes(role)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        message: `Permission denied: ${permission}` 
      });
    }

    next();
  };
};

/**
 * Check if user owns the resource or is admin
 * @param {String} resourceUserIdField - Field name containing user ID
 * @returns {Function} Express middleware
 */
const authorizeOwnerOrAdmin = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    // Admins can access any resource
    if (req.user.roles.includes('Administrator')) {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.body[resourceUserIdField] || 
                          req.params[resourceUserIdField] ||
                          req.query[resourceUserIdField];

    if (parseInt(resourceUserId) !== req.user.id) {
      return res.status(403).json({ 
        message: 'You can only access your own resources' 
      });
    }

    next();
  };
};

module.exports = {
  authorize,
  checkPermission,
  authorizeOwnerOrAdmin
};
```

---

## 4. AUTH CONTROLLER

### File: `api/controllers/authController.js`

```javascript
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const db = require('../config/database');

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }

    // Find user with roles
    const [users] = await db.execute(
      `SELECT u.id, u.username, u.email, u.password, u.first_name, 
              u.last_name, u.is_active, GROUP_CONCAT(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.username = ? AND u.deleted_at IS NULL
       GROUP BY u.id`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ 
        message: 'Account has been deactivated' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    // Remove password from response
    delete user.password;

    // Parse roles
    user.roles = user.roles ? user.roles.split(',') : [];

    // Log login activity (optional)
    await db.execute(
      `INSERT INTO audit_log (user_id, action, table_name, ip_address) 
       VALUES (?, 'LOGIN', 'users', ?)`,
      [user.id, req.ip]
    );

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed',
      error: error.message 
    });
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached by authenticate middleware
    res.json({
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get user info',
      error: error.message 
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // Log logout activity
    await db.execute(
      `INSERT INTO audit_log (user_id, action, table_name, ip_address) 
       VALUES (?, 'LOGOUT', 'users', ?)`,
      [req.user.id, req.ip]
    );

    res.json({ 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Logout failed',
      error: error.message 
    });
  }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters' 
      });
    }

    // Get current password hash
    const [users] = await db.execute(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!isValid) {
      return res.status(401).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    // Log password change
    await db.execute(
      `INSERT INTO audit_log (user_id, action, table_name) 
       VALUES (?, 'PASSWORD_CHANGE', 'users')`,
      [req.user.id]
    );

    res.json({ 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to change password',
      error: error.message 
    });
  }
};

module.exports = {
  login,
  getCurrentUser,
  logout,
  changePassword
};
```

---

## 5. AUTH ROUTES

### File: `api/routes/auth.js`

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
```

---

## 6. USAGE EXAMPLES

### Protecting Routes with Authentication Only

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const medicineController = require('../controllers/medicineController');

// All routes require authentication
router.use(authenticate);

router.get('/', medicineController.getAll);
router.get('/:id', medicineController.getOne);

module.exports = router;
```

### Protecting Routes with Role-Based Authorization

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const userController = require('../controllers/userController');

// All routes require authentication
router.use(authenticate);

// Only Administrator can access these routes
router.get('/', authorize('Administrator'), userController.getAll);
router.post('/', authorize('Administrator'), userController.create);
router.put('/:id', authorize('Administrator'), userController.update);
router.delete('/:id', authorize('Administrator'), userController.delete);

module.exports = router;
```

### Multiple Roles Allowed

```javascript
// Physician or Receptionist can register patients
router.post('/patients', 
  authenticate, 
  authorize('Physician', 'Receptionist'), 
  patientController.create
);

// Pharmacist or Inventory Manager can view inventory
router.get('/inventory', 
  authenticate, 
  authorize('Pharmacist', 'Inventory Manager'), 
  inventoryController.getAll
);
```

### Permission-Based Authorization

```javascript
const { checkPermission } = require('../middleware/authorize');

router.post('/medicines', 
  authenticate, 
  checkPermission('manage_medicines'), 
  medicineController.create
);
```

---

## 7. FRONTEND INTEGRATION

### Storing Token

```javascript
// After successful login
const response = await authAPI.login({ username, password });
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

### Axios Interceptor

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Protected Route Component

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.some(role => user.roles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

---

## 8. SECURITY BEST PRACTICES

1. **Use HTTPS in production**
2. **Store JWT_SECRET in environment variables**
3. **Set appropriate token expiration time**
4. **Implement refresh tokens for long sessions**
5. **Hash passwords with bcrypt (salt rounds >= 10)**
6. **Validate all user inputs**
7. **Implement rate limiting on login endpoint**
8. **Log authentication attempts**
9. **Use secure HTTP headers (helmet.js)**
10. **Implement CORS properly**

---

## Document Status
- **Version**: 1.0
- **Date**: February 15, 2026
