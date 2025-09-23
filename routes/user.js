import express from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    triggerError
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.js';
import {
    createUserSchema,
    updateUserSchema,
    userParamsSchema,
    userQuerySchema
} from '../utils/userValidation.js';

const router = express.Router();

// Public routes
router.get('/', validateQuery(userQuerySchema), getUsers);
router.get('/error', triggerError); // For testing error handling
router.get('/:id', validateParams(userParamsSchema), getUser);

// Protected routes (uncomment when authentication is implemented)
// router.use(authenticate); // Apply authentication to all routes below

router.post('/', validateBody(createUserSchema), createUser);
router.put('/:id', validateParams(userParamsSchema), validateBody(updateUserSchema), updateUser);
router.delete('/:id', validateParams(userParamsSchema), deleteUser);

// Admin only routes (example)
// router.delete('/admin/:id', authorize('admin'), validateParams(userParamsSchema), deleteUser);

export default router;