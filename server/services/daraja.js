/**
 * Safaricom Daraja (M-Pesa) — OAuth and Account Balance query helpers.
 *
 * Required env (balance query):
 *   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET
 *   MPESA_SHORTCODE          — Paybill / Till / org shortcode
 *   MPESA_INITIATOR_NAME     — API operator username (sandbox often "apitest")
 *   MPESA_SECURITY_CREDENTIAL — Encrypted initiator password (generate in Daraja portal)
 *   MPESA_PUBLIC_BASE_URL    — Public HTTPS base of THIS API, e.g. https://your-ngrok.app
 *                              Used to build ResultURL / QueueTimeOutURL for callbacks.
 *
 * Optional:
 *   MPESA_ENV=production      — default is sandbox (https://sandbox.safaricom.co.ke)
 */

const SANDBOX_BASE = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_BASE = 'https://api.safaricom.co.ke';

function apiBase() {
  return process.env.MPESA_ENV === 'production' ? PRODUCTION_BASE : SANDBOX_BASE;
}

function publicBaseUrl() {
  const base = (process.env.MPESA_PUBLIC_BASE_URL || process.env.BACKEND_PUBLIC_URL || '').replace(/\/$/, '');
  return base;
}

async function getAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error('Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET');
  }
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const url = `${apiBase()}/oauth/v1/generate?grant_type=client_credentials`;
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Daraja OAuth: non-JSON response (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok || !data.access_token) {
    throw new Error(data.errorMessage || data.error_description || `OAuth failed: ${text.slice(0, 200)}`);
  }
  return data.access_token;
}

/**
 * Initiate Account Balance query (async — result hits ResultURL).
 * @see https://developer.safaricom.co.ke/APIs/AccountBalance
 */
async function initiateAccountBalance(accessToken) {
  const publicBase = publicBaseUrl();
  if (!publicBase) {
    throw new Error(
      'Set MPESA_PUBLIC_BASE_URL (or BACKEND_PUBLIC_URL) to your public API base so Safaricom can POST balance results (use ngrok in dev).'
    );
  }

  const shortcode = process.env.MPESA_SHORTCODE;
  const initiator = process.env.MPESA_INITIATOR_NAME;
  const credential = process.env.MPESA_SECURITY_CREDENTIAL;

  if (!shortcode || !initiator || !credential) {
    throw new Error(
      'Set MPESA_SHORTCODE, MPESA_INITIATOR_NAME, and MPESA_SECURITY_CREDENTIAL for balance queries.'
    );
  }

  const payload = {
    Initiator: initiator,
    SecurityCredential: credential,
    CommandID: 'AccountBalance',
    PartyA: shortcode,
    IdentifierType: '4',
    Remarks: 'Budget Zen balance check',
    QueueTimeOutURL: `${publicBase}/api/mpesa/callback/balance-timeout`,
    ResultURL: `${publicBase}/api/mpesa/callback/balance-result`,
  };

  const url = `${apiBase()}/mpesa/accountbalance/v1/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Account balance API: expected JSON, got (${res.status}): ${text.slice(0, 300)}`);
  }

  if (!res.ok) {
    throw new Error(
      data.errorMessage || data.ResultDesc || data.ResponseDescription || JSON.stringify(data).slice(0, 300)
    );
  }

  const rc = data.ResponseCode ?? data.responseCode;
  if (rc !== undefined && rc !== null && String(rc) !== '0') {
    throw new Error(
      data.ResponseDescription || data.responseDescription || `Daraja rejected balance query (code ${rc})`
    );
  }

  return data;
}

module.exports = {
  apiBase,
  publicBaseUrl,
  getAccessToken,
  initiateAccountBalance,
};
