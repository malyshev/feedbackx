-- Enable UUID extension for PostgreSQL
-- This extension is required for the uuid-ossp functions used by TypeORM's @PrimaryGeneratedColumn('uuid')
-- Runs automatically on first database initialization via /docker-entrypoint-initdb.d/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
