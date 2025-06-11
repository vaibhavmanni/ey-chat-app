'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    // enable uuid_generate_v4()
    return qi.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  },
  down: async (qi, Sequelize) => {
    return qi.sequelize.query('DROP EXTENSION IF EXISTS "uuid-ossp";');
  }
};
