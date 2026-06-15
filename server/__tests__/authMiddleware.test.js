jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

function buildReq(authHeader) {
  return {
    header: jest.fn((name) => (name === 'Authorization' ? authHeader : undefined)),
  };
}

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('auth middleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('rejects when no Authorization header is present', () => {
    const req = buildReq(undefined);
    const res = buildRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects when the header has no token after the Bearer prefix', () => {
    const req = buildReq('Bearer ');
    const res = buildRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches the decoded payload and calls next for a valid token', () => {
    const req = buildReq('Bearer good-token');
    const res = buildRes();
    const next = jest.fn();
    jwt.verify.mockReturnValue({ id: 'user-1' });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('good-token', 'test-secret');
    expect(req.user).toEqual({ id: 'user-1' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects when token verification throws', () => {
    const req = buildReq('Bearer bad-token');
    const res = buildRes();
    const next = jest.fn();
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });
});
