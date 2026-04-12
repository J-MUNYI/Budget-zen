const User = require('../models/User');
const MpesaPendingRequest = require('../models/MpesaPendingRequest');
const { getAccessToken, initiateAccountBalance, publicBaseUrl } = require('../services/daraja');

function normalizeCallbackBody(body) {
  if (!body || typeof body !== 'object') return body;
  if (typeof body.Result === 'string') {
    try {
      return { Result: JSON.parse(body.Result) };
    } catch {
      return body;
    }
  }
  return body;
}

function extractWorkingAccountKes(balanceValue) {
  if (!balanceValue || typeof balanceValue !== 'string') return null;
  const segments = balanceValue.split('&').map((s) => s.trim()).filter(Boolean);
  for (const seg of segments) {
    const parts = seg.split('|').map((s) => s.trim());
    if (parts.length >= 3 && parts[1].toUpperCase() === 'KES') {
      const n = parseFloat(parts[2].replace(/,/g, ''));
      if (!Number.isNaN(n)) return n;
    }
  }
  const first = segments[0];
  if (first) {
    const parts = first.split('|');
    if (parts.length >= 3) {
      const n = parseFloat(parts[2].replace(/,/g, ''));
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

function resultParamsToList(resultParameters) {
  if (!resultParameters) return [];
  const raw = resultParameters.ResultParameter ?? resultParameters.resultParameter;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return [raw];
  return [];
}

exports.testDarajaConnection = async (req, res) => {
  try {
    await getAccessToken();
    res.json({
      ok: true,
      message: 'Daraja OAuth succeeded.',
      sandbox: process.env.MPESA_ENV !== 'production',
      publicBaseConfigured: Boolean(publicBaseUrl()),
    });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
};

exports.requestAccountBalance = async (req, res) => {
  try {
    const token = await getAccessToken();
    const data = await initiateAccountBalance(token);

    const originatorConversationId = data.OriginatorConversationID || data.originatorConversationID || '';
    const conversationId = data.ConversationID || data.conversationID || '';

    await MpesaPendingRequest.create({
      userId: req.user.id,
      originatorConversationId,
      conversationId,
      status: 'pending',
    });

    res.json({
      message:
        'Balance request accepted by Safaricom. When your public Result URL is reachable, your Wallet balance will update automatically.',
      originatorConversationId,
      conversationId,
      responseDescription: data.ResponseDescription || data.responseDescription,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.balanceResult = async (req, res) => {
  try {
    const body = normalizeCallbackBody(req.body);
    const result = body.Result;
    if (!result) {
      return res.status(200).json({ ResultCode: '0', ResultDesc: 'Accepted' });
    }

    const originator = result.OriginatorConversationID || '';
    const conversation = result.ConversationID || '';

    const pending =
      (await MpesaPendingRequest.findOne({ originatorConversationId: originator })) ||
      (await MpesaPendingRequest.findOne({ conversationId: conversation }));

    const list = resultParamsToList(result.ResultParameters);
    const accRow = list.find(
      (p) =>
        p &&
        (p.Key === 'AccountBalance' || p.key === 'AccountBalance' || p.key === 'accountBalance')
    );
    const value = accRow?.Value ?? accRow?.value;
    const amount = extractWorkingAccountKes(value);

    if (pending && amount != null) {
      await User.findByIdAndUpdate(pending.userId, { $set: { mpesaBalance: amount } });
      pending.status = 'completed';
      await pending.save();
    }

    res.json({ ResultCode: '0', ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('Daraja balance-result callback error:', err);
    res.status(200).json({ ResultCode: '0', ResultDesc: 'Accepted' });
  }
};

exports.balanceTimeout = async (req, res) => {
  try {
    const body = normalizeCallbackBody(req.body);
    const result = body.Result;
    const originator = result?.OriginatorConversationID || '';
    if (originator) {
      await MpesaPendingRequest.updateMany(
        { originatorConversationId: originator, status: 'pending' },
        { $set: { status: 'timeout' } }
      );
    }
    res.json({ ResultCode: '0', ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('Daraja balance-timeout callback error:', err);
    res.status(200).json({ ResultCode: '0', ResultDesc: 'Accepted' });
  }
};
