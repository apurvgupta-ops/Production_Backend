import request from 'supertest';
import express from 'express';
import healthRoutes from '../routes/health.js';

const app = express();
app.use('/health', healthRoutes);

describe('Health Check Endpoints', () => {
    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Service is healthy');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body.data).toHaveProperty('uptime');
            expect(response.body.data).toHaveProperty('environment');
            expect(response.body.data).toHaveProperty('version');
            expect(response.body.data).toHaveProperty('memory');
        });
    });

    describe('GET /health/ready', () => {
        it('should return ready status', async () => {
            const response = await request(app)
                .get('/health/ready')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Service is ready');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body.data).toHaveProperty('database', 'connected');
            expect(response.body.data).toHaveProperty('services', 'operational');
        });
    });

    describe('GET /health/live', () => {
        it('should return alive status', async () => {
            const response = await request(app)
                .get('/health/live')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Service is alive');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body.data).toHaveProperty('status', 'alive');
            expect(response.body.data).toHaveProperty('pid');
        });
    });
});