const daraja = require('../services/daraja');

function mockResponse({ ok = true, status = 200, body = '' } = {}) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return { ok, status, text: jest.fn().mockResolvedValue(text) };
}

describe('daraja service', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.MPESA_ENV;
    delete process.env.MPESA_PUBLIC_BASE_URL;
    delete process.env.BACKEND_PUBLIC_URL;
    delete process.env.MPESA_CONSUMER_KEY;
    delete process.env.MPESA_CONSUMER_SECRET;
    delete process.env.MPESA_SHORTCODE;
    delete process.env.MPESA_INITIATOR_NAME;
    delete process.env.MPESA_SECURITY_CREDENTIAL;
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    delete global.fetch;
  });

  describe('apiBase', () => {
    it('defaults to the sandbox base url', () => {
      expect(daraja.apiBase()).toBe('https://sandbox.safaricom.co.ke');
    });

    it('uses the production base url when MPESA_ENV=production', () => {
      process.env.MPESA_ENV = 'production';
      expect(daraja.apiBase()).toBe('https://api.safaricom.co.ke');
    });
  });

  describe('publicBaseUrl', () => {
    it('returns an empty string when nothing is configured', () => {
      expect(daraja.publicBaseUrl()).toBe('');
    });

    it('strips a trailing slash', () => {
      process.env.MPESA_PUBLIC_BASE_URL = 'https://example.com/';
      expect(daraja.publicBaseUrl()).toBe('https://example.com');
    });

    it('falls back to BACKEND_PUBLIC_URL', () => {
      process.env.BACKEND_PUBLIC_URL = 'https://fallback.example.com';
      expect(daraja.publicBaseUrl()).toBe('https://fallback.example.com');
    });
  });

  describe('getAccessToken', () => {
    it('throws when consumer credentials are missing', async () => {
      await expect(daraja.getAccessToken()).rejects.toThrow(
        'Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET'
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns the access token and sends Basic auth on success', async () => {
      process.env.MPESA_CONSUMER_KEY = 'key';
      process.env.MPESA_CONSUMER_SECRET = 'secret';
      global.fetch.mockResolvedValue(
        mockResponse({ body: { access_token: 'tok-123' } })
      );

      const token = await daraja.getAccessToken();
      expect(token).toBe('tok-123');

      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toBe(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      );
      const expectedAuth = Buffer.from('key:secret').toString('base64');
      expect(options.headers.Authorization).toBe(`Basic ${expectedAuth}`);
    });

    it('throws on a non-JSON response', async () => {
      process.env.MPESA_CONSUMER_KEY = 'key';
      process.env.MPESA_CONSUMER_SECRET = 'secret';
      global.fetch.mockResolvedValue(
        mockResponse({ ok: false, status: 500, body: '<html>oops</html>' })
      );
      await expect(daraja.getAccessToken()).rejects.toThrow('non-JSON response');
    });

    it('throws the API error message when the token is missing', async () => {
      process.env.MPESA_CONSUMER_KEY = 'key';
      process.env.MPESA_CONSUMER_SECRET = 'secret';
      global.fetch.mockResolvedValue(
        mockResponse({ ok: false, status: 400, body: { errorMessage: 'bad creds' } })
      );
      await expect(daraja.getAccessToken()).rejects.toThrow('bad creds');
    });
  });

  describe('initiateAccountBalance', () => {
    function setBalanceEnv() {
      process.env.MPESA_PUBLIC_BASE_URL = 'https://public.example.com';
      process.env.MPESA_SHORTCODE = '600000';
      process.env.MPESA_INITIATOR_NAME = 'apitest';
      process.env.MPESA_SECURITY_CREDENTIAL = 'cred';
    }

    it('throws when the public base url is missing', async () => {
      await expect(daraja.initiateAccountBalance('tok')).rejects.toThrow(
        /MPESA_PUBLIC_BASE_URL/
      );
    });

    it('throws when balance config is incomplete', async () => {
      process.env.MPESA_PUBLIC_BASE_URL = 'https://public.example.com';
      await expect(daraja.initiateAccountBalance('tok')).rejects.toThrow(
        /MPESA_SHORTCODE/
      );
    });

    it('posts the balance query and returns data on success', async () => {
      setBalanceEnv();
      global.fetch.mockResolvedValue(
        mockResponse({ body: { ResponseCode: '0', ResponseDescription: 'ok' } })
      );

      const data = await daraja.initiateAccountBalance('tok-abc');
      expect(data.ResponseCode).toBe('0');

      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toBe(
        'https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query'
      );
      expect(options.method).toBe('POST');
      expect(options.headers.Authorization).toBe('Bearer tok-abc');
      const payload = JSON.parse(options.body);
      expect(payload.CommandID).toBe('AccountBalance');
      expect(payload.ResultURL).toBe(
        'https://public.example.com/api/mpesa/callback/balance-result'
      );
    });

    it('throws when Daraja returns a non-zero response code', async () => {
      setBalanceEnv();
      global.fetch.mockResolvedValue(
        mockResponse({
          body: { ResponseCode: '1', ResponseDescription: 'rejected' },
        })
      );
      await expect(daraja.initiateAccountBalance('tok')).rejects.toThrow('rejected');
    });

    it('throws on an HTTP error response', async () => {
      setBalanceEnv();
      global.fetch.mockResolvedValue(
        mockResponse({ ok: false, status: 500, body: { errorMessage: 'server boom' } })
      );
      await expect(daraja.initiateAccountBalance('tok')).rejects.toThrow('server boom');
    });
  });
});
