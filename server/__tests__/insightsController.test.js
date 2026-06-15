jest.mock('../models/User', () => ({ findById: jest.fn() }));
jest.mock('../models/Expense', () => ({ find: jest.fn() }));

const User = require('../models/User');
const Expense = require('../models/Expense');
const insightsController = require('../controllers/insightsController');

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function geminiResponse({ ok = true, status = 200, body = {} } = {}) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return { ok, status, text: jest.fn().mockResolvedValue(text) };
}

function geminiTextPayload(insight) {
  return { candidates: [{ content: { parts: [{ text: insight }] } }] };
}

const ORIGINAL_ENV = process.env;
let consoleErrorSpy;

beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  consoleErrorSpy.mockRestore();
  process.env = ORIGINAL_ENV;
});

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, GEMINI_API_KEY: 'test-key' };
  global.fetch = jest.fn();
});

function mockUserAndExpenses(user, expenses) {
  User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
  Expense.find.mockReturnValue({
    sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(expenses) }),
  });
}

describe('insightsController.generateInsights', () => {
  const baseReq = { user: { id: 'plainuser' }, body: {} };

  it('responds 503 when GEMINI_API_KEY is not configured', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = buildRes();

    await insightsController.generateInsights(baseReq, res);

    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('responds 404 when the user is not found', async () => {
    mockUserAndExpenses(null, []);
    const res = buildRes();

    await insightsController.generateInsights(baseReq, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('returns the generated insight text on success', async () => {
    mockUserAndExpenses(
      { _id: 'plainuser', name: 'Jane', monthlyIncome: 50000 },
      [{ category: 'Food', amount: 1000, date: new Date() }]
    );
    global.fetch.mockResolvedValue(geminiResponse({ body: geminiTextPayload('Spend less on Food.') }));
    const res = buildRes();

    await insightsController.generateInsights(baseReq, res);

    expect(res.json).toHaveBeenCalledWith({ insight: 'Spend less on Food.' });
  });

  it('responds 502 when Gemini returns non-JSON', async () => {
    mockUserAndExpenses({ _id: 'plainuser' }, []);
    global.fetch.mockResolvedValue(geminiResponse({ body: '<html>nope</html>' }));
    const res = buildRes();

    await insightsController.generateInsights(baseReq, res);

    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('responds 502 on a Gemini HTTP error', async () => {
    mockUserAndExpenses({ _id: 'plainuser' }, []);
    global.fetch.mockResolvedValue(
      geminiResponse({ ok: false, status: 429, body: { error: { message: 'rate limited' } } })
    );
    const res = buildRes();

    await insightsController.generateInsights(baseReq, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'rate limited' }));
  });

  it('responds 502 when Gemini returns no text', async () => {
    mockUserAndExpenses({ _id: 'plainuser' }, []);
    global.fetch.mockResolvedValue(geminiResponse({ body: { candidates: [] } }));
    const res = buildRes();

    await insightsController.generateInsights(baseReq, res);

    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('responds 500 when an unexpected error is thrown', async () => {
    User.findById.mockImplementation(() => { throw new Error('kaboom'); });
    const res = buildRes();

    await insightsController.generateInsights(baseReq, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('insightsController.getSampleInsight', () => {
  it('responds 503 when GEMINI_API_KEY is not configured', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = buildRes();

    await insightsController.getSampleInsight({}, res);

    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('returns sample insight text on success', async () => {
    global.fetch.mockResolvedValue(geminiResponse({ body: geminiTextPayload('Sample tips here.') }));
    const res = buildRes();

    await insightsController.getSampleInsight({}, res);

    expect(res.json).toHaveBeenCalledWith({ insight: 'Sample tips here.' });
  });

  it('falls back to default copy when Gemini returns no text', async () => {
    global.fetch.mockResolvedValue(geminiResponse({ body: {} }));
    const res = buildRes();

    await insightsController.getSampleInsight({}, res);

    expect(res.json).toHaveBeenCalledWith({
      insight: 'Start tracking your expenses to get personalized insights.',
    });
  });
});
