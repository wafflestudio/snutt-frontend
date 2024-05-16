const config = {
  testMatch: ['**.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
  },
};

export default config;
