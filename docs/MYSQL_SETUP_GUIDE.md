# MySQL Setup Guide

## Current Status
✅ **Your application is now working with SQLite as a temporary solution**
🔄 **Follow this guide to switch to MySQL when ready**

## Option 1: Using Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running

### Steps
1. **Start Docker Desktop** (ensure it's running)

2. **Start MySQL container:**
   ```bash
   docker-compose up -d mysql
   ```

3. **Verify MySQL is running:**
   ```bash
   docker ps
   ```

4. **Update .env file:**
   ```env
   DB_DIALECT=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=backend_dev
   DB_NAME_TEST=backend_test
   DB_USERNAME=root
   DB_PASSWORD=password
   DB_SSL=false
   ```

5. **Restart your application:**
   ```bash
   npm start
   ```

## Option 2: Local MySQL Installation

### Windows Installation
1. **Download MySQL Installer** from [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. **Install MySQL Server** with these settings:
   - Root password: `password` (or update .env accordingly)
   - Port: `3306`
   - Authentication: Use Legacy Authentication Method

3. **Create databases:**
   ```sql
   CREATE DATABASE backend_dev;
   CREATE DATABASE backend_test;
   ```

4. **Update .env file** (same as Docker option above)

## Option 3: Using XAMPP/WAMP

### If you have XAMPP installed:
1. **Start XAMPP Control Panel**
2. **Start MySQL service**
3. **Open phpMyAdmin** (http://localhost/phpmyadmin)
4. **Create databases:**
   - `backend_dev`
   - `backend_test`
5. **Update .env file** with these credentials:
   ```env
   DB_DIALECT=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=backend_dev
   DB_NAME_TEST=backend_test
   DB_USERNAME=root
   DB_PASSWORD=
   DB_SSL=false
   ```

## Testing the Connection

After setting up MySQL, test your connection:

```bash
# Stop the current server (Ctrl+C)
# Update .env file to use mysql
# Restart the server
npm start
```

You should see:
```
info: ✅ Database Connected: localhost:3306/backend_dev (mysql)
```

## Troubleshooting

### Common Issues:

1. **"Access denied for user 'root'@'localhost'"**
   - Check MySQL root password
   - Update DB_PASSWORD in .env file

2. **"Connection refused"**
   - Ensure MySQL server is running
   - Check if port 3306 is available

3. **"Database doesn't exist"**
   - Create the database manually:
     ```sql
     CREATE DATABASE backend_dev;
     CREATE DATABASE backend_test;
     ```

### Test Database Connection:
```bash
# Test the specific API endpoint
curl http://localhost:5000/api/v1/users

# Run tests
npm test
```

## Benefits of MySQL over SQLite

- **Better performance** for concurrent operations
- **Production-ready** scalability
- **Advanced features** like stored procedures, triggers
- **Better data types** and constraints
- **Replication support** for high availability

## Current Temporary Setup

Your application is currently using SQLite which works perfectly for:
- ✅ Development and testing
- ✅ All API functionality
- ✅ All tests passing
- ✅ Quick prototyping

Switch to MySQL when you need production-grade database features.