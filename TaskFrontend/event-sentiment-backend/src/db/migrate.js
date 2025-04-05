const fs = require('fs');
const path = require('path');
const { pool } = require('./index');
const logger = require('../utils/logger');

// Load environment variables
require('dotenv').config();

const runMigrations = async () => {
  logger.info('Starting database migrations');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', '01_create_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
};

// Run migrations directly if this script is executed
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations }; 