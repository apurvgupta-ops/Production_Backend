-- Create test database
CREATE DATABASE IF NOT EXISTS backend_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON backend_dev.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON backend_test.* TO 'root'@'%';
FLUSH PRIVILEGES;