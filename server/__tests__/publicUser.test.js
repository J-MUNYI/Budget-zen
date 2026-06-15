const { toPublicUser } = require('../utils/publicUser');

describe('toPublicUser', () => {
  it('returns null for falsy input', () => {
    expect(toPublicUser(null)).toBeNull();
    expect(toPublicUser(undefined)).toBeNull();
  });

  it('maps a plain object using _id', () => {
    const result = toPublicUser({
      _id: 'abc123',
      name: 'Jane',
      email: 'jane@example.com',
      monthlyIncome: 5000,
      mpesaBalance: 250,
      mpesaPhoneLast4: '1234',
      insightsFocus: 'savings',
    });

    expect(result).toEqual({
      id: 'abc123',
      name: 'Jane',
      email: 'jane@example.com',
      monthlyIncome: 5000,
      mpesaBalance: 250,
      mpesaPhoneLast4: '1234',
      insightsFocus: 'savings',
    });
  });

  it('prefers toObject() output when available (e.g. mongoose docs)', () => {
    const doc = {
      toObject: () => ({ _id: 'doc-id', name: 'Doc', email: 'doc@example.com' }),
      // raw fields should be ignored in favor of toObject()
      name: 'IGNORED',
    };
    const result = toPublicUser(doc);
    expect(result.id).toBe('doc-id');
    expect(result.name).toBe('Doc');
  });

  it('falls back to id when _id is absent', () => {
    expect(toPublicUser({ id: 42 }).id).toBe('42');
  });

  it('coerces a numeric-string monthlyIncome to a number', () => {
    expect(toPublicUser({ _id: '1', monthlyIncome: '7500' }).monthlyIncome).toBe(7500);
  });

  it('treats undefined and null monthlyIncome as null', () => {
    expect(toPublicUser({ _id: '1' }).monthlyIncome).toBeNull();
    expect(toPublicUser({ _id: '1', monthlyIncome: null }).monthlyIncome).toBeNull();
  });

  it('keeps a zero monthlyIncome as 0 (not null)', () => {
    expect(toPublicUser({ _id: '1', monthlyIncome: 0 }).monthlyIncome).toBe(0);
  });

  it('defaults mpesaBalance to 0 when missing or null', () => {
    expect(toPublicUser({ _id: '1' }).mpesaBalance).toBe(0);
    expect(toPublicUser({ _id: '1', mpesaBalance: null }).mpesaBalance).toBe(0);
  });

  it('coerces a numeric-string mpesaBalance to a number', () => {
    expect(toPublicUser({ _id: '1', mpesaBalance: '100' }).mpesaBalance).toBe(100);
  });

  it('defaults string fields to empty strings', () => {
    const result = toPublicUser({ _id: '1' });
    expect(result.mpesaPhoneLast4).toBe('');
    expect(result.insightsFocus).toBe('');
  });
});
