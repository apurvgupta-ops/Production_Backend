import express from 'express';
import logger from '../utils/logger.js';
import { sendSuccessResponse, sendServerErrorResponse } from '../utils/apiHelpers.js';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
    const healthCheck = {
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        }
    };

    try {
        return sendSuccessResponse(res, 'Service is healthy', healthCheck);
    } catch (error) {
        logger.error('Health check failed:', error);
        return sendServerErrorResponse(res, 'Health check failed');
    }
});

// Ready check endpoint
router.get('/ready', (req, res) => {
    const readyCheck = {
        database: 'connected', // Add actual database check here
        services: 'operational'
    };

    return sendSuccessResponse(res, 'Service is ready', readyCheck);
});

// Live check endpoint
router.get('/live', (req, res) => {
    const liveCheck = {
        status: 'alive',
        pid: process.pid
    };

    return sendSuccessResponse(res, 'Service is alive', liveCheck);
});

export default router;