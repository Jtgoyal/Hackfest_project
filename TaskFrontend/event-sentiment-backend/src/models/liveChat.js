const db = require('../db');
const logger = require('../utils/logger');

/**
 * Live chat model with CRUD operations
 */
const liveChat = {
  /**
   * Get all live chats with optional pagination and filtering
   */
  getAll: async ({ page = 1, limit = 20, userId, sessionId, minSentiment, maxSentiment, startDate, endDate } = {}) => {
    const offset = (page - 1) * limit;
    const params = [];
    
    let query = 'SELECT * FROM live_chats WHERE 1=1';
    
    // Add filters if provided
    if (userId) {
      params.push(userId);
      query += ` AND user_id = $${params.length}`;
    }
    
    if (sessionId) {
      params.push(sessionId);
      query += ` AND session_id = $${params.length}`;
    }
    
    if (minSentiment !== undefined) {
      params.push(minSentiment);
      query += ` AND sentiment_score >= $${params.length}`;
    }
    
    if (maxSentiment !== undefined) {
      params.push(maxSentiment);
      query += ` AND sentiment_score <= $${params.length}`;
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
      logger.error('Error fetching live chats:', error);
      throw error;
    }
  },
  
  /**
   * Get live chat by ID
   */
  getById: async (id) => {
    try {
      const result = await db.query('SELECT * FROM live_chats WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching live chat with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get chats by session ID
   */
  getBySessionId: async (sessionId) => {
    try {
      const result = await db.query('SELECT * FROM live_chats WHERE session_id = $1 ORDER BY timestamp ASC', [sessionId]);
      return result.rows;
    } catch (error) {
      logger.error(`Error fetching live chats for session ID ${sessionId}:`, error);
      throw error;
    }
  },
  
  /**
   * Create new live chat message
   */
  create: async ({ user_id, session_id, message, sentiment_score, timestamp = new Date() }) => {
    try {
      const result = await db.query(
        'INSERT INTO live_chats (user_id, session_id, message, sentiment_score, timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user_id, session_id, message, sentiment_score, timestamp]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating live chat message:', error);
      throw error;
    }
  },
  
  /**
   * Update live chat message
   */
  update: async (id, { message, sentiment_score }) => {
    const updates = [];
    const params = [];
    
    // Only add fields that are provided
    if (message !== undefined) {
      params.push(message);
      updates.push(`message = $${params.length}`);
    }
    
    if (sentiment_score !== undefined) {
      params.push(sentiment_score);
      updates.push(`sentiment_score = $${params.length}`);
    }
    
    // Add updated_at timestamp
    params.push(new Date());
    updates.push(`updated_at = $${params.length}`);
    
    // Add id as the last parameter
    params.push(id);
    
    try {
      const result = await db.query(
        `UPDATE live_chats SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error updating live chat with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete live chat message
   */
  delete: async (id) => {
    try {
      const result = await db.query('DELETE FROM live_chats WHERE id = $1 RETURNING *', [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error deleting live chat with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get average sentiment by session
   */
  getSentimentBySession: async () => {
    try {
      const query = `
        SELECT 
          session_id,
          AVG(sentiment_score) as avg_sentiment,
          COUNT(*) as message_count,
          MIN(timestamp) as session_start,
          MAX(timestamp) as session_end
        FROM live_chats
        GROUP BY session_id
        ORDER BY session_start DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting average sentiment by session:', error);
      throw error;
    }
  },
  
  /**
   * Get sentiment trend over time
   */
  getSentimentTrend: async (interval = 'hour', limit = 24) => {
    try {
      const query = `
        SELECT 
          date_trunc($1, timestamp) as time_period,
          AVG(sentiment_score) as avg_sentiment,
          COUNT(*) as message_count
        FROM live_chats
        GROUP BY time_period
        ORDER BY time_period DESC
        LIMIT $2
      `;
      
      const result = await db.query(query, [interval, limit]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting sentiment trend:', error);
      throw error;
    }
  }
};

module.exports = liveChat; 