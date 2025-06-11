// server/tests/users.integration.test.js

const request = require('supertest');
const { createApp, db } = require('../app');

const app = createApp();

describe('Users API', () => {
  let token;

  beforeAll(async () => {
    // DB is dropped & re-synced in jest.setup.js

    // 1) Register two users
    await request(app)
      .post('/auth/register')
      .send({
        username: 'user1',
        password: 'Password1!',
        firstName: 'User',
        lastName: 'One',
        email: 'user1@example.com',
      });

    await request(app)
      .post('/auth/register')
      .send({
        username: 'user2',
        password: 'Password1!',
        firstName: 'User',
        lastName: 'Two',
        email: 'user2@example.com',
      });

    // 2) Login as user1 and grab token
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'user1', password: 'Password1!' });

    token = loginRes.body.token;
  });

  it('GET /users returns all users without passwordHash', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);

    res.body.forEach(user => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
      expect(user).not.toHaveProperty('passwordHash');
    });
  });
});
