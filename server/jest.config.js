module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node', 
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'], 
};
