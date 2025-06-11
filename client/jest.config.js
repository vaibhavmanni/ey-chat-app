export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['@babel/preset-env','@babel/preset-react'] }]
  },
  moduleFileExtensions: ['js','jsx'],
};
