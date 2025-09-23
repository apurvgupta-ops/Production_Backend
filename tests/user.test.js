import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/user.js';
import errorHandler from '../middlewares/errorHandler.js';
import { sendNotFoundResponse } from '../utils/apiHelpers.js';
import { User } from '../models/index.js';

const app = express();
app.use(express.json());
app.use('/api/v1/users', userRoutes);

// Handle 404 routes
app.use('*', (req, res) => {
    return sendNotFoundResponse(res, `Route ${req.originalUrl} not found`);
});

// Add error handler
app.use(errorHandler);

describe('User API Endpoints', () => {
    // Create test user before tests that need it
    let testUser;

    beforeEach(async () => {
        // Create a test user
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'TestPass123!',
            role: 'user',
            phone: '+1234567890',
            is_active: true
        });
    });
    describe('GET /api/v1/users', () => {
        it('should return paginated users list', async () => {
            const response = await request(app)
                .get('/api/v1/users')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Users retrieved successfully');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('meta');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body.meta).toHaveProperty('pagination');
            expect(response.body.meta.pagination).toHaveProperty('page', 1);
            expect(response.body.meta.pagination).toHaveProperty('limit', 10);
        });

        it('should handle query parameters correctly', async () => {
            const response = await request(app)
                .get('/api/v1/users?page=2&limit=5&role=admin&search=jane')
                .expect(200);

            expect(response.body.meta.pagination.page).toBe(2);
            expect(response.body.meta.pagination.limit).toBe(5);
            expect(response.body.meta.filters.role).toBe('admin');
            expect(response.body.meta.filters.search).toBe('jane');
        });

        it('should return validation error for invalid query parameters', async () => {
            const response = await request(app)
                .get('/api/v1/users?page=0&limit=200')
                .expect(422);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Query validation failed');
            expect(response.body).toHaveProperty('errors');
            expect(Array.isArray(response.body.errors)).toBe(true);
        });
    });

    describe('GET /api/v1/users/:id', () => {
        it('should return a single user', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${testUser.id}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'User retrieved successfully');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('id', testUser.id);
            expect(response.body.data).toHaveProperty('email', testUser.email);
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/v1/users/999')
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'User not found');
        });

        it('should return validation error for invalid user ID', async () => {
            const response = await request(app)
                .get('/api/v1/users/invalid')
                .expect(422);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Parameter validation failed');
            expect(response.body).toHaveProperty('errors');
        });
    });

    describe('POST /api/v1/users', () => {
        it('should create a new user with valid data', async () => {
            const userData = {
                name: 'New Test User',
                email: 'newtest@example.com',
                password: 'TestPass123!',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/v1/users')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'User created successfully');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('name', userData.name);
            expect(response.body.data).toHaveProperty('email', userData.email);
            expect(response.body.data).not.toHaveProperty('password'); // Password should be excluded

            // Verify user was actually created in database
            const createdUser = await User.findOne({ where: { email: userData.email } });
            expect(createdUser).toBeTruthy();
            expect(createdUser.name).toBe(userData.name);
        });

        it('should return validation error for missing required fields', async () => {
            const response = await request(app)
                .post('/api/v1/users')
                .send({})
                .expect(422);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Validation failed');
            expect(response.body).toHaveProperty('errors');
            expect(Array.isArray(response.body.errors)).toBe(true);
        });

        it('should return validation error for invalid email format', async () => {
            const userData = {
                name: 'Test User',
                email: 'invalid-email',
                password: 'TestPass123!'
            };

            const response = await request(app)
                .post('/api/v1/users')
                .send(userData)
                .expect(422);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.errors.some(err => err.field === 'email')).toBe(true);
        });
    });

    describe('PUT /api/v1/users/:id', () => {
        it('should update user with valid data', async () => {
            const updateData = {
                name: 'Updated Name'
            };

            const response = await request(app)
                .put(`/api/v1/users/${testUser.id}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'User updated successfully');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('name', updateData.name);

            // Verify user was actually updated in database
            const updatedUser = await User.findByPk(testUser.id);
            expect(updatedUser.name).toBe(updateData.name);
        });

        it('should return validation error for empty update data', async () => {
            const response = await request(app)
                .put('/api/v1/users/1')
                .send({})
                .expect(422);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Validation failed');
        });
    });

    describe('DELETE /api/v1/users/:id', () => {
        it('should delete user successfully', async () => {
            const response = await request(app)
                .delete(`/api/v1/users/${testUser.id}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'User deleted successfully');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('deletedUser');

            // Verify user was soft deleted in database
            const deletedUser = await User.scope('deleted').findByPk(testUser.id);
            expect(deletedUser.is_deleted).toBe(true);
            expect(deletedUser.deleted_at).toBeTruthy();
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .delete('/api/v1/users/999')
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'User not found');
        });
    });

    describe('GET /api/v1/users/error', () => {
        it('should handle errors properly', async () => {
            const response = await request(app)
                .get('/api/v1/users/error')
                .expect(500);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('timestamp');
        });
    });
});