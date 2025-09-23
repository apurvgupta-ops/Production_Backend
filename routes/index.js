import express from 'express';
import { sendSuccessResponse } from '../utils/apiHelpers.js';
const router = express.Router();

// Import route modules
import healthRoutes from './health.js';
import userRoutes from './user.js';
// import authRoutes from './auth.js';

// Health routes
router.use('/health', healthRoutes);

// API versioning
router.use('/api/v1', (req, res, next) => {
    // Add API versioning logic here
    next();
});

// Authentication routes
// router.use('/api/v1/auth', authRoutes);

// User routes
router.use('/api/v1/users', userRoutes);

// API documentation redirect
router.get('/api/v1/docs', (req, res) => {
    const apiDocs = {
        version: '1.0.0',
        endpoints: {
            health: {
                '/health': 'Basic health check',
                '/health/ready': 'Readiness probe',
                '/health/live': 'Liveness probe'
            },
            users: {
                'GET /api/v1/users': 'Get all users',
                'GET /api/v1/users/:id': 'Get single user',
                'POST /api/v1/users': 'Create new user',
                'PUT /api/v1/users/:id': 'Update user',
                'DELETE /api/v1/users/:id': 'Delete user',
                'GET /api/v1/users/error': 'Test error handling'
            },
            api: {
                '/api/v1/docs': 'API documentation'
            }
            // Add your endpoints here
        },
        documentation: 'https://your-docs-url.com'
    };

    return sendSuccessResponse(res, 'API Documentation', apiDocs);
});

export default router;