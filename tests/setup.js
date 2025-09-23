import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI;

// Global test setup
beforeAll(async () => {
    // Database setup for tests
});

afterAll(async () => {
    // Cleanup after tests
});

beforeEach(() => {
    // Reset state before each test
});