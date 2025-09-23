import dotenv from 'dotenv';
import { sequelize } from '../models/index.js';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(async () => {
    // Connect to test database and sync models
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true }); // This will drop tables and recreate them
        console.log('Test database connected and synchronized');
    } catch (error) {
        console.error('Unable to connect to test database:', error);
        throw error;
    }
});

afterAll(async () => {
    // Cleanup after all tests
    try {
        await sequelize.close();
        console.log('Test database connection closed');
    } catch (error) {
        console.error('Error closing test database:', error);
    }
});

beforeEach(async () => {
    // Clean database before each test
    try {
        await sequelize.sync({ force: true });
    } catch (error) {
        console.error('Error cleaning test database:', error);
    }
});