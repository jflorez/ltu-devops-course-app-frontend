import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['vue', 'js', 'jsx', 'ts', 'tsx', 'json'],
  transform: {
    '^.+\\.vue$': ['@vue/vue3-jest', {
      tsConfig: 'tsconfig.test.json'
    }],
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.spec.[jt]s?(x)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '<rootDir>/e2e/'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  rootDir: '.',
  roots: ['<rootDir>/src/'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'text-summary', 'json', 'lcov'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ]
};

export default config;
