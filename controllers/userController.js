import {
    sendSuccessResponse,
    sendCreatedResponse,
    sendNotFoundResponse,
    sendBadRequestResponse,
    sendServerErrorResponse
} from '../utils/apiHelpers.js';
import { asyncHandler } from '../utils/apiHelpers.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Public
 */
export const getUsers = asyncHandler(async (req, res) => {
    // Validated query parameters are now available in req.query
    const { page, limit, search, role, sortBy, sortOrder } = req.query;
    const skip = (page - 1) * limit;

    // Mock data - replace with actual database query
    let users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: '2023-01-01' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', createdAt: '2023-01-02' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', createdAt: '2023-01-03' }
    ];

    // Apply filters
    if (search) {
        users = users.filter(user =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        );
    }

    if (role) {
        users = users.filter(user => user.role === role);
    }

    // Apply sorting
    users.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        const order = sortOrder === 'asc' ? 1 : -1;
        return aVal > bVal ? order : aVal < bVal ? -order : 0;
    });

    const total = users.length;
    const paginatedUsers = users.slice(skip, skip + limit);

    const meta = {
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        },
        filters: {
            search: search || null,
            role: role || null,
            sortBy,
            sortOrder
        }
    };

    return sendSuccessResponse(res, 'Users retrieved successfully', paginatedUsers, 200, meta);
});

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
export const getUser = asyncHandler(async (req, res) => {
    // Validated params are now available in req.params
    const { id } = req.params;

    // Mock data - replace with actual database query
    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: '2023-01-01' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', createdAt: '2023-01-02' }
    ];

    const user = users.find(u => u.id === parseInt(id));

    if (!user) {
        return sendNotFoundResponse(res, 'User not found');
    }

    return sendSuccessResponse(res, 'User retrieved successfully', user);
});

/**
 * @desc    Create new user
 * @route   POST /api/v1/users
 * @access  Private
 */
export const createUser = asyncHandler(async (req, res) => {
    // Validated and sanitized data is now available in req.body
    const { name, email, password, role, phone, dateOfBirth } = req.body;

    // Check if user already exists (mock check)
    const existingUser = { email: 'existing@example.com' }; // Mock existing user check
    if (existingUser && existingUser.email === email) {
        return sendBadRequestResponse(res, 'User with this email already exists');
    }

    // Mock creation - replace with actual database operation
    const newUser = {
        id: Date.now(),
        name,
        email,
        role: role || 'user',
        phone: phone || null,
        dateOfBirth: dateOfBirth || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Don't include password in response
    delete newUser.password;

    logger.info(`New user created: ${newUser.id}`, { email: newUser.email });

    return sendCreatedResponse(res, 'User created successfully', newUser);
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

    // Mock user lookup
    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: '2023-01-01' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', createdAt: '2023-01-02' }
    ];

    let user = users.find(u => u.id === parseInt(id));

    if (!user) {
        return sendNotFoundResponse(res, 'User not found');
    }

    // Check for email conflicts if email is being updated
    if (updateData.email && updateData.email !== user.email) {
        const emailExists = users.some(u => u.email === updateData.email && u.id !== parseInt(id));
        if (emailExists) {
            return sendBadRequestResponse(res, 'Email already exists');
        }
    }

    // Update user
    user = {
        ...user,
        ...updateData,
        updatedAt: new Date().toISOString()
    };

    logger.info(`User updated: ${user.id}`, { updatedFields: Object.keys(updateData) });

    return sendSuccessResponse(res, 'User updated successfully', user);
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private
 */
export const deleteUser = asyncHandler(async (req, res) => {
    // Validated params are now available
    const { id } = req.params;

    // Mock user lookup
    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
    ];

    const user = users.find(u => u.id === parseInt(id));

    if (!user) {
        return sendNotFoundResponse(res, 'User not found');
    }

    // Prevent deletion of admin users (example business logic)
    if (user.role === 'admin') {
        return sendBadRequestResponse(res, 'Cannot delete admin users');
    }

    // Mock deletion
    logger.info(`User deleted: ${user.id}`, { email: user.email });

    return sendSuccessResponse(res, 'User deleted successfully', {
        deletedUser: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
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