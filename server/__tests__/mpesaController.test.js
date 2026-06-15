jest.mock('../models/User', () => ({ findByIdAndUpdate: jest.fn() }));
jest.mock('../models/MpesaPendingRequest', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  updateMany: jest.fn(),
}));
jest.mock('../services/daraja', () => ({
  getAccessToken: jest.fn(),
  initiateAccountBalance: jest.fn(),
  publicBaseUrl: jest.fn(),
}));

const User = require('../models/User');
const MpesaPendingRequest = require('../models/MpesaPendingRequest');
const { getAccessToken, initiateAccountBalance, publicBaseUrl } = require('../services/daraja');
const mpesaController = require('../controllers/mpesaController');

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

let consoleErrorSpy;
beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe('mpesaController.testDarajaConnection', () => {
  it('reports success when OAuth succeeds', async () => {
    getAccessToken.mockResolvedValue('tok');
    publicBaseUrl.mockReturnValue('https://public.example.com');
    const res = buildRes();

    await mpesaController.testDarajaConnection({}, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ ok: true, publicBaseConfigured: true })
    );
  });

  it('reports failure with status 400 when OAuth fails', async () => {
    getAccessToken.mockRejectedValue(new Error('oauth failed'));
    const res = buildRes();

    await mpesaController.testDarajaConnection({}, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: 'oauth failed' });
  });
});

describe('mpesaController.requestAccountBalance', () => {
  it('initiates a balance query and records a pending request', async () => {
    getAccessToken.mockResolvedValue('tok');
    initiateAccountBalance.mockResolvedValue({
      OriginatorConversationID: 'orig-1',
      ConversationID: 'conv-1',
      ResponseDescription: 'accepted',
    });
    MpesaPendingRequest.create.mockResolvedValue({});
    const res = buildRes();

    await mpesaController.requestAccountBalance({ user: { id: 'user-1' } }, res);

    expect(MpesaPendingRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', originatorConversationId: 'orig-1', status: 'pending' })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ originatorConversationId: 'orig-1', conversationId: 'conv-1' })
    );
  });

  it('responds 400 when initiation fails', async () => {
    getAccessToken.mockResolvedValue('tok');
    initiateAccountBalance.mockRejectedValue(new Error('balance error'));
    const res = buildRes();

    await mpesaController.requestAccountBalance({ user: { id: 'user-1' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'balance error' });
  });
});

describe('mpesaController.balanceResult', () => {
  it('acknowledges callbacks that carry no Result', async () => {
    const res = buildRes();

    await mpesaController.balanceResult({ body: {} }, res);

    expect(res.json).toHaveBeenCalledWith({ ResultCode: '0', ResultDesc: 'Accepted' });
    expect(MpesaPendingRequest.findOne).not.toHaveBeenCalled();
  });

  it('parses the KES balance and updates the matching user', async () => {
    const save = jest.fn().mockResolvedValue();
    const pending = { userId: 'user-1', save };
    MpesaPendingRequest.findOne.mockResolvedValueOnce(pending);
    User.findByIdAndUpdate.mockResolvedValue({});
    const res = buildRes();

    const body = {
      Result: {
        OriginatorConversationID: 'orig-1',
        ConversationID: 'conv-1',
        ResultParameters: {
          ResultParameter: [
            { Key: 'AccountBalance', Value: 'Working Account|KES|1500.00|1500.00|0.00|0.00' },
          ],
        },
      },
    };

    await mpesaController.balanceResult({ body }, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-1', { $set: { mpesaBalance: 1500 } });
    expect(pending.status).toBe('completed');
    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ ResultCode: '0', ResultDesc: 'Accepted' });
  });

  it('handles a stringified Result payload', async () => {
    MpesaPendingRequest.findOne.mockResolvedValue(null);
    const res = buildRes();

    const body = { Result: JSON.stringify({ OriginatorConversationID: 'orig-9', ResultParameters: {} }) };

    await mpesaController.balanceResult({ body }, res);

    expect(res.json).toHaveBeenCalledWith({ ResultCode: '0', ResultDesc: 'Accepted' });
  });
});

describe('mpesaController.balanceTimeout', () => {
  it('marks pending requests as timed out', async () => {
    MpesaPendingRequest.updateMany.mockResolvedValue({});
    const res = buildRes();

    await mpesaController.balanceTimeout({ body: { Result: { OriginatorConversationID: 'orig-1' } } }, res);

    expect(MpesaPendingRequest.updateMany).toHaveBeenCalledWith(
      { originatorConversationId: 'orig-1', status: 'pending' },
      { $set: { status: 'timeout' } }
    );
    expect(res.json).toHaveBeenCalledWith({ ResultCode: '0', ResultDesc: 'Accepted' });
  });

  it('acknowledges a timeout callback without an originator id', async () => {
    const res = buildRes();

    await mpesaController.balanceTimeout({ body: {} }, res);

    expect(MpesaPendingRequest.updateMany).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ ResultCode: '0', ResultDesc: 'Accepted' });
  });
});
