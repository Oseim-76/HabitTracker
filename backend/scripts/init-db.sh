#!/bin/bash

# Switch to postgres user (you might need sudo for this)
sudo -u postgres psql <<EOF

-- Create user if not exists
DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres'
  ) THEN
    CREATE USER postgres WITH PASSWORD 'postgres' CREATEDB;
  END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE habittracker'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'habittracker');

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE habittracker TO postgres;

EOF

echo "Database initialized successfully" 