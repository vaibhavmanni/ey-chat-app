// server/index.js
require('dotenv').config();
const fs    = require('fs');
const http  = require('http');
const https = require('https');
const { createApp } = require('./app');
const db      = require('./models');
const setupSockets = require('./socket');

const PORT_HTTP  = process.env.PORT      || 4000;
const PORT_HTTPS = process.env.PORT_HTTPS || 4001;
const KEY_PATH   = process.env.SSL_KEY_PATH  || './ssl/key.pem';
const CERT_PATH  = process.env.SSL_CERT_PATH || './ssl/cert.pem';

async function start() {
  // 1) DB connection
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }

  // 2) Create the Express app
  const app = createApp();

  // 3) Create HTTP & HTTPS servers
  const httpServer  = http.createServer(app);
  const sslOptions  = {
    key:  fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERT_PATH),
  };
  const httpsServer = https.createServer(sslOptions, app);

  // 4) Attach socket.io to the HTTPS server
  setupSockets(httpsServer);

  // 5) Listen
  httpServer.listen(PORT_HTTP, () => {
    console.log(`→ HTTP  listening on http://localhost:${PORT_HTTP}`);
  });
  httpsServer.listen(PORT_HTTPS, () => {
    console.log(`→ HTTPS listening on https://localhost:${PORT_HTTPS}`);
  });
}

// Only start if not testing
if (process.env.NODE_ENV !== 'test') start();

module.exports = { start };
