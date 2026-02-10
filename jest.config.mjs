import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: '.' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  maxWorkers: 1, // tests unitaires qui utilisent la BDD partagent une base en mémoire
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/tests/unit/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'utils/**/*.ts',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!app/layout.tsx', // layout racine Next.js (metadata, wrapper) — exclu de la couverture
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupJest.ts'],
};

export default createJestConfig(config);
