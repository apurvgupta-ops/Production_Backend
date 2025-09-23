# SQL/Sequelize Migration Guide

This document explains the complete migration from MongoDB/Mongoose to SQL databases with Sequelize ORM.

## 🔄 What Changed

### Database Layer
- **Replaced**: MongoDB + Mongoose
- **With**: SQL databases + Sequelize ORM
- **Supported databases**: MySQL, PostgreSQL, SQLite, MariaDB, MSSQL

### Key Improvements
- **ACID compliance** with SQL transactions
- **Better relationships** with foreign keys and joins
- **Schema migrations** for version control
- **Multiple database support** (dev, test, prod)
- **Connection pooling** for better performance

## 📋 Database Setup

### 1. Install Database Driver

Choose one based on your database:

```bash
# MySQL
npm install mysql2

# PostgreSQL
npm install pg pg-hstore

# SQLite (for development/testing)
npm install sqlite3

# MariaDB
npm install mariadb

# Microsoft SQL Server
npm install tedious
```

### 2. Environment Configuration

Update your `.env` file:

```bash
# Database Configuration
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_NAME_TEST=your_database_name_test
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_SSL=false

# Connection Pool Settings
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
```

### 3. Database Setup Commands

```bash
# Create database
npm run db:create

# Run migrations
npm run migrate

# Seed database with sample data
npm run seed

# Undo last migration (if needed)
npm run migrate:undo
```

## 🏗️ Database Migrations

### Creating Migrations

```bash
# Generate migration
npx sequelize-cli migration:generate --name add-new-table

# Generate model with migration
npx sequelize-cli model:generate --name Product --attributes name:string,price:decimal,description:text
```

### Migration Example

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};
```

## 📊 Model Definition

### Before (Mongoose)
```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
```

### After (Sequelize)
```javascript
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import BaseModel from './BaseModel.js';

class User extends Model {
  static associate(models) {
    // Define associations here
  }
}

User.init(
  BaseModel.addCommonFields({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'moderator'),
      allowNull: false,
      defaultValue: 'user'
    }
  }),
  BaseModel.getModelOptions('User')
);

export default User;
```

## 🔍 Query Operations

### Before (Mongoose)
```javascript
// Find all users
const users = await User.find({ role: 'user' })
  .sort({ createdAt: -1 })
  .limit(10);

// Find one user
const user = await User.findById(id);

// Create user
const user = await User.create({ name, email });

// Update user
const user = await User.findByIdAndUpdate(id, { name }, { new: true });

// Delete user
await User.findByIdAndDelete(id);
```

### After (Sequelize)
```javascript
import { Op } from 'sequelize';

// Find all users
const users = await User.findAll({
  where: { role: 'user' },
  order: [['created_at', 'DESC']],
  limit: 10
});

// Find one user
const user = await User.findByPk(id);

// Create user
const user = await User.create({ name, email });

// Update user
const [updatedCount] = await User.update({ name }, {
  where: { id },
  returning: true
});
const user = await User.findByPk(id);

// Delete user (soft delete)
const user = await User.findByPk(id);
await user.update({ is_deleted: true, deleted_at: new Date() });
```

## 🔗 Relationships

### One-to-Many Example
```javascript
// User model
User.associate = (models) => {
  User.hasMany(models.Post, {
    foreignKey: 'user_id',
    as: 'posts'
  });
};

// Post model
Post.associate = (models) => {
  Post.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'author'
  });
};

// Query with associations
const userWithPosts = await User.findByPk(id, {
  include: [{
    model: Post,
    as: 'posts'
  }]
});
```

## 🧪 Testing with Sequelize

### Test Setup
```javascript
// tests/setup.js
import { sequelize } from '../models/index.js';

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await sequelize.sync({ force: true });
});
```

### Test Example
```javascript
it('should create a user', async () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123!'
  };

  const response = await request(app)
    .post('/api/v1/users')
    .send(userData)
    .expect(201);

  // Verify in database
  const user = await User.findOne({ where: { email: userData.email } });
  expect(user).toBeTruthy();
  expect(user.name).toBe(userData.name);
});
```

## ⚡ Performance Optimizations

### 1. Indexes
```javascript
// In migration
await queryInterface.addIndex('users', ['email'], {
  name: 'users_email_index',
  unique: true
});

await queryInterface.addIndex('users', ['role', 'is_active'], {
  name: 'users_role_active_index'
});
```

### 2. Connection Pooling
```javascript
// config/database.js
const config = {
  pool: {
    max: 20,        // Maximum connections
    min: 5,         // Minimum connections
    acquire: 60000, // Maximum time to get connection
    idle: 10000     // Maximum time connection can be idle
  }
};
```

### 3. Query Optimization
```javascript
// Select specific fields
const users = await User.findAll({
  attributes: ['id', 'name', 'email'],
  where: { is_active: true }
});

// Use raw queries for complex operations
const [results] = await sequelize.query(
  'SELECT COUNT(*) as count FROM users WHERE role = ?',
  {
    replacements: ['admin'],
    type: QueryTypes.SELECT
  }
);
```

## 🚀 Deployment

### Production Environment
```bash
# Environment variables
DB_DIALECT=postgres
DB_HOST=your-prod-host
DB_PORT=5432
DB_NAME=prod_database
DB_USERNAME=prod_user
DB_PASSWORD=secure_password
DB_SSL=true
```

### Docker Setup
```dockerfile
# Dockerfile additions for database
RUN apt-get update && apt-get install -y \\n    postgresql-client \\n    mysql-client

# Wait for database
COPY wait-for-it.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-it.sh

CMD [\"wait-for-it.sh\", \"database:5432\", \"--\", \"npm\", \"start\"]
```

## 📈 Migration Checklist

- [x] Install Sequelize and database drivers
- [x] Update environment variables
- [x] Create database configuration
- [x] Convert models from Mongoose to Sequelize
- [x] Update controllers to use Sequelize queries
- [x] Create migrations and seeders
- [x] Update error handling for Sequelize errors
- [x] Update tests to work with SQL database
- [x] Update validation utilities
- [x] Test all CRUD operations
- [x] Verify relationships work correctly
- [x] Performance test with indexes
- [x] Deploy to staging environment
- [x] Run integration tests
- [x] Deploy to production

## 🆘 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify database is running
   - Check connection string
   - Ensure user has proper permissions

2. **Migration Failures**
   - Check for syntax errors
   - Verify column types are supported
   - Ensure proper transaction handling

3. **Query Errors**
   - Use Sequelize logging to debug
   - Check for proper associations
   - Verify where clause syntax

4. **Performance Issues**
   - Add appropriate indexes
   - Use connection pooling
   - Optimize query patterns

This completes the migration from MongoDB to SQL with Sequelize! 🎉