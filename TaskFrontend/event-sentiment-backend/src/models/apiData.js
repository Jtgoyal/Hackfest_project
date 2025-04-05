const db = require('../db');
const logger = require('../utils/logger');

/**
 * API data model with CRUD operations
 */
const apiData = {
  /**
   * Get all API data records with optional pagination and filtering
   */
  getAll: async ({ page = 1, limit = 20, platform, processedFlag, startDate, endDate } = {}) => {
    const offset = (page - 1) * limit;
    const params = [];
    
    let query = 'SELECT * FROM api_data WHERE 1=1';
    
    // Add filters if provided
    if (platform) {
      params.push(platform);
      query += ` AND platform = $${params.length}`;
    }
    
    if (processedFlag !== undefined) {
      params.push(processedFlag);
      query += ` AND processed_flag = $${params.length}`;
    }
    
    if (startDate) {
      params.push(startDate);
      query += ` AND retrieved_at >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      query += ` AND retrieved_at <= $${params.length}`;
    }
    
    // Add pagination
    query += ' ORDER BY retrieved_at DESC';
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;
    
    try {
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching API data:', error);
      throw error;
    }
  },
  
  /**
   * Get API data by ID
   */
  getById: async (id) => {
    try {
      const result = await db.query('SELECT * FROM api_data WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching API data with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get unprocessed API data
   */
  getUnprocessed: async (limit = 100) => {
    try {
      const result = await db.query(
        'SELECT * FROM api_data WHERE processed_flag = FALSE ORDER BY retrieved_at ASC LIMIT $1',
        [limit]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching unprocessed API data:', error);
      throw error;
    }
  },
  
  /**
   * Create new API data record
   */
  create: async ({ platform, raw_data, processed_flag = false, retrieved_at = new Date() }) => {
    try {
      const result = await db.query(
        'INSERT INTO api_data (platform, raw_data, processed_flag, retrieved_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [platform, raw_data, processed_flag, retrieved_at]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating API data record:', error);
      throw error;
    }
  },
  
  /**
   * Batch create multiple API data records
   */
  batchCreate: async (records) => {
    // Start a transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const values = records.map(record => [
        record.platform,
        record.raw_data,
        record.processed_flag || false,
        record.retrieved_at || new Date()
      ]);
      
      // Using prepared statement for bulk insert
      const queryText = `
        INSERT INTO api_data (platform, raw_data, processed_flag, retrieved_at)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const results = [];
      for (const value of values) {
        const res = await client.query(queryText, value);
        results.push(res.rows[0]);
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error batch creating API data records:', error);
      throw error;
    } finally {
      client.release();
    }
  },
  
  /**
   * Update API data record
   */
  update: async (id, { raw_data, processed_flag }) => {
    const updates = [];
    const params = [];
    
    // Only add fields that are provided
    if (raw_data !== undefined) {
      params.push(raw_data);
      updates.push(`raw_data = $${params.length}`);
    }
    
    if (processed_flag !== undefined) {
      params.push(processed_flag);
      updates.push(`processed_flag = $${params.length}`);
    }
    
    // Add updated_at timestamp
    params.push(new Date());
    updates.push(`updated_at = $${params.length}`);
    
    // Add id as the last parameter
    params.push(id);
    
    try {
      const result = await db.query(
        `UPDATE api_data SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error updating API data with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Mark API data as processed
   */
  markAsProcessed: async (id) => {
    try {
      const result = await db.query(
        'UPDATE api_data SET processed_flag = TRUE, updated_at = $1 WHERE id = $2 RETURNING *',
        [new Date(), id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error marking API data with ID ${id} as processed:`, error);
      throw error;
    }
  },
  
  /**
   * Delete API data record
   */
  delete: async (id) => {
    try {
      const result = await db.query('DELETE FROM api_data WHERE id = $1 RETURNING *', [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error deleting API data with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get API data count by platform
   */
  getCountByPlatform: async () => {
    try {
      const query = `
        SELECT 
          platform,
          COUNT(*) as total_count,
          SUM(CASE WHEN processed_flag = TRUE THEN 1 ELSE 0 END) as processed_count,
          MAX(retrieved_at) as latest_retrieval
        FROM api_data
        GROUP BY platform
        ORDER BY total_count DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting API data count by platform:', error);
      throw error;
    }
  }
};

module.exports = apiData; 