import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: '.' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  maxWorkers: 1, // BDD en mémoire partagée
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '<rootDir>/tests/integration/**/*.integration.test.ts',
    '<rootDir>/tests/integration/**/*.integration.test.tsx',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setupJest.ts'],
};

export default createJestConfig(config);
