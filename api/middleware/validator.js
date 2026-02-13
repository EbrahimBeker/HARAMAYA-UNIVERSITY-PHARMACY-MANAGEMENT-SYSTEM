const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formatted = {};
    errors.array().forEach(err => {
      if (!formatted[err.path]) formatted[err.path] = [];
      formatted[err.path].push(err.msg);
    });

    return res.status(422).json({
      message: 'Validation failed',
      errors: formatted
    });
  }
  
  next();
};

module.exports = validate;
