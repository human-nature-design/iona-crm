-- Run this SQL command to enable pgvector extension in your PostgreSQL database
-- This is required for the vector column in product_features table

CREATE EXTENSION IF NOT EXISTS vector;