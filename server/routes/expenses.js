const express = require('express');
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validation');

const router = express.Router();

router.get('/', auth, getExpenses);
router.post('/', auth, [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').notEmpty().withMessage('Date is required'),
], validate, addExpense);
router.put('/:id', auth, updateExpense);
router.delete('/:id', auth, deleteExpense);

module.exports = router;