import logger from './logger.js';

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  const requiredEnvVars = [
    'DB_NAME',
    'DB_USERNAME',
    'JWT_SECRET'
  ];

  const missingVars = [];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  });

  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    logger.error('Please check your .env file and ensure all required variables are set');
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate database dialect
  const validDialects = ['mysql', 'postgres', 'sqlite', 'mariadb', 'mssql'];
  if (process.env.DB_DIALECT && !validDialects.includes(process.env.DB_DIALECT)) {
    throw new Error(`DB_DIALECT must be one of: ${validDialects.join(', ')}`);
  }

  // Validate Google API key format (if provided)
  if (process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.startsWith('AIza')) {
    logger.warn('GOOGLE_API_KEY does not appear to be in the expected format (should start with "AIza")');
  }

  // Validate JWT secret length
  if (process.env.JWT_SECRET.length < 32) {
    logger.warn('JWT_SECRET should be at least 32 characters long for better security');
  }

  logger.info('Environment validation passed');
};

/**
 * Validate SQL query object to prevent injection attacks
 */
const validateSqlQuery = (query) => {
  if (!query || typeof query !== 'object') {
    throw new Error('Query must be a valid object');
  }

  // Check for dangerous SQL patterns
  const dangerousPatterns = [
    /\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|EXEC|EXECUTE)\b/i,
    /;\s*--/,
    /\/\*.*\*\//,
    /\bunion\b.*\bselect\b/i,
    /\bor\b.*\b1\s*=\s*1\b/i
  ];

  const queryString = JSON.stringify(query);

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(queryString)) {
      throw new Error('Query contains potentially dangerous SQL patterns');
    }
  });

  return true;
};

/**
 * Sanitize user input for database queries
 */
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Remove potential script tags and other dangerous content
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
};

/**
 * Validate pagination parameters
 */
const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  if (pageNum < 1) {
    throw new Error('Page number must be greater than 0');
  }

  if (limitNum < 1 || limitNum > 1000) {
    throw new Error('Limit must be between 1 and 1000');
  }

  return { page: pageNum, limit: limitNum };
};

/**
 * Validate date range parameters
 */
const validateDateRange = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && isNaN(start.getTime())) {
    throw new Error('Invalid start date format');
  }

  if (end && isNaN(end.getTime())) {
    throw new Error('Invalid end date format');
  }

  if (start && end && start > end) {
    throw new Error('Start date must be before end date');
  }

  return { startDate: start, endDate: end };
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

export {
  validateEnv,
  validateSqlQuery,
  sanitizeInput,
  validatePagination,
  validateDateRange,
  validateEmail,
  validatePhone
};
