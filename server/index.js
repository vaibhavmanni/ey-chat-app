// server/index.js
require('dotenv').config();
const http = require('http');
const { createApp } = require('./app');
const db = require('./models');
const setupSockets = require('./socket');

const PORT = process.env.PORT || 4000;

async function start() {
  // 1) Connect to DB
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }

  // 2) Create Express app
  const app = createApp();
  const server = http.createServer(app);

  // 3) Attach Socket.IO
  setupSockets(server);

  // 4) Listen
  server.listen(PORT, () =>
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
  );
}

// Only start if not testing
if (process.env.NODE_ENV !== 'test') start();

// Optional export for tests
module.exports = { start };
