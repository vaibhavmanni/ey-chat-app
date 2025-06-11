const request = require('supertest');
const { createApp, db } = require('../app');

const app = createApp();

describe('Auth API', () => {
  it('register → login → /me flow', async () => {
    // 1) Register
    const regRes = await request(app)
      .post('/auth/register')
      .send({
        username: 'alice',
        password: 'Password1!',
        firstName: 'Alice',
        lastName: 'Wonder',
        email: 'alice@example.com'
      });
    expect(regRes.status).toBe(201);
    expect(regRes.body).toHaveProperty('id');

    // 2) Login
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'alice', password: 'Password1!' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    const token = loginRes.body.token;

    // 3) /me endpoint
    const meRes = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body).toMatchObject({ username: 'alice', email: 'alice@example.com' });
  });
});
