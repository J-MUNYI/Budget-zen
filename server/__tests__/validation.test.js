jest.mock('express-validator', () => {
  const makeChain = () => {
    const chain = {};
    for (const method of ['optional', 'isNumeric', 'withMessage', 'custom']) {
      chain[method] = jest.fn(() => chain);
    }
    return chain;
  };
  return { validationResult: jest.fn(), check: jest.fn(() => makeChain()) };
});

const { validationResult } = require('express-validator');
const validate = require('../middleware/validation');

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('validation middleware', () => {
  it('calls next when there are no validation errors', () => {
    validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
    const res = buildRes();
    const next = jest.fn();

    validate({}, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds 400 with the error array when validation fails', () => {
    const errors = [{ msg: 'Invalid', param: 'email' }];
    validationResult.mockReturnValue({ isEmpty: () => false, array: () => errors });
    const res = buildRes();
    const next = jest.fn();

    validate({}, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors });
    expect(next).not.toHaveBeenCalled();
  });
});
