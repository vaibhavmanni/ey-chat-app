// server/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const convRouter  = require('./routes/conversations');
const authMiddleware = require('./middleware/auth');

function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(express.json());

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/conversations', convRouter);

  app.get('/me', authMiddleware, (req, res) => {
    const { passwordHash, ...u } = req.user.toJSON();
    res.json(u);
  });

  return app;
}

module.exports = { createApp, db };
