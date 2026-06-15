jest.mock('../models/User', () => {
  const UserMock = jest.fn();
  UserMock.findOne = jest.fn();
  return UserMock;
});
jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn() }));

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret';
  jwt.sign.mockReturnValue('signed-token');
});

describe('authController.register', () => {
  it('rejects when a user with a password already exists', async () => {
    User.findOne.mockResolvedValue({ password: 'existing-hash' });
    const res = buildRes();

    await authController.register({ body: { email: 'A@Example.com ', password: 'pw', name: 'A' } }, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'a@example.com' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  it('creates a brand new user and returns a token', async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-pw');
    const save = jest.fn().mockResolvedValue();
    User.mockImplementation(function (payload) {
      Object.assign(this, payload);
      this._id = 'new-user-id';
      this.save = save;
    });
    const res = buildRes();

    await authController.register({ body: { name: 'Jane', email: 'jane@example.com', password: 'secret' } }, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
    expect(save).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalledWith({ id: 'new-user-id' }, 'test-secret', { expiresIn: '7d' });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'signed-token',
        user: expect.objectContaining({ id: 'new-user-id', name: 'Jane', email: 'jane@example.com' }),
      })
    );
  });

  it('adds a password to an existing OAuth account without one', async () => {
    const save = jest.fn().mockResolvedValue();
    const existing = { _id: 'oauth-id', name: 'Existing', email: 'o@example.com', password: undefined, save };
    User.findOne.mockResolvedValue(existing);
    bcrypt.hash.mockResolvedValue('hashed-pw');
    const res = buildRes();

    await authController.register({ body: { name: 'New Name', email: 'o@example.com', password: 'secret' } }, res);

    expect(existing.password).toBe('hashed-pw');
    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'signed-token' }));
  });

  it('responds 500 when an error is thrown', async () => {
    User.findOne.mockRejectedValue(new Error('db error'));
    const res = buildRes();

    await authController.register({ body: { email: 'x@example.com', password: 'pw' } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'db error' });
  });
});

describe('authController.login', () => {
  it('rejects unknown emails as invalid credentials', async () => {
    User.findOne.mockResolvedValue(null);
    const res = buildRes();

    await authController.login({ body: { email: 'nobody@example.com', password: 'pw' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('guides OAuth-only accounts to use their provider', async () => {
    User.findOne.mockResolvedValue({ email: 'g@example.com', googleId: 'g-1', password: null });
    const res = buildRes();

    await authController.login({ body: { email: 'g@example.com', password: 'pw' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toMatch(/Google/);
  });

  it('logs in successfully with a matching bcrypt password', async () => {
    User.findOne.mockResolvedValue({ _id: 'u1', name: 'Jane', email: 'jane@example.com', password: '$2a$10$abcdefghijklmnopqrstuv' });
    bcrypt.compare.mockResolvedValue(true);
    const res = buildRes();

    await authController.login({ body: { email: 'jane@example.com', password: 'secret' } }, res);

    expect(bcrypt.compare).toHaveBeenCalledWith('secret', '$2a$10$abcdefghijklmnopqrstuv');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'signed-token', user: expect.objectContaining({ id: 'u1' }) })
    );
  });

  it('rejects a wrong bcrypt password', async () => {
    User.findOne.mockResolvedValue({ _id: 'u1', password: '$2b$10$abcdefghijklmnopqrstuv' });
    bcrypt.compare.mockResolvedValue(false);
    const res = buildRes();

    await authController.login({ body: { email: 'jane@example.com', password: 'wrong' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('migrates a legacy plaintext password to bcrypt on successful login', async () => {
    const save = jest.fn().mockResolvedValue();
    User.findOne.mockResolvedValue({ _id: 'u1', email: 'jane@example.com', password: 'plain-text', save });
    bcrypt.hash.mockResolvedValue('migrated-hash');
    const res = buildRes();

    await authController.login({ body: { email: 'jane@example.com', password: 'plain-text' } }, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('plain-text', 10);
    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'signed-token' }));
  });
});
