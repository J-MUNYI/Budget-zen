const { getOpenAiApiKey } = require('../utils/openaiKey');

describe('getOpenAiApiKey', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_SECRET_KEY;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns null when no key is configured', () => {
    expect(getOpenAiApiKey()).toBeNull();
  });

  it('reads OPENAI_API_KEY', () => {
    process.env.OPENAI_API_KEY = 'sk-test-123';
    expect(getOpenAiApiKey()).toBe('sk-test-123');
  });

  it('falls back to OPENAI_SECRET_KEY', () => {
    process.env.OPENAI_SECRET_KEY = 'sk-secret-456';
    expect(getOpenAiApiKey()).toBe('sk-secret-456');
  });

  it('prefers OPENAI_API_KEY over OPENAI_SECRET_KEY', () => {
    process.env.OPENAI_API_KEY = 'primary';
    process.env.OPENAI_SECRET_KEY = 'secondary';
    expect(getOpenAiApiKey()).toBe('primary');
  });

  it('trims surrounding whitespace', () => {
    process.env.OPENAI_API_KEY = '   sk-trim   ';
    expect(getOpenAiApiKey()).toBe('sk-trim');
  });

  it('strips surrounding double quotes', () => {
    process.env.OPENAI_API_KEY = '"sk-quoted"';
    expect(getOpenAiApiKey()).toBe('sk-quoted');
  });

  it('strips surrounding single quotes', () => {
    process.env.OPENAI_API_KEY = "'sk-quoted'";
    expect(getOpenAiApiKey()).toBe('sk-quoted');
  });

  it('removes an accidental "Bearer " prefix (case-insensitive)', () => {
    process.env.OPENAI_API_KEY = 'Bearer sk-bearer';
    expect(getOpenAiApiKey()).toBe('sk-bearer');
    process.env.OPENAI_API_KEY = 'bEaReR   sk-bearer2';
    expect(getOpenAiApiKey()).toBe('sk-bearer2');
  });

  it('returns null for an empty/whitespace-only value', () => {
    process.env.OPENAI_API_KEY = '    ';
    expect(getOpenAiApiKey()).toBeNull();
  });
});
