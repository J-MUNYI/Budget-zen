// backend/middleware/validation.js

const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Express-validator middleware for income validation
module.exports.validateIncome = [
  require('express-validator').check('monthlyIncome')
    .optional()
    .isNumeric().withMessage('Monthly income must be a number')
    .custom((value) => {
      if (value !== null && value !== '' && parseFloat(value) < 0) {
        throw new Error('Monthly income cannot be negative');
      }
      return true;
    }),
];