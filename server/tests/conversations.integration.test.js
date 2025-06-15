const request = require('supertest');
const { createApp } = require('../app');
const db = require('../models');

const app = createApp();

describe('Conversations API', () => {
  let alice, bob, tokenAlice;

  beforeAll(async () => {
    // 1) Register two users
    const regAlice = await request(app)
      .post('/auth/register')
      .send({
        username: 'alice',
        password: 'Password1!',
        firstName: 'Alice',
        lastName: 'A',
        email: 'alice@example.com',
      });
    alice = regAlice.body;

    const regBob = await request(app)
      .post('/auth/register')
      .send({
        username: 'bob',
        password: 'Password1!',
        firstName: 'Bob',
        lastName: 'B',
        email: 'bob@example.com',
      });
    bob = regBob.body;

    // 2) Login as Alice
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'alice', password: 'Password1!' });
    tokenAlice = loginRes.body.token;

    // 3) Seed a few messages
    await db.Message.create({
      senderId: alice.id,
      receiverId: bob.id,
      content: 'Hi Bob!',
    });
    await db.Message.create({
      senderId: bob.id,
      receiverId: alice.id,
      content: 'Hello Alice!',
    });
    await db.Message.create({
      senderId: alice.id,
      receiverId: bob.id,
      content: 'How are you?',
    });
  });

  it('GET /conversations/:userId returns last 50 messages in order', async () => {
    const res = await request(app)
      .get(`/conversations/${bob.id}`)
      .set('Authorization', `Bearer ${tokenAlice}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);

    // Chronological: first sent, then received, then sent
    expect(res.body[0].content).toBe('Hi Bob!');
    expect(res.body[1].content).toBe('Hello Alice!');
    expect(res.body[2].content).toBe('How are you?');
  });
});
