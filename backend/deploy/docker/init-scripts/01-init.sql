-- Create databases for different environments
CREATE DATABASE aeon_identity_dev;
CREATE DATABASE aeon_identity_test;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE aeon_identity TO postgres;
GRANT ALL PRIVILEGES ON DATABASE aeon_identity_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE aeon_identity_test TO postgres;