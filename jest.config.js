// eslint-disable-next-line no-undef
module.exports = {
  rootDir: './src',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@exmpl/(.*)': '<rootDir>/src/$1',
  },
};
