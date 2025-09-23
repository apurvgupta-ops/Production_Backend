# Standardized API Response Implementation Guide

This document explains how standardized success and error responses have been implemented throughout the codebase.

## 📋 Response Format

### Success Response Format
```json
{
  \"success\": true,
  \"message\": \"Operation completed successfully\",
  \"data\": { /* Response data */ },
  \"statusCode\": 200,
  \"timestamp\": \"2023-12-01T10:00:00.000Z\",
  \"meta\": { /* Optional metadata like pagination */ }
}
```

### Error Response Format
```json
{
  \"success\": false,
  \"message\": \"Error description\",
  \"data\": null,
  \"statusCode\": 400,
  \"timestamp\": \"2023-12-01T10:00:00.000Z\",
  \"errors\": [ /* Optional detailed errors */ ]
}
```

## 🛠️ Available Response Functions

### Success Responses

```javascript
import { 
    sendSuccessResponse,
    sendCreatedResponse
} from '../utils/apiHelpers.js';

// Generic success response (200)
sendSuccessResponse(res, 'Data retrieved successfully', data, 200, meta);

// Created response (201)
sendCreatedResponse(res, 'User created successfully', newUser, meta);
```

### Error Responses

```javascript
import { 
    sendErrorResponse,
    sendBadRequestResponse,
    sendUnauthorizedResponse,
    sendForbiddenResponse,
    sendNotFoundResponse,
    sendConflictResponse,
    sendValidationErrorResponse,
    sendServerErrorResponse
} from '../utils/apiHelpers.js';

// Generic error response
sendErrorResponse(res, 'Something went wrong', 500, data, errors);

// Bad request (400)
sendBadRequestResponse(res, 'Invalid request data', errors);

// Unauthorized (401)
sendUnauthorizedResponse(res, 'Invalid token');

// Forbidden (403)
sendForbiddenResponse(res, 'Access denied');

// Not found (404)
sendNotFoundResponse(res, 'User not found');

// Conflict (409)
sendConflictResponse(res, 'Email already exists');

// Validation error (422)
sendValidationErrorResponse(res, 'Validation failed', validationErrors);

// Server error (500)
sendServerErrorResponse(res, 'Database connection failed');
```

## 📁 Implementation Examples

### 1. Controller Implementation

```javascript
// controllers/userController.js
import { 
    sendSuccessResponse, 
    sendCreatedResponse, 
    sendNotFoundResponse, 
    sendBadRequestResponse,
    asyncHandler
} from '../utils/apiHelpers.js';

export const getUsers = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    
    const users = await User.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
    
    const total = await User.countDocuments();
    
    const meta = {
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
    
    return sendSuccessResponse(res, 'Users retrieved successfully', users, 200, meta);
});

export const createUser = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return sendBadRequestResponse(res, 'Email already exists');
    }
    
    const user = await User.create({ name, email });
    
    return sendCreatedResponse(res, 'User created successfully', user);
});
```

### 2. Middleware Implementation

```javascript
// middlewares/auth.js
import { sendUnauthorizedResponse, sendForbiddenResponse } from '../utils/apiHelpers.js';

export const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return sendUnauthorizedResponse(res, 'Access denied. No token provided.');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return sendUnauthorizedResponse(res, 'Invalid token');
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendForbiddenResponse(res, 'Access denied. Insufficient permissions.');
        }
        next();
    };
};
```

### 3. Error Handler Implementation

```javascript
// middlewares/errorHandler.js
import { sendErrorResponse } from '../utils/apiHelpers.js';

const errorHandler = (err, req, res, next) => {
    let message = err.message || 'Server Error';
    let statusCode = err.statusCode || 500;
    let errors = null;
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        message = 'Validation failed';
        statusCode = 422;
        errors = Object.values(err.errors).map(val => val.message);
    }
    
    if (err.code === 11000) {
        message = 'Duplicate field value entered';
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        errors = [`${field} already exists`];
    }
    
    const responseData = process.env.NODE_ENV === 'development' ? {
        stack: err.stack,
        error: err
    } : null;
    
    return sendErrorResponse(res, message, statusCode, responseData, errors);
};
```

### 4. Validation Middleware

```javascript
// middlewares/validation.js
import { sendValidationErrorResponse } from '../utils/apiHelpers.js';

export const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { 
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        });
        
        if (error) {
            const errorMessages = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            
            return sendValidationErrorResponse(res, 'Validation failed', errorMessages);
        }
        
        req.body = value;
        next();
    };
};
```

## 🎯 Best Practices

### 1. Always Use Response Helpers
```javascript
// ❌ Don't do this
res.status(200).json({
    success: true,
    message: 'Success',
    data: result
});

// ✅ Do this instead
sendSuccessResponse(res, 'Operation successful', result);
```

### 2. Include Meaningful Messages
```javascript
// ❌ Generic messages
sendErrorResponse(res, 'Error', 400);

// ✅ Specific, helpful messages
sendBadRequestResponse(res, 'Email format is invalid');
```

### 3. Use Appropriate Status Codes
```javascript
// ✅ Resource created
sendCreatedResponse(res, 'User created successfully', newUser);

// ✅ Resource not found
sendNotFoundResponse(res, 'User with ID 123 not found');

// ✅ Validation failed
sendValidationErrorResponse(res, 'Validation failed', errors);
```

### 4. Include Metadata for Lists
```javascript
const meta = {
    pagination: {
        page: 1,
        limit: 10,
        total: 150,
        pages: 15,
        hasNext: true,
        hasPrev: false
    },
    filters: {
        search: 'john',
        role: 'admin'
    }
};

sendSuccessResponse(res, 'Users retrieved successfully', users, 200, meta);
```

### 5. Handle Async Errors with asyncHandler
```javascript
// ✅ Use asyncHandler to automatically catch errors
export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return sendNotFoundResponse(res, 'User not found');
    }
    
    return sendSuccessResponse(res, 'User retrieved successfully', user);
});
```

## 📊 HTTP Status Codes Used

| Code | Response Function             | Usage                   |
| ---- | ----------------------------- | ----------------------- |
| 200  | `sendSuccessResponse`         | General success         |
| 201  | `sendCreatedResponse`         | Resource created        |
| 400  | `sendBadRequestResponse`      | Invalid request         |
| 401  | `sendUnauthorizedResponse`    | Authentication required |
| 403  | `sendForbiddenResponse`       | Access denied           |
| 404  | `sendNotFoundResponse`        | Resource not found      |
| 409  | `sendConflictResponse`        | Resource conflict       |
| 422  | `sendValidationErrorResponse` | Validation failed       |
| 500  | `sendServerErrorResponse`     | Server error            |

## 🧪 Testing

All response formats are tested in the test suite:

```javascript
// tests/user.test.js
it('should return standardized success response', async () => {
    const response = await request(app)
        .get('/api/v1/users')
        .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('timestamp');
});

it('should return standardized error response', async () => {
    const response = await request(app)
        .get('/api/v1/users/invalid')
        .expect(422);
    
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('errors');
});
```

## 🔄 Migration Guide

To update existing endpoints:

1. **Replace manual response construction:**
   ```javascript
   // Before
   res.status(200).json({ success: true, data: result });
   
   // After
   return sendSuccessResponse(res, 'Data retrieved successfully', result);
   ```

2. **Update error handling:**
   ```javascript
   // Before
   res.status(404).json({ error: 'Not found' });
   
   // After
   return sendNotFoundResponse(res, 'Resource not found');
   ```

3. **Add validation responses:**
   ```javascript
   // Before
   if (error) {
     return res.status(400).json({ error: 'Validation failed' });
   }
   
   // After
   if (error) {
     return sendValidationErrorResponse(res, 'Validation failed', errors);
   }
   ```

This standardized approach ensures consistency across all API endpoints and makes it easier for frontend developers to handle responses predictably.