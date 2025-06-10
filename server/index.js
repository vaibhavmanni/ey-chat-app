require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');   // loads models/index.js

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

async function start() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  }

  const app = express();
  app.use(cors({ origin: CLIENT_URL, credentials: true }));
  app.use(express.json());

  // Health check
  app.get('/', (_req, res) => res.send('Chat API running 🚀'));

  // TODO: mount your /auth, /users, /messages routers here

  app.listen(PORT, () =>
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
  );
}

start();
