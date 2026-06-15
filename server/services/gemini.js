const { tryParseJson } = require('../utils/parseJson');

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const NOT_CONFIGURED_MESSAGE =
  'AI insights are not configured. Set GEMINI_API_KEY environment variable to enable this feature.';

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

// Calls the Gemini generateContent endpoint and returns the raw response along
// with the safely-parsed body. Callers own their own HTTP error handling.
async function generateContent({ system, userContent, generationConfig }) {
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: { text: system } },
      contents: [{ role: 'user', parts: [{ text: userContent }] }],
      generationConfig,
    }),
  });

  const rawText = await response.text();
  const parsed = rawText ? tryParseJson(rawText) : { data: {}, ok: true };
  return { response, data: parsed.data, rawText, parseError: !parsed.ok };
}

function extractText(data) {
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

module.exports = {
  GEMINI_ENDPOINT,
  NOT_CONFIGURED_MESSAGE,
  isConfigured,
  generateContent,
  extractText,
};
