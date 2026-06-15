jest.mock('../models/Expense', () => {
  const ExpenseMock = jest.fn();
  ExpenseMock.find = jest.fn();
  ExpenseMock.findOneAndUpdate = jest.fn();
  ExpenseMock.findOneAndDelete = jest.fn();
  return ExpenseMock;
});

const Expense = require('../models/Expense');
const expenseController = require('../controllers/expenseController');

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('expenseController.getExpenses', () => {
  it('returns the user expenses sorted by date desc', async () => {
    const expenses = [{ amount: 10 }, { amount: 20 }];
    const sort = jest.fn().mockResolvedValue(expenses);
    Expense.find.mockReturnValue({ sort });
    const res = buildRes();

    await expenseController.getExpenses({ user: { id: 'user-1' } }, res);

    expect(Expense.find).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(sort).toHaveBeenCalledWith({ date: -1 });
    expect(res.json).toHaveBeenCalledWith(expenses);
  });

  it('responds 500 when the query rejects', async () => {
    Expense.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('db down')) });
    const res = buildRes();

    await expenseController.getExpenses({ user: { id: 'user-1' } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'db down' });
  });
});

describe('expenseController.addExpense', () => {
  it('creates an expense and responds 201', async () => {
    const save = jest.fn().mockResolvedValue();
    Expense.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this.save = save;
    });
    const res = buildRes();
    const body = { amount: 50, category: 'Food', description: 'lunch', date: '2024-01-01' };

    await expenseController.addExpense({ user: { id: 'user-1' }, body }, res);

    expect(Expense).toHaveBeenCalledWith({ userId: 'user-1', ...body });
    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ amount: 50, userId: 'user-1' }));
  });

  it('responds 500 when save rejects', async () => {
    Expense.mockImplementation(function () {
      this.save = jest.fn().mockRejectedValue(new Error('validation failed'));
    });
    const res = buildRes();

    await expenseController.addExpense({ user: { id: 'user-1' }, body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'validation failed' });
  });
});

describe('expenseController.updateExpense', () => {
  it('updates and returns the expense', async () => {
    const updated = { _id: 'e1', amount: 99 };
    Expense.findOneAndUpdate.mockResolvedValue(updated);
    const res = buildRes();

    await expenseController.updateExpense(
      { user: { id: 'user-1' }, params: { id: 'e1' }, body: { amount: 99 } },
      res
    );

    expect(Expense.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'e1', userId: 'user-1' },
      { amount: 99 },
      { new: true }
    );
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('responds 404 when the expense is not found', async () => {
    Expense.findOneAndUpdate.mockResolvedValue(null);
    const res = buildRes();

    await expenseController.updateExpense(
      { user: { id: 'user-1' }, params: { id: 'missing' }, body: {} },
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Expense not found' });
  });
});

describe('expenseController.deleteExpense', () => {
  it('deletes an existing expense', async () => {
    Expense.findOneAndDelete.mockResolvedValue({ _id: 'e1' });
    const res = buildRes();

    await expenseController.deleteExpense(
      { user: { id: 'user-1' }, params: { id: 'e1' } },
      res
    );

    expect(Expense.findOneAndDelete).toHaveBeenCalledWith({ _id: 'e1', userId: 'user-1' });
    expect(res.json).toHaveBeenCalledWith({ message: 'Expense deleted' });
  });

  it('responds 404 when nothing was deleted', async () => {
    Expense.findOneAndDelete.mockResolvedValue(null);
    const res = buildRes();

    await expenseController.deleteExpense(
      { user: { id: 'user-1' }, params: { id: 'missing' } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Expense not found' });
  });
});
