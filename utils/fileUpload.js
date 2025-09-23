import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info(`📁 Created uploads directory: ${uploadDir}`);
}

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
        files: 5 // Maximum 5 files
    }
});

// Utility function to clean up old files
export const cleanupOldFiles = (maxAgeInDays = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);

    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            logger.error('Error reading upload directory:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(uploadDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;

                if (stats.mtime < cutoffDate) {
                    fs.unlink(filePath, (err) => {
                        if (!err) {
                            logger.info(`🗑️ Cleaned up old file: ${file}`);
                        }
                    });
                }
            });
        });
    });
};

export default upload;