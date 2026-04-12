/**
 * Normalize OpenAI API key from env (handles quotes, accidental "Bearer " prefix, whitespace).
 */
function getOpenAiApiKey() {
  let k = process.env.OPENAI_API_KEY || process.env.OPENAI_SECRET_KEY || '';
  k = String(k).trim();
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1).trim();
  }
  if (/^bearer\s+/i.test(k)) {
    k = k.replace(/^bearer\s+/i, '').trim();
  }
  return k || null;
}

module.exports = { getOpenAiApiKey };
