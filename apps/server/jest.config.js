module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: String.raw`.*\.spec\.ts$`,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.{ts,js}',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/*.exception.ts',
    '!**/*.interface.ts',
    '!**/*.decorator.ts',
    '!**/*.strategy.ts',
    '!**/main.ts',
    '!**/index.ts',
    '!**/*.seeder.ts',
    '!**/*.bootstrap.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/server/(.*)$': '<rootDir>/$1',
    '^@/modules/(.*)$': '<rootDir>/modules/$1',
    '^@/infrastructure/(.*)$': '<rootDir>/infrastructure/$1',
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
