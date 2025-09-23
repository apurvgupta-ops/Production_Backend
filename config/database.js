import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
    try {
        const mongoURI = process.env.NODE_ENV === 'test'
            ? process.env.MONGODB_TEST_URI
            : process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            bufferCommands: false,
            // maxBufferSize: 0,
        };

        const conn = await mongoose.connect(mongoURI, options);

        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        logger.error('MongoDB connection failed:', error);
        logger.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;
