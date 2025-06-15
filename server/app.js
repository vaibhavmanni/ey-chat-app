require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const convRouter = require('./routes/conversations');
const authMiddleware = require('./middleware/auth');

function createApp() {
  const app = express();

  const corsOptions = {
    origin: process.env.CLIENT_URL,   
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  };
  app.use(cors(corsOptions));   

  app.use(helmet());
  app.use(helmet.hsts({
    maxAge: 31536000,  // 1 year
    includeSubDomains: true,
    preload: true
  }));

  app.use(express.json());

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/conversations', convRouter);

  app.get('/me', authMiddleware, (req, res) => {
    const { passwordHash, ...user } = req.user.toJSON();
    res.json(user);
  });

  return app;
}

module.exports = { createApp };
