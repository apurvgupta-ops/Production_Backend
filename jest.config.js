export default {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/tests/**/*.spec.js'
    ],
    collectCoverageFrom: [
        'controllers/**/*.js',
        'services/**/*.js',
        'utils/**/*.js',
        'middlewares/**/*.js',
        'models/**/*.js',
        '!**/node_modules/**',
        '!tests/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    forceExit: true,
    detectOpenHandles: true
};