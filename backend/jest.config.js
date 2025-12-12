module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES6',
        module: 'commonjs',
        moduleResolution: 'node',
        strict: false,
        esModuleInterop: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        typeRoots: ['./src/types', './node_modules/@types']
      }
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/db.ts',
    '!src/migration.ts'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000
};
