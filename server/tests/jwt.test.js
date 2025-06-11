// server/tests/jwt.test.js
const { generateToken, verifyToken } = require('../helpers/jwt');

test('JWT sign & verify', () => {
  const payload = { id: 'abc-123' };
  const token = generateToken(payload);
  const decoded = verifyToken(token);
  expect(decoded.id).toBe(payload.id);
});
