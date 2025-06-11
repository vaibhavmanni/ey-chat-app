const { db } = require('./app');

beforeAll(async () => {
  // ensure test DB is in sync
  await db.sequelize.drop();
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});
