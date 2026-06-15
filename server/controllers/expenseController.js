const Expense = require('../models/Expense');
const { asyncHandler } = require('../utils/asyncHandler');

exports.getExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(expenses);
});

exports.addExpense = asyncHandler(async (req, res) => {
  const { amount, category, description, date } = req.body;
  const expense = new Expense({
    userId: req.user.id,
    amount,
    category,
    description,
    date
  });
  await expense.save();
  res.status(201).json(expense);
});

exports.updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
});

exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json({ message: 'Expense deleted' });
});
