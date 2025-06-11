// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const convRouter  = require('./routes/conversations');
const authMiddleware = require('./middleware/auth');

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

async function start() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }

  const app = express();
  app.use(cors({ origin: CLIENT_URL, credentials: true }));
  app.use(express.json());

  // Public auth routes
  app.use('/auth', authRouter);

  app.use('/users', usersRouter);
  app.use('/conversations', convRouter);

  // Example protected endpoint
  app.get('/me', authMiddleware, (req, res) => {
    const { passwordHash, ...userData } = req.user.toJSON();
    res.json(userData);
  });

  app.listen(PORT, () =>
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
  );
}

start();
