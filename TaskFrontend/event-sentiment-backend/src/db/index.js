const { Pool } = require('pg');
const logger = require('../utils/logger');

// Create a PostgreSQL connection pool using environment variables
const pool = new Pool();

// Test the database connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL connection error:', err);
  process.exit(-1);
});

// Helper function to run SQL queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Query executed in ${duration}ms: ${text}`);
    return res;
  } catch (error) {
    logger.error(`Error executing query: ${text}`, error);
    throw error;
  }
};

module.exports = {
  query,
  pool
}; 