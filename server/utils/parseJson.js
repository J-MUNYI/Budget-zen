// Safely parse a JSON string. Returns { data, ok } so callers can decide how to
// handle malformed responses (throw, return an HTTP error, etc.) without each
// re-implementing the same try/catch around JSON.parse.
function tryParseJson(text) {
  try {
    return { data: JSON.parse(text), ok: true };
  } catch {
    return { data: null, ok: false };
  }
}

module.exports = { tryParseJson };
