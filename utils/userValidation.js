import Joi from 'joi';

/**
 * User validation schemas
 */

export const createUserSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name must be less than 50 characters',
            'any.required': 'Name is required'
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'any.required': 'Password is required'
        }),

    role: Joi.string()
        .valid('user', 'admin', 'moderator')
        .default('user')
        .messages({
            'any.only': 'Role must be one of: user, admin, moderator'
        }),

    phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Phone number must be a valid format'
        }),

    dateOfBirth: Joi.date()
        .max('now')
        .optional()
        .messages({
            'date.max': 'Date of birth cannot be in the future'
        })
});

export const updateUserSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name must be less than 50 characters'
        }),

    email: Joi.string()
        .email()
        .optional()
        .messages({
            'string.email': 'Email must be a valid email address'
        }),

    phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Phone number must be a valid format'
        }),

    dateOfBirth: Joi.date()
        .max('now')
        .optional()
        .messages({
            'date.max': 'Date of birth cannot be in the future'
        }),

    isActive: Joi.boolean()
        .optional()
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

export const userParamsSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
            'string.pattern.base': 'User ID must be a valid number',
            'any.required': 'User ID is required'
        })
});

export const userQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.min': 'Page must be at least 1'
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit must be at most 100'
        }),

    search: Joi.string()
        .min(1)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Search term must be at least 1 character',
            'string.max': 'Search term must be less than 100 characters'
        }),

    role: Joi.string()
        .valid('user', 'admin', 'moderator')
        .optional()
        .messages({
            'any.only': 'Role must be one of: user, admin, moderator'
        }),

    sortBy: Joi.string()
        .valid('name', 'email', 'createdAt', 'updatedAt')
        .default('createdAt')
        .messages({
            'any.only': 'Sort field must be one of: name, email, createdAt, updatedAt'
        }),

    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .messages({
            'any.only': 'Sort order must be either asc or desc'
        })
});