# Quick Start Guide - SQL/Sequelize Backend

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- Database (MySQL, PostgreSQL, SQLite, etc.)
- Git

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd backend_folder_structure

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 3. Database Setup

#### For MySQL (Recommended for Production)
```bash
# Install MySQL driver
npm install mysql2

# Update .env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=backend_dev
DB_USERNAME=root
DB_PASSWORD=your_password
```

#### For PostgreSQL
```bash
# Install PostgreSQL driver
npm install pg pg-hstore

# Update .env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=backend_dev
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

#### For SQLite (Development/Testing)
```bash
# Install SQLite driver
npm install sqlite3

# Update .env
DB_DIALECT=sqlite
DB_NAME=database.sqlite
DB_USERNAME=
DB_PASSWORD=
```

### 4. Initialize Database

```bash
# Create database (MySQL/PostgreSQL only)
npm run db:create

# Run migrations
npm run migrate

# Seed with sample data
npm run seed
```

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start

# With file watching
npm run watch
```

### 6. Test the API

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📊 API Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Users
- `GET /api/v1/users` - Get all users (with pagination)
- `GET /api/v1/users/:id` - Get single user
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (soft delete)

### API Documentation
- `GET /api/v1/docs` - API documentation

## 🧪 Testing Examples

```bash
# Health check
curl http://localhost:5000/health

# Get users with pagination
curl \"http://localhost:5000/api/v1/users?page=1&limit=10\"

# Create user
curl -X POST http://localhost:5000/api/v1/users \\n  -H \"Content-Type: application/json\" \\n  -d '{
    \"name\": \"John Doe\",
    \"email\": \"john@example.com\",
    \"password\": \"SecurePass123!\",
    \"role\": \"user\"
  }'

# Get specific user
curl http://localhost:5000/api/v1/users/1
```

## 🔧 Common Commands

### Database Operations
```bash
# Create new migration
npx sequelize-cli migration:generate --name add-new-feature

# Create new model
npx sequelize-cli model:generate --name Product --attributes name:string,price:decimal

# Create new seeder
npx sequelize-cli seed:generate --name demo-products

# Undo last migration
npm run migrate:undo

# Drop and recreate database
npm run db:drop
npm run db:create
npm run migrate
npm run seed
```

### Development
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Clean generated files
npm run clean
```

## 📁 Project Structure

```
.
├── config/
│   ├── database.js          # Sequelize configuration
│   └── config.js           # CLI configuration
├── controllers/
│   └── userController.js   # User route handlers
├── database/
│   ├── migrations/         # Database migrations
│   └── seeders/           # Database seeders
├── middlewares/
│   ├── auth.js            # Authentication middleware
│   ├── errorHandler.js    # Error handling
│   └── validation.js      # Request validation
├── models/
│   ├── BaseModel.js       # Base model utilities
│   ├── User.js           # User model
│   └── index.js          # Model registration
├── routes/
│   ├── health.js         # Health check routes
│   ├── user.js          # User routes
│   └── index.js         # Route aggregation
├── tests/
│   ├── setup.js         # Test configuration
│   ├── health.test.js   # Health endpoint tests
│   └── user.test.js     # User API tests
├── utils/
│   ├── apiHelpers.js    # Response utilities
│   ├── fileUpload.js    # File handling
│   ├── logger.js        # Logging configuration
│   ├── sendMails.js     # Email utilities
│   ├── userValidation.js # User validation schemas
│   └── validation.js    # General validation
└── index.js             # Application entry point
```

## 🛠️ Environment Variables

### Required
```bash
DB_NAME=your_database_name
DB_USERNAME=your_db_username
JWT_SECRET=your_jwt_secret_key
```

### Optional
```bash
PORT=5000
NODE_ENV=development
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_PASSWORD=your_password
DB_SSL=false
```

## 🚨 Troubleshooting

### Database Connection Issues
1. Verify database is running
2. Check connection credentials
3. Ensure database exists
4. Check firewall settings

### Migration Errors
1. Check migration file syntax
2. Verify database permissions
3. Ensure proper column types
4. Check for existing tables/columns

### Test Failures
1. Ensure test database is separate
2. Check test environment variables
3. Verify test data cleanup
4. Check async/await patterns

## 📚 Next Steps

1. **Add Authentication**: Implement JWT token-based auth
2. **Add More Models**: Create additional database models
3. **Add Relationships**: Set up model associations
4. **Add Caching**: Implement Redis for performance
5. **Add API Documentation**: Set up Swagger/OpenAPI
6. **Add Monitoring**: Implement APM and health checks

## 🔗 Useful Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Joi Validation](https://joi.dev/api/)

---

**Happy coding! 🎉**

For detailed migration information, see [SQL_MIGRATION_GUIDE.md](./SQL_MIGRATION_GUIDE.md)