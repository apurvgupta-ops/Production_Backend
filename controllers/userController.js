import {
    sendSuccessResponse,
    sendCreatedResponse,
    sendNotFoundResponse,
    sendBadRequestResponse,
    sendServerErrorResponse
} from '../utils/apiHelpers.js';
import { asyncHandler } from '../utils/apiHelpers.js';
import logger from '../utils/logger.js';
import { User } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Public
 */
export const getUsers = asyncHandler(async (req, res) => {
    // Validated query parameters are now available in req.query
    const { page, limit, search, role, sortBy, sortOrder } = req.query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {
        is_deleted: false
    };

    // Apply search filter
    if (search) {
        whereConditions[Op.or] = [
            {
                name: {
                    [Op.like]: `%${search.toLowerCase()}%`
                }
            },
            {
                email: {
                    [Op.like]: `%${search.toLowerCase()}%`
                }
            }
        ];
    }

    // Apply role filter
    if (role) {
        whereConditions.role = role;
    }

    // Build order array - use proper column names
    const columnMapping = {
        'createdAt': 'created_at',
        'updatedAt': 'updated_at',
        'deletedAt': 'deleted_at'
    };
    const actualSortBy = columnMapping[sortBy] || sortBy;
    const order = [[actualSortBy, sortOrder.toUpperCase()]];

    try {
        // Get users with pagination
        const { count, rows: users } = await User.findAndCountAll({
            where: whereConditions,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order,
            attributes: { exclude: ['password'] }
        });

        const meta = {
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit),
                hasNext: page < Math.ceil(count / limit),
                hasPrev: page > 1
            },
            filters: {
                search: search || null,
                role: role || null,
                sortBy,
                sortOrder
            }
        };

        return sendSuccessResponse(res, 'Users retrieved successfully', users, 200, meta);
    } catch (error) {
        logger.error('Error retrieving users:', error);
        return sendServerErrorResponse(res, 'Failed to retrieve users');
    }
});

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
export const getUser = asyncHandler(async (req, res) => {
    // Validated params are now available in req.params
    const { id } = req.params;

    try {
        const user = await User.findOne({
            where: {
                id: parseInt(id),
                is_deleted: false
            },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return sendNotFoundResponse(res, 'User not found');
        }

        return sendSuccessResponse(res, 'User retrieved successfully', user);
    } catch (error) {
        logger.error('Error retrieving user:', error);
        return sendServerErrorResponse(res, 'Failed to retrieve user');
    }
});

/**
 * @desc    Create new user
 * @route   POST /api/v1/users
 * @access  Private
 */
export const createUser = asyncHandler(async (req, res) => {
    // Validated and sanitized data is now available in req.body
    const { name, email, password, role, phone, date_of_birth } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.scope('withPassword').findOne({
            where: {
                email: email,
                is_deleted: false
            }
        });

        if (existingUser) {
            return sendBadRequestResponse(res, 'User with this email already exists');
        }

        // Create new user
        const newUser = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            phone: phone || null,
            date_of_birth: date_of_birth || null,
            is_active: true
        });

        // Return user without password
        const userResponse = newUser.toSafeJSON();

        logger.info(`New user created: ${newUser.id}`, { email: newUser.email });

        return sendCreatedResponse(res, 'User created successfully', userResponse);
    } catch (error) {
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
                value: err.value
            }));
            return sendBadRequestResponse(res, 'Validation failed', errors);
        }

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return sendBadRequestResponse(res, 'Email already exists');
        }

        logger.error('Error creating user:', error);
        return sendServerErrorResponse(res, 'Failed to create user');
    }
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private
 */
export const updateUser = asyncHandler(async (req, res) => {
    // Validated params and body are now available
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Find user
        const user = await User.findOne({
            where: {
                id: parseInt(id),
                is_deleted: false
            }
        });

        if (!user) {
            return sendNotFoundResponse(res, 'User not found');
        }

        // Check for email conflicts if email is being updated
        if (updateData.email && updateData.email !== user.email) {
            const emailExists = await User.findOne({
                where: {
                    email: updateData.email,
                    id: { [Op.ne]: parseInt(id) },
                    is_deleted: false
                }
            });

            if (emailExists) {
                return sendBadRequestResponse(res, 'Email already exists');
            }
        }

        // Update user
        await user.update(updateData);

        // Get updated user without password
        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] }
        });

        logger.info(`User updated: ${user.id}`, { updatedFields: Object.keys(updateData) });

        return sendSuccessResponse(res, 'User updated successfully', updatedUser);
    } catch (error) {
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
                value: err.value
            }));
            return sendBadRequestResponse(res, 'Validation failed', errors);
        }

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return sendBadRequestResponse(res, 'Email already exists');
        }

        logger.error('Error updating user:', error);
        return sendServerErrorResponse(res, 'Failed to update user');
    }
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private
 */
export const deleteUser = asyncHandler(async (req, res) => {
    // Validated params are now available
    const { id } = req.params;

    try {
        // Find user
        const user = await User.findOne({
            where: {
                id: parseInt(id),
                is_deleted: false
            },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return sendNotFoundResponse(res, 'User not found');
        }

        // Prevent deletion of admin users (example business logic)
        if (user.role === 'admin') {
            return sendBadRequestResponse(res, 'Cannot delete admin users');
        }

        // Soft delete the user
        await user.update({
            is_deleted: true,
            deleted_at: new Date(),
            is_active: false
        });

        logger.info(`User deleted: ${user.id}`, { email: user.email });

        return sendSuccessResponse(res, 'User deleted successfully', {
            deletedUser: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        logger.error('Error deleting user:', error);
        return sendServerErrorResponse(res, 'Failed to delete user');
    }
});

/**
 * @desc    Transfer admin role between users (Managed Transaction Example)
 * @route   POST /api/v1/users/transfer-admin
 * @access  Private
 * @example This demonstrates managed transactions (recommended approach)
 */
export const transferAdminRole = asyncHandler(async (req, res) => {
    // Validated data from request body
    const { fromUserId, toUserId } = req.body;

    try {
        // Use managed transaction - automatically handles commit/rollback
        const result = await withTransaction(async (transaction) => {
            // Find both users within the transaction
            const fromUser = await User.findOne({
                where: {
                    id: parseInt(fromUserId),
                    is_deleted: false
                },
                transaction // Pass transaction to each query
            });

            const toUser = await User.findOne({
                where: {
                    id: parseInt(toUserId),
                    is_deleted: false
                },
                transaction
            });

            // Validate users exist
            if (!fromUser) {
                throw new Error('Source user not found');
            }

            if (!toUser) {
                throw new Error('Target user not found');
            }

            // Validate business rules
            if (fromUser.role !== 'admin') {
                throw new Error('Source user is not an admin');
            }

            if (toUser.role === 'admin') {
                throw new Error('Target user is already an admin');
            }

            if (fromUserId === toUserId) {
                throw new Error('Cannot transfer admin role to the same user');
            }

            // Perform the role transfer within the transaction
            // Step 1: Remove admin role from source user
            await fromUser.update({
                role: 'user',
                updated_at: new Date()
            }, { transaction });

            // Step 2: Grant admin role to target user
            await toUser.update({
                role: 'admin',
                updated_at: new Date()
            }, { transaction });

            // Step 3: Log the activity
            await toUser.update({
                last_login_at: new Date()
            }, { transaction });

            // Return the updated users (transaction will auto-commit)
            return {
                fromUser: await User.findByPk(fromUserId, {
                    attributes: { exclude: ['password'] },
                    transaction
                }),
                toUser: await User.findByPk(toUserId, {
                    attributes: { exclude: ['password'] },
                    transaction
                })
            };
        });

        logger.info(`Admin role transferred from user ${fromUserId} to user ${toUserId}`);

        return sendSuccessResponse(res, 'Admin role transferred successfully', {
            ...result,
            transferredAt: new Date()
        });

    } catch (error) {
        // Handle different error types
        if (error.message.includes('not found')) {
            return sendNotFoundResponse(res, error.message);
        }

        if (error.message.includes('admin') || error.message.includes('Cannot transfer')) {
            return sendBadRequestResponse(res, error.message);
        }

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
                value: err.value
            }));
            return sendBadRequestResponse(res, 'Validation failed during transaction', errors);
        }

        logger.error('Error during admin role transfer transaction:', error);
        return sendServerErrorResponse(res, 'Failed to transfer admin role');
    }
});

/**
 * @desc    Example error handling
 * @route   GET /api/v1/users/error
 * @access  Public
 */
export const triggerError = asyncHandler(async (req, res) => {
    // This will be caught by the global error handler
    throw new Error('This is a test error');
});