const db = require('../db');
const logger = require('../utils/logger');

/**
 * Attendee feedback model with CRUD operations
 */
const attendeeFeedback = {
  /**
   * Get all attendee feedback with optional pagination and filtering
   */
  getAll: async ({ page = 1, limit = 20, source, sentiment, startDate, endDate } = {}) => {
    const offset = (page - 1) * limit;
    const params = [];
    
    let query = 'SELECT * FROM attendee_feedback WHERE 1=1';
    
    // Add filters if provided
    if (source) {
      params.push(source);
      query += ` AND source = $${params.length}`;
    }
    
    if (sentiment) {
      params.push(sentiment);
      query += ` AND sentiment = $${params.length}`;
    }
    
    if (startDate) {
      params.push(startDate);
      query += ` AND timestamp >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      query += ` AND timestamp <= $${params.length}`;
    }
    
    // Add pagination
    query += ' ORDER BY timestamp DESC';
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;
    
    try {
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching attendee feedback:', error);
      throw error;
    }
  },
  
  /**
   * Get attendee feedback by ID
   */
  getById: async (id) => {
    try {
      const result = await db.query('SELECT * FROM attendee_feedback WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching attendee feedback with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create new attendee feedback
   */
  create: async ({ source, sentiment, message, timestamp = new Date() }) => {
    try {
      const result = await db.query(
        'INSERT INTO attendee_feedback (source, sentiment, message, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
        [source, sentiment, message, timestamp]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating attendee feedback:', error);
      throw error;
    }
  },
  
  /**
   * Update attendee feedback
   */
  update: async (id, { source, sentiment, message, timestamp }) => {
    const updates = [];
    const params = [];
    
    // Only add fields that are provided
    if (source !== undefined) {
      params.push(source);
      updates.push(`source = $${params.length}`);
    }
    
    if (sentiment !== undefined) {
      params.push(sentiment);
      updates.push(`sentiment = $${params.length}`);
    }
    
    if (message !== undefined) {
      params.push(message);
      updates.push(`message = $${params.length}`);
    }
    
    if (timestamp !== undefined) {
      params.push(timestamp);
      updates.push(`timestamp = $${params.length}`);
    }
    
    // Add updated_at timestamp
    params.push(new Date());
    updates.push(`updated_at = $${params.length}`);
    
    // Add id as the last parameter
    params.push(id);
    
    try {
      const result = await db.query(
        `UPDATE attendee_feedback SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error updating attendee feedback with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete attendee feedback
   */
  delete: async (id) => {
    try {
      const result = await db.query('DELETE FROM attendee_feedback WHERE id = $1 RETURNING *', [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error deleting attendee feedback with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get sentiment distribution by time period
   */
  getSentimentDistribution: async (timeframe = 'day') => {
    let interval;
    
    // Set appropriate time interval based on timeframe
    switch(timeframe) {
      case 'hour':
        interval = 'hour';
        break;
      case 'week':
        interval = 'day';
        break;
      case 'month':
        interval = 'day';
        break;
      default:
        interval = 'hour';
    }
    
    try {
      const query = `
        SELECT 
          date_trunc($1, timestamp) as time_period,
          sentiment,
          COUNT(*) as count
        FROM attendee_feedback
        GROUP BY time_period, sentiment
        ORDER BY time_period DESC, sentiment
      `;
      
      const result = await db.query(query, [interval]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting sentiment distribution:', error);
      throw error;
    }
  }
};

module.exports = attendeeFeedback; 