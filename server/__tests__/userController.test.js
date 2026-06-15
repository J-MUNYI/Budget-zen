jest.mock('../models/User', () => {
  const UserMock = {};
  UserMock.findById = jest.fn();
  UserMock.findByIdAndUpdate = jest.fn();
  return UserMock;
});

const User = require('../models/User');
const userController = require('../controllers/userController');

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function selectResolving(value) {
  return { select: jest.fn().mockResolvedValue(value) };
}

const SAMPLE_USER = {
  _id: 'user-1',
  name: 'Jane',
  email: 'jane@example.com',
  monthlyIncome: 5000,
  mpesaBalance: 100,
};

describe('userController.getMe', () => {
  it('returns the public user when found', async () => {
    User.findById.mockReturnValue(selectResolving(SAMPLE_USER));
    const res = buildRes();

    await userController.getMe({ user: { id: 'user-1' } }, res);

    expect(User.findById).toHaveBeenCalledWith('user-1');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1', name: 'Jane', monthlyIncome: 5000 })
    );
  });

  it('responds 404 when the user does not exist', async () => {
    User.findById.mockReturnValue(selectResolving(null));
    const res = buildRes();

    await userController.getMe({ user: { id: 'missing' } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('responds 500 on error', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('boom')) });
    const res = buildRes();

    await userController.getMe({ user: { id: 'user-1' } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
  });
});

describe('userController.patchMe', () => {
  it('applies valid updates and returns the updated public user', async () => {
    const updated = { ...SAMPLE_USER, monthlyIncome: 8000, mpesaBalance: 250, mpesaPhoneLast4: '5678' };
    User.findByIdAndUpdate.mockReturnValue(selectResolving(updated));
    const res = buildRes();
    const body = { monthlyIncome: '8000', mpesaBalance: 250, mpesaPhoneLast4: 'abc5678xyz', insightsFocus: 'save more' };

    await userController.patchMe({ user: { id: 'user-1' }, body }, res);

    const [, update] = User.findByIdAndUpdate.mock.calls[0];
    expect(update).toEqual({
      $set: {
        monthlyIncome: 8000,
        mpesaBalance: 250,
        mpesaPhoneLast4: '5678',
        insightsFocus: 'save more',
      },
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ monthlyIncome: 8000 }));
  });

  it('allows clearing monthlyIncome with an empty string', async () => {
    User.findByIdAndUpdate.mockReturnValue(selectResolving({ ...SAMPLE_USER, monthlyIncome: null }));
    const res = buildRes();

    await userController.patchMe({ user: { id: 'user-1' }, body: { monthlyIncome: '' } }, res);

    const [, update] = User.findByIdAndUpdate.mock.calls[0];
    expect(update).toEqual({ $set: { monthlyIncome: null } });
  });

  it('rejects a negative monthlyIncome', async () => {
    const res = buildRes();

    await userController.patchMe({ user: { id: 'user-1' }, body: { monthlyIncome: -5 } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'monthlyIncome must be a non-negative number or empty' });
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects a non-numeric mpesaBalance', async () => {
    const res = buildRes();

    await userController.patchMe({ user: { id: 'user-1' }, body: { mpesaBalance: 'oops' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'mpesaBalance must be a non-negative number' });
  });

  it('returns the current user without updating when no fields are provided', async () => {
    User.findById.mockReturnValue(selectResolving(SAMPLE_USER));
    const res = buildRes();

    await userController.patchMe({ user: { id: 'user-1' }, body: {} }, res);

    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(User.findById).toHaveBeenCalledWith('user-1');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1' }));
  });

  it('responds 404 when the updated user is missing', async () => {
    User.findByIdAndUpdate.mockReturnValue(selectResolving(null));
    const res = buildRes();

    await userController.patchMe({ user: { id: 'user-1' }, body: { insightsFocus: 'x' } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });
});
