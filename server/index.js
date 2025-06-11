// server/index.js
const { createApp, db } = require('./app');
const PORT = process.env.PORT || 4000;

async function start() {
  await db.sequelize.authenticate();
  console.log('✅ Database connected');
  const app = createApp();
  app.listen(PORT, () =>
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
  );
}

if (process.env.NODE_ENV !== 'test') start();
