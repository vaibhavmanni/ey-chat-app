const db = require('./models')

beforeAll(async () => {
  await db.sequelize.drop();
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});
