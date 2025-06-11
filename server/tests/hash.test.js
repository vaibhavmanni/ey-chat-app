const bcrypt = require('bcrypt');

test('bcrypt.hash and compare', async () => {
  const pwd = 'SuperSecret123!';
  const hash = await bcrypt.hash(pwd, 10);
  expect(await bcrypt.compare(pwd, hash)).toBe(true);
});
